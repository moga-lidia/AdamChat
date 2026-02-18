const BASE_URL = "https://ai.chatbot.zaha.tech/chatbot-ai/stream-assistant";

interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (conversationHistoryId?: number) => void;
  onError: (error: Error) => void;
}

/**
 * Build the SSE URL for a chat request.
 * The actual fetch happens inside a WebView (see SseWebView component)
 * to bypass TLS fingerprinting on the server.
 */
export function buildStreamUrl(
  prompt: string,
  sessionId: string,
  lang: string,
): string {
  const params = new URLSearchParams({ prompt, sessionId, lang });
  return `${BASE_URL}?${params.toString()}`;
}

/**
 * Generate the HTML that runs inside the hidden WebView.
 * It opens an EventSource connection and posts each SSE message
 * back to React Native via postMessage.
 */
export function buildSseHtml(url: string): string {
  return `
<!DOCTYPE html>
<html><body><script>
  try {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'log',
      message: 'Opening EventSource: ' + ${JSON.stringify(url)}.substring(0, 100)
    }));
    var source = new EventSource(${JSON.stringify(url)});
    source.onopen = function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'log',
        message: 'EventSource connected, readyState: ' + source.readyState
      }));
    };
    source.onmessage = function(e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'data',
        payload: e.data
      }));
    };
    source.onerror = function(e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'log',
        message: 'EventSource error, readyState: ' + source.readyState
      }));
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'error'
      }));
      source.close();
    };
  } catch(err) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'error',
      message: err.message
    }));
  }
</script></body></html>`;
}

/** Parse an SSE data string into token + conversationHistoryId. */
export function parseSseData(raw: string): {
  tokenText?: string;
  conversationHistoryId?: number;
} | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
