import { parseSseData } from "@/services/chat-api";
import { useCallback, useRef } from "react";
import { StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

interface Props {
  url: string | null;
  onToken: (token: string) => void;
  onDone: (conversationHistoryId?: number) => void;
  onError: () => void;
}

/**
 * Hidden WebView that loads the chat server's page, then injects
 * an EventSource script. This runs on the real domain origin so
 * the server accepts the connection.
 */
export function SseWebView({ url, onToken, onDone, onError }: Props) {
  const webViewRef = useRef<WebView>(null);
  const historyIdRef = useRef<number | undefined>(undefined);
  const receivedData = useRef(false);
  const injectedRef = useRef(false);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      console.log("[SSE] Message:", event.nativeEvent.data.substring(0, 300));
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
          console.log("[SSE] Done event");
          onDone(historyIdRef.current);
          receivedData.current = false;
          historyIdRef.current = undefined;
        } else if (msg.type === "error") {
          console.log("[SSE] Error event, hadData:", receivedData.current);
          if (receivedData.current) {
            onDone(historyIdRef.current);
          } else {
            onError();
          }
          receivedData.current = false;
          historyIdRef.current = undefined;
        } else if (msg.type === "log") {
          console.log("[SSE-WV]", msg.message);
        }
      } catch (e) {
        console.error("[SSE] Parse error:", e);
      }
    },
    [onToken, onDone, onError],
  );

  const handleLoadEnd = useCallback(() => {
    if (!url || injectedRef.current) return;
    injectedRef.current = true;

    const script = `
      (function() {
        // First test: can we even fetch the endpoint?
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'log', message: 'Testing fetch to: ' + ${JSON.stringify(url)}.substring(0, 80)
        }));
        fetch(${JSON.stringify(url)}, {
          headers: { 'Accept': 'text/event-stream' }
        }).then(function(res) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'log', message: 'Fetch status: ' + res.status + ' type: ' + res.headers.get('content-type')
          }));
          return res.text();
        }).then(function(body) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'log', message: 'Fetch body (first 300): ' + body.substring(0, 300)
          }));
          // Parse SSE data lines
          var lines = body.split('\\n');
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            if (line.indexOf('data:') === 0) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'data', payload: line.substring(5)
              }));
            }
          }
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'done' }));
        }).catch(function(err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'log', message: 'Fetch error: ' + err.message
          }));
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error' }));
        });
      })();
      true;
    `;

    console.log("[SSE] Page loaded, injecting EventSource script");
    webViewRef.current?.injectJavaScript(script);
  }, [url]);

  if (!url) {
    injectedRef.current = false;
    return null;
  }

  console.log("[SSE] Loading server page before EventSource");

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
