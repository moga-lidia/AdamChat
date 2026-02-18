import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage, ChatSession, Lang } from '@/types/chat';

const SESSION_KEY = 'adam_chat_session';

export async function loadSession(): Promise<ChatSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ChatSession;
  } catch {
    return null;
  }
}

export async function saveSession(session: ChatSession): Promise<void> {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // silently fail — non-critical
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch {
    // silently fail
  }
}

export function createSession(sessionId: string): ChatSession {
  return {
    id: sessionId,
    lang: null,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function setSessionLang(session: ChatSession, lang: Lang): ChatSession {
  return { ...session, lang, updatedAt: Date.now() };
}

export function appendMessage(session: ChatSession, message: ChatMessage): ChatSession {
  return {
    ...session,
    messages: [...session.messages, message],
    updatedAt: Date.now(),
  };
}
