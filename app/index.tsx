import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatInput } from "@/components/chat-input";
import { ChatMessage } from "@/components/chat-message";
import { useThemeColor } from "@/hooks/use-theme-color";
import { streamResponse } from "@/services/chat-api";
import {
  appendMessage,
  clearSession,
  createSession,
  loadSession,
  saveSession,
  setSessionLang,
} from "@/services/storage";
import type {
  ChatMessage as ChatMessageType,
  ChatSession,
  Lang,
} from "@/types/chat";

const LANG_MESSAGES = [
  "Salut! Inainte de a incepe, te rog sa selectezi limba preferata.",
  "Hello! Before we begin, please select your preferred language.",
  "Udvozlom! Mielott elkezdenénk, kerjuk, valassza ki a kivant nyelvet.",
];

const LANG_OPTIONS: { label: string; value: Lang }[] = [
  { label: "Romana", value: "ro" },
  { label: "English", value: "en" },
  { label: "Magyar", value: "hu" },
];

const WELCOME_MESSAGES: Record<Lang, string> = {
  ro: "Buna! Sunt aici sa te ajut cu raspunsuri la intrebari despre Biblie si viata spirituala. Spune-mi, te rog, cu ce pot incepe?",
  en: "Hello! I am here to help you with answers to questions about the Bible and spiritual life. Please tell me, how can I help?",
  hu: "Szia! Azért vagyok itt, hogy segítsek a Bibliával és a lelki élettel kapcsolatos kérdéseidben. Kérlek, mondd el, miben segíthetek?",
};

interface QuickAction {
  label: string;
  prompt: string;
}

const QUICK_ACTIONS: Record<Lang, QuickAction[]> = {
  ro: [
    { label: "Motiveaza-ma", prompt: "MOTIVATION" },
    { label: "Spune-mi ceva ce nu stiu", prompt: "TELL_ME_SOMETHING" },
    { label: "Meditatia zilei", prompt: "DAILY_MEDITATION" },
  ],
  en: [
    { label: "Motivate me", prompt: "MOTIVATION" },
    { label: "Tell me something I don't know", prompt: "TELL_ME_SOMETHING" },
    { label: "Daily meditation", prompt: "DAILY_MEDITATION" },
  ],
  hu: [
    { label: "Motiválj", prompt: "MOTIVATION" },
    { label: "Mondj valamit, amit nem tudok", prompt: "TELL_ME_SOMETHING" },
    { label: "A nap meditációja", prompt: "DAILY_MEDITATION" },
  ],
};

// ── Header component (shared across all screens) ──
function Header({
  insets,
  headerBg,
  borderColor,
  rightAction,
}: {
  insets: { top: number };
  headerBg: string;
  borderColor: string;
  rightAction?: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: headerBg,
          borderBottomColor: borderColor,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>✝</Text>
        </View>
        <Text style={styles.logoText}>ADAM</Text>
      </View>
      {rightAction}
    </View>
  );
}

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const bg = useThemeColor({ light: "#F5F5F5", dark: "#111" }, "background");
  const headerBg = useThemeColor(
    { light: "#FFFFFF", dark: "#1A1A1A" },
    "background",
  );
  const borderColor = useThemeColor({ light: "#E0E0E0", dark: "#333" }, "icon");
  const textColor = useThemeColor({}, "text");
  const subtitleColor = useThemeColor({ light: "#777", dark: "#888" }, "icon");
  const bubbleBg = useThemeColor(
    { light: "#EDEDEE", dark: "#2A2A2A" },
    "background",
  );

  type Screen = "welcome" | "lang" | "chat";
  const [screen, setScreen] = useState<Screen>("welcome");
  const [session, setSession] = useState<ChatSession | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load session on mount
  useEffect(() => {
    (async () => {
      const existing = await loadSession();
      if (existing) {
        setSession(existing);
        if (existing.messages.length > 0 && existing.lang) {
          setScreen("chat");
        } else if (existing.lang) {
          setScreen("chat");
        }
      } else {
        const id = Crypto.randomUUID();
        setSession(createSession(id));
      }
    })();
  }, []);

  // Persist session on change
  useEffect(() => {
    if (session) saveSession(session);
  }, [session]);

  // Scroll to bottom
  useEffect(() => {
    if (screen !== "chat") return;
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [session?.messages.length, streamingText, screen]);

  const handleStart = () => setScreen("lang");

  const handleLangSelect = (lang: Lang) => {
    if (!session) return;
    const langLabel = LANG_OPTIONS.find((o) => o.value === lang)!.label;
    const withLang = setSessionLang(session, lang);
    // Add the language choice as a user message
    const langMsg: ChatMessageType = {
      id: Crypto.randomUUID(),
      role: "user",
      content: langLabel,
      timestamp: Date.now(),
    };
    const withUserMsg = appendMessage(withLang, langMsg);
    // Add the welcome assistant message
    const welcomeMsg: ChatMessageType = {
      id: Crypto.randomUUID(),
      role: "assistant",
      content: WELCOME_MESSAGES[lang],
      timestamp: Date.now(),
    };
    const withWelcome = appendMessage(withUserMsg, welcomeMsg);
    setSession(withWelcome);
    setScreen("chat");
  };

  const sendMessage = useCallback(
    (prompt: string, displayText?: string) => {
      if (!session || isStreaming || !session.lang) return;

      const userMessage: ChatMessageType = {
        id: Crypto.randomUUID(),
        role: "user",
        content: displayText ?? prompt,
        timestamp: Date.now(),
      };

      const updatedSession = appendMessage(session, userMessage);
      setSession(updatedSession);
      setIsStreaming(true);
      setStreamingText("");

      let accumulated = "";

      abortRef.current = streamResponse(prompt, session.id, session.lang, {
        onToken: (token) => {
          accumulated += token;
          setStreamingText(accumulated);
        },
        onDone: (conversationHistoryId) => {
          const assistantMessage: ChatMessageType = {
            id: Crypto.randomUUID(),
            role: "assistant",
            content: accumulated,
            timestamp: Date.now(),
            conversationHistoryId,
          };
          setSession((prev) =>
            prev ? appendMessage(prev, assistantMessage) : prev,
          );
          setStreamingText("");
          setIsStreaming(false);
          abortRef.current = null;
        },
        onError: () => {
          const errorMessage: ChatMessageType = {
            id: Crypto.randomUUID(),
            role: "assistant",
            content: "Ne pare rau, a aparut o eroare. Incearca din nou.",
            timestamp: Date.now(),
            isError: true,
          };
          setSession((prev) =>
            prev ? appendMessage(prev, errorMessage) : prev,
          );
          setStreamingText("");
          setIsStreaming(false);
          abortRef.current = null;
        },
      });
    },
    [session, isStreaming],
  );

  const handleNewChat = useCallback(() => {
    Alert.alert(
      "Conversatie noua",
      "Sigur vrei sa stergi conversatia curenta?",
      [
        { text: "Anuleaza", style: "cancel" },
        {
          text: "Da",
          style: "destructive",
          onPress: async () => {
            if (abortRef.current) {
              abortRef.current.abort();
              abortRef.current = null;
            }
            setIsStreaming(false);
            setStreamingText("");
            await clearSession();
            const id = Crypto.randomUUID();
            setSession(createSession(id));
            setScreen("lang");
          },
        },
      ],
    );
  }, []);

  // ── Welcome Screen ──
  if (screen === "welcome") {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <Header insets={insets} headerBg={headerBg} borderColor={borderColor} />
        <View style={styles.welcomeBody}>
          <Text style={[styles.welcomeText, { color: textColor }]}>
            Conecteaza-te in portal si bucura-te de toate avantajele: pastrezi
            automat raspunsurile, poti relua oricand discutiile anterioare si ai
            totul sincronizat pe orice dispozitiv.
          </Text>
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startButton,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.startButtonText}>START</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Language Selection Screen ──
  if (screen === "lang") {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;

    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <Header insets={insets} headerBg={headerBg} borderColor={borderColor} />
        <ScrollView contentContainerStyle={styles.langBody}>
          {LANG_MESSAGES.map((msg, i) => (
            <View key={i} style={styles.langMessageRow}>
              <View style={styles.logo}>
                <Text style={styles.logoIcon}>✝</Text>
              </View>
              <View style={styles.langBubbleWrap}>
                <View
                  style={[styles.langBubble, { backgroundColor: bubbleBg }]}
                >
                  <Text style={[styles.langBubbleText, { color: textColor }]}>
                    {msg}
                  </Text>
                </View>
                <Text style={[styles.langTime, { color: subtitleColor }]}>
                  {timeStr}
                </Text>
              </View>
            </View>
          ))}

          {/* Language buttons */}
          <View style={styles.langButtons}>
            {LANG_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => handleLangSelect(opt.value)}
                style={({ pressed }) => [
                  styles.langButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.langButtonText}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Chat Screen ──
  // Show quick actions after language selection (2 initial messages) or after an error
  const lastMessage = session?.messages[session.messages.length - 1];
  const showQuickActions =
    session?.lang &&
    !isStreaming &&
    ((session?.messages.length ?? 0) <= 2 || lastMessage?.isError);
  const messages = session?.messages ?? [];
  const displayMessages: ChatMessageType[] = [
    ...messages,
    ...(isStreaming && streamingText
      ? [
          {
            id: "_streaming",
            role: "assistant" as const,
            content: streamingText,
            timestamp: Date.now(),
          },
        ]
      : []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Header
        insets={insets}
        headerBg={headerBg}
        borderColor={borderColor}
        rightAction={
          <Pressable
            onPress={handleNewChat}
            style={({ pressed }) => [
              styles.newChatButton,
              { borderColor, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={styles.newChatButtonText}>+</Text>
          </Pressable>
        }
      />

      <FlatList
        ref={flatListRef}
        data={displayMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessage message={item} />}
        contentContainerStyle={styles.messageList}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          // Show quick actions only when chat has just the initial lang+welcome messages
          showQuickActions ? (
            <View style={styles.quickActions}>
              {QUICK_ACTIONS[session!.lang!].map((action) => (
                <Pressable
                  key={action.prompt}
                  onPress={() => sendMessage(action.prompt, action.label)}
                  style={({ pressed }) => [
                    styles.quickActionButton,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null
        }
      />

      <View style={{ paddingBottom: insets.bottom }}>
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: "#1A56A8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  logoIcon: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  logoText: {
    color: "#1A56A8",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },

  // Welcome
  welcomeBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },
  welcomeText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 14,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  // Language selection
  langBody: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  langMessageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  langBubbleWrap: {
    flex: 1,
  },
  langBubble: {
    borderRadius: 18,
    borderTopLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "85%",
  },
  langBubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  langTime: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  langButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  langButton: {
    borderWidth: 1.5,
    borderColor: "#1A56A8",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  langButtonText: {
    color: "#1A56A8",
    fontSize: 14,
    fontWeight: "600",
  },

  // New chat button
  newChatButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  newChatButtonText: {
    color: "#1A56A8",
    fontSize: 14,
    fontWeight: "600",
  },

  // Chat
  messageList: {
    paddingVertical: 12,
  },

  // Quick actions
  quickActions: {
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  quickActionButton: {
    borderWidth: 1.5,
    borderColor: "#1A56A8",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  quickActionText: {
    color: "#1A56A8",
    fontSize: 15,
    fontWeight: "600",
  },
});
