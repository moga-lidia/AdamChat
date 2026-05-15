import { parseSseData } from "@/services/chat-api";
import { useCallback, useEffect, useRef } from "react";
import { Platform, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

interface Props {
  url: string | null;
  onToken: (token: string) => void;
  onDone: (conversationHistoryId?: number) => void;
  onError: () => void;
}

/**
 * Always-mounted hidden WebView that loads the chat server's page,
 * then injects an EventSource script when a URL is provided.
 * Runs on the real domain origin so the server accepts the connection.
 */
export function SseWebView({ url, onToken, onDone, onError }: Props) {
  const webViewRef = useRef<WebView>(null);
  const historyIdRef = useRef<number | undefined>(undefined);
  const receivedData = useRef(false);
  const pageLoaded = useRef(false);
  const activeUrl = useRef<string | null>(null);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const msg = JSON.parse(event.nativeEvent.data);
        console.log("[SSE] raw message:", JSON.stringify(msg));

        // Ignore events when no active URL (stale events from previous streams)
        if (!activeUrl.current && msg.type !== "data") {
          console.log("[SSE] ignoring stale event, no active URL");
          return;
        }

        if (msg.type === "data") {
          if (!activeUrl.current) {
            console.log("[SSE] ignoring stale data event");
            return;
          }
          receivedData.current = true;
          const parsed = parseSseData(msg.payload);
          console.log("[SSE] parsed data:", JSON.stringify(parsed));
          if (parsed?.tokenText) {
            onToken(parsed.tokenText);
          }
          if (parsed?.conversationHistoryId) {
            historyIdRef.current = parsed.conversationHistoryId;
          }
        } else if (msg.type === "done") {
          if (receivedData.current) {
            onDone(historyIdRef.current);
          }
          receivedData.current = false;
          historyIdRef.current = undefined;
          activeUrl.current = null;
        } else if (msg.type === "error") {
          if (receivedData.current) {
            onDone(historyIdRef.current);
          } else {
            onError();
          }
          receivedData.current = false;
          historyIdRef.current = undefined;
          activeUrl.current = null;
        }
      } catch (e) {
        console.error("[SSE] Parse error:", e);
      }
    },
    [onToken, onDone, onError],
  );

  const injectEventSource = useCallback((targetUrl: string) => {
    const script = `
      (function() {
        try {
          // Close any previous EventSource to prevent stale events
          if (window._sseSource) {
            window._sseSource.close();
            window._sseSource = null;
          }
          var source = new EventSource(${JSON.stringify(targetUrl)});
          window._sseSource = source;
          var closed = false;
          source.onmessage = function(e) {
            if (closed) return;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'data', payload: e.data
            }));
          };
          source.onerror = function() {
            if (closed) return;
            closed = true;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: source.readyState === 2 ? 'error' : 'done'
            }));
            source.close();
            window._sseSource = null;
          };
        } catch(err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error' }));
        }
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  }, []);

  const handleLoadEnd = useCallback(() => {
    pageLoaded.current = true;
    // If a URL was queued before the page loaded, inject now
    if (activeUrl.current) {
      injectEventSource(activeUrl.current);
    }
  }, [injectEventSource]);

  // When url changes, inject the EventSource script
  useEffect(() => {
    activeUrl.current = url;
    if (!url) {
      receivedData.current = false;
      historyIdRef.current = undefined;
      return;
    }
    if (pageLoaded.current) {
      injectEventSource(url);
    }
    // If page hasn't loaded yet, handleLoadEnd will pick it up
  }, [url, injectEventSource]);

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: "https://academiasperanta.ro/" }}
      onLoadEnd={handleLoadEnd}
      onMessage={handleMessage}
      style={styles.hidden}
      javaScriptEnabled
      originWhitelist={["*"]}
      userAgent={
        Platform.OS === "ios"
          ? "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1"
          : "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
      }
    />
  );
}

const styles = StyleSheet.create({
  hidden: {
    width: 1,
    height: 1,
    position: "absolute",
    top: -9999,
    left: -9999,
  },
});
