const BASE_URL = "https://ai.chatbot.zaha.tech/chatbot-ai/stream-assistant";

interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (conversationHistoryId?: number) => void;
  onError: (error: Error) => void;
}

export function streamResponse(
  prompt: string,
  sessionId: string,
  lang: string,
  callbacks: StreamCallbacks,
): { abort: () => void } {
  const params = new URLSearchParams({
    prompt,
    sessionId,
    lang,
  });

  const url = `${BASE_URL}?${params.toString()}`;

  // Use XMLHttpRequest for streaming — works on React Native / Expo Go
  const xhr = new XMLHttpRequest();
  let processedLength = 0;
  let conversationHistoryId: number | undefined;

  xhr.open("GET", url, true);
  xhr.setRequestHeader("Accept", "text/event-stream");
  xhr.setRequestHeader("Cache-Control", "no-cache");

  xhr.onprogress = () => {
    const newText = xhr.responseText.substring(processedLength);
    processedLength = xhr.responseText.length;

    const lines = newText.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const jsonStr = trimmed.slice(5);
      if (!jsonStr) continue;

      try {
        const data = JSON.parse(jsonStr);
        if (data.tokenText) {
          callbacks.onToken(data.tokenText);
        }
        if (data.conversationHistoryId) {
          conversationHistoryId = data.conversationHistoryId;
        }
      } catch {
        // malformed JSON chunk — skip
      }
    }
  };

  xhr.onloadend = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      callbacks.onDone(conversationHistoryId);
    } else if (xhr.status > 0) {
      callbacks.onError(new Error(`HTTP ${xhr.status}`));
    }
  };

  xhr.onerror = () => {
    callbacks.onError(new Error("Network error"));
  };

  xhr.ontimeout = () => {
    callbacks.onError(new Error("Request timeout"));
  };

  xhr.timeout = 60000;
  xhr.send();

  return {
    abort: () => xhr.abort(),
  };
}
