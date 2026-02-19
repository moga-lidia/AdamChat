import * as Crypto from "expo-crypto";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import { useI18n } from "@/hooks/use-i18n";
import {
  appendMessage,
  clearSession,
  createSession,
  loadSession,
  saveSession,
  setSessionLang,
} from "@/services/storage";
import type { ChatMessage, ChatSession, Lang } from "@/types/chat";

interface ChatSessionContextValue {
  session: ChatSession | null;
  setSession: React.Dispatch<React.SetStateAction<ChatSession | null>>;
  /** Set language on the session AND i18n provider */
  initSession: (lang: Lang, welcomeMessage: string) => ChatSession;
  /** Clear everything and return a fresh session */
  resetSession: () => Promise<void>;
  addMessage: (message: ChatMessage) => void;
}

const ChatSessionContext = createContext<ChatSessionContextValue>({
  session: null,
  setSession: () => {},
  initSession: () => createSession(""),
  resetSession: async () => {},
  addMessage: () => {},
});

export function ChatSessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<ChatSession | null>(null);
  const { setLang } = useI18n();

  // Load session on mount
  useEffect(() => {
    (async () => {
      const existing = await loadSession();
      if (existing) {
        setSession(existing);
        if (existing.lang) {
          setLang(existing.lang);
        }
      } else {
        const id = Crypto.randomUUID();
        setSession(createSession(id));
      }
    })();
  }, [setLang]);

  // Persist session on change
  useEffect(() => {
    if (session) saveSession(session);
  }, [session]);

  const initSession = useCallback(
    (lang: Lang, welcomeMessage: string): ChatSession => {
      if (!session) throw new Error("Session not initialized");
      const withLang = setSessionLang(session, lang);
      const msg: ChatMessage = {
        id: Crypto.randomUUID(),
        role: "assistant",
        content: welcomeMessage,
        timestamp: Date.now(),
      };
      const withWelcome = appendMessage(withLang, msg);
      setSession(withWelcome);
      return withWelcome;
    },
    [session],
  );

  const resetSession = useCallback(async () => {
    await clearSession();
    const id = Crypto.randomUUID();
    setSession(createSession(id));
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setSession((prev) => (prev ? appendMessage(prev, message) : prev));
  }, []);

  return (
    <ChatSessionContext.Provider
      value={{ session, setSession, initSession, resetSession, addMessage }}
    >
      {children}
    </ChatSessionContext.Provider>
  );
}

export function useChatSessionContext() {
  return useContext(ChatSessionContext);
}
