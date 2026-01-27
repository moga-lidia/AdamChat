const BASE_URL = 'https://ai.chatbot.zaha.tech/chatbot-ai/stream-assistant';

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
): AbortController {
  const controller = new AbortController();

  const params = new URLSearchParams({
    prompt,
    sessionId,
    lang,
  });

  const url = `${BASE_URL}?${params.toString()}`;

  let conversationHistoryId: number | undefined;

  fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

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
      }

      callbacks.onDone(conversationHistoryId);
    })
    .catch((err: Error) => {
      if (err.name !== 'AbortError') {
        callbacks.onError(err);
      }
    });

  return controller;
}
