import { parseSseData } from "@/services/chat-api";
import { useCallback, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
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

        if (msg.type === "data") {
          receivedData.current = true;
          const parsed = parseSseData(msg.payload);
          if (parsed?.tokenText) {
            onToken(parsed.tokenText);
          }
          if (parsed?.conversationHistoryId) {
            historyIdRef.current = parsed.conversationHistoryId;
          }
        } else if (msg.type === "done") {
          onDone(historyIdRef.current);
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
          var source = new EventSource(${JSON.stringify(targetUrl)});
          source.onmessage = function(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'data', payload: e.data
            }));
          };
          source.onerror = function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: source.readyState === 2 ? 'error' : 'done'
            }));
            source.close();
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
      source={{ uri: "https://ai.chatbot.zaha.tech/" }}
      onLoadEnd={handleLoadEnd}
      onMessage={handleMessage}
      style={styles.hidden}
      javaScriptEnabled
      originWhitelist={["*"]}
      userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1"
    />
  );
}

const styles = StyleSheet.create({
  hidden: {
    width: 0,
    height: 0,
    opacity: 0,
    position: "absolute",
  },
});
