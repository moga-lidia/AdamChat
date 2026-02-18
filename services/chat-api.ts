const BASE_URL = "https://ai.chatbot.zaha.tech/chatbot-ai/stream-assistant";

/**
 * Build the SSE URL for a chat request.
 * The actual connection happens inside a WebView (see SseWebView component)
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
