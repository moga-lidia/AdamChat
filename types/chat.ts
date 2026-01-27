export type Lang = 'ro' | 'en' | 'hu';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  conversationHistoryId?: number;
}

export interface ChatSession {
  id: string;
  lang: Lang | null;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}
