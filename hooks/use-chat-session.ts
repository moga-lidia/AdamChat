import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, FlatList, Keyboard } from "react-native";

import { useChatSessionContext } from "@/contexts/chat-session-context";
import { useI18n } from "@/hooks/use-i18n";
import { buildStreamUrl } from "@/services/chat-api";
import type { ChatMessage } from "@/types/chat";

/**
 * Encapsulates SSE streaming, message sending, and scroll-to-bottom logic
 * for the chat screen. Consumes session from ChatSessionContext.
 */
export function useChatSession() {
  const { session, addMessage } = useChatSessionContext();
  const { t } = useI18n();

  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sseUrl, setSseUrl] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const accumulatedRef = useRef("");

  // Scroll to bottom on new messages or streaming
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [session?.messages.length, streamingText]);

  const handleSseToken = useCallback((token: string) => {
    accumulatedRef.current += token;
    setStreamingText(accumulatedRef.current);
  }, []);

  const handleSseDone = useCallback(
    (conversationHistoryId?: number) => {
      const content = accumulatedRef.current;
      if (content) {
        const assistantMessage: ChatMessage = {
          id: Crypto.randomUUID(),
          role: "assistant",
          content,
          timestamp: Date.now(),
          conversationHistoryId,
        };
        addMessage(assistantMessage);
      }
      setStreamingText("");
      setIsStreaming(false);
      setSseUrl(null);
      accumulatedRef.current = "";
    },
    [addMessage],
  );

  const handleSseError = useCallback(() => {
    const errorMessage: ChatMessage = {
      id: Crypto.randomUUID(),
      role: "assistant",
      content: t.chat.errorMessage,
      timestamp: Date.now(),
      isError: true,
    };
    addMessage(errorMessage);
    setStreamingText("");
    setIsStreaming(false);
    setSseUrl(null);
    accumulatedRef.current = "";
  }, [t, addMessage]);

  const sendMessage = useCallback(
    async (prompt: string, displayText?: string) => {
      if (!session || isStreaming || !session.lang) return;

      Keyboard.dismiss();

      // Check connectivity before sending
      try {
        await fetch("https://academiasperanta.ro", { method: "HEAD" });
      } catch {
        Alert.alert("", t.chat.noConnection);
        return;
      }

      const userMessage: ChatMessage = {
        id: Crypto.randomUUID(),
        role: "user",
        content: displayText ?? prompt,
        timestamp: Date.now(),
      };

      addMessage(userMessage);
      setIsStreaming(true);
      setStreamingText("");
      accumulatedRef.current = "";

      const url = buildStreamUrl(prompt, session.id, session.lang);
      setSseUrl(url);
    },
    [session, isStreaming, t, addMessage],
  );

  // Build display messages (real messages + streaming placeholder)
  const messages = session?.messages ?? [];
  const displayMessages: ChatMessage[] = [
    ...messages,
    ...(isStreaming
      ? [
          {
            id: "_streaming",
            role: "assistant" as const,
            content: streamingText || t.chat.streamingPlaceholder,
            timestamp: Date.now(),
          },
        ]
      : []),
  ];

  const lastMessage = session?.messages[session.messages.length - 1];
  const showQuickActions =
    session?.lang &&
    !isStreaming &&
    ((session?.messages.length ?? 0) <= 2 || lastMessage?.isError);

  const resetStreaming = useCallback(() => {
    setSseUrl(null);
    setIsStreaming(false);
    setStreamingText("");
    accumulatedRef.current = "";
  }, []);

  return {
    displayMessages,
    isStreaming,
    streamingText,
    showQuickActions,
    sseUrl,
    flatListRef,
    sendMessage,
    handleSseToken,
    handleSseDone,
    handleSseError,
    resetStreaming,
  };
}
