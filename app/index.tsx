import * as Crypto from "expo-crypto";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthModal } from "@/components/auth-modal";
import { ChatInput } from "@/components/chat-input";
import { ChatMessage } from "@/components/chat-message";
import { HeaderMenu } from "@/components/header-menu";
import { SettingsPanel } from "@/components/settings-panel";
import { SseWebView } from "@/components/sse-webview";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { buildStreamUrl } from "@/services/chat-api";
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

// ── Staggered fade-in + slide-up helper ──
function useStaggeredEntry(count: number, baseDelay = 120) {
  const anims = useRef(
    Array.from({ length: count }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: i * baseDelay,
        useNativeDriver: true,
      }),
    );
    Animated.stagger(baseDelay, animations).start();
  }, [anims, baseDelay]);

  return anims.map((anim) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  }));
}

const LANG_OPTIONS: { label: string; flag: string; value: Lang }[] = [
  { label: "Română", flag: "🇷🇴", value: "ro" },
  { label: "English", flag: "🇬🇧", value: "en" },
  { label: "Magyar", flag: "🇭🇺", value: "hu" },
];

// ── Language Dropdown ──
function LanguageDropdown({
  value,
  onChange,
}: {
  value: Lang;
  onChange: (lang: Lang) => void;
}) {
  const [open, setOpen] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const selected = LANG_OPTIONS.find((o) => o.value === value)!;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: open ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: open ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [open, heightAnim, rotateAnim]);

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const dropdownHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, LANG_OPTIONS.length * 42],
  });

  const handleSelect = (lang: Lang) => {
    onChange(lang);
    setOpen(false);
  };

  return (
    <View style={dropdownStyles.wrapper}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [
          dropdownStyles.trigger,
          open && dropdownStyles.triggerOpen,
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={dropdownStyles.flag}>{selected.flag}</Text>
        <Text style={dropdownStyles.triggerLabel}>{selected.label}</Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <IconSymbol name="chevron.down" size={16} color="#7B7799" />
        </Animated.View>
      </Pressable>

      <Animated.View
        style={[
          dropdownStyles.menu,
          {
            maxHeight: dropdownHeight,
            opacity: heightAnim,
            borderWidth: open ? 1.5 : 0,
          },
        ]}
      >
        {LANG_OPTIONS.map((opt) => {
          const isActive = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => handleSelect(opt.value)}
              style={({ pressed }) => [
                dropdownStyles.option,
                isActive && dropdownStyles.optionActive,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={dropdownStyles.flag}>{opt.flag}</Text>
              <Text
                style={[
                  dropdownStyles.optionLabel,
                  isActive && dropdownStyles.optionLabelActive,
                ]}
              >
                {opt.label}
              </Text>
              {isActive && <View style={dropdownStyles.checkDot} />}
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const dropdownStyles = StyleSheet.create({
  wrapper: {
    width: 180,
    zIndex: 10,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(47,36,130,0.15)",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  triggerOpen: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderBottomColor: "rgba(47,36,130,0.08)",
  },
  flag: {
    fontSize: 17,
  },
  triggerLabel: {
    flex: 1,
    color: "#7B7799",
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  menu: {
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderColor: "rgba(47,36,130,0.15)",
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: -1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  optionActive: {
    backgroundColor: "rgba(47,36,130,0.06)",
  },
  optionLabel: {
    flex: 1,
    color: "#999",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  optionLabelActive: {
    color: "#2f2482",
    fontFamily: "Poppins_500Medium",
  },
  checkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2f2482",
  },
});

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
        <Image
          source={require("@/assets/images/logo.jpg")}
          style={styles.logoImage}
        />
        <Text style={styles.logoText}>ADAM</Text>
      </View>
      {rightAction}
    </View>
  );
}

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const { lang, t, setLang } = useI18n();
  const bg = useThemeColor({ light: "#f7f7f5", dark: "#111" }, "background");
  const headerBg = useThemeColor(
    { light: "#f7f7f5", dark: "#1A1A1A" },
    "background",
  );
  const borderColor = useThemeColor({ light: "#E0E0E0", dark: "#333" }, "icon");
  const accentColor = useThemeColor(
    { light: "#2f2482", dark: "#B5B7DD" },
    "tint",
  );
  const subtitleColor = useThemeColor(
    { light: "#7B7799", dark: "#9B99B0" },
    "icon",
  );
  const featureCardBg = useThemeColor(
    { light: "rgba(47,36,130,0.06)", dark: "rgba(181,183,221,0.1)" },
    "background",
  );
  const startButtonBg = useThemeColor(
    { light: "#2F2482", dark: "#B5B7DD" },
    "tint",
  );
  const startButtonTextColor = useThemeColor(
    { light: "#FFFFFF", dark: "#1A1A2E" },
    "text",
  );
  // 5 elements: logo, title+subtitle, features title+cards, start button, language selector
  const entryAnims = useStaggeredEntry(5);

  type Screen = "welcome" | "chat";
  const [screen, setScreen] = useState<Screen>("welcome");
  const [session, setSession] = useState<ChatSession | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sseUrl, setSseUrl] = useState<string | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const flatListRef = useRef<FlatList>(null);
  const keyboardPadding = useRef(new Animated.Value(0)).current;
  const screenFade = useRef(new Animated.Value(1)).current;

  // Keyboard handling
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardPadding, {
        toValue: e.endCoordinates.height - insets.bottom,
        duration: Platform.OS === "ios" ? e.duration : 200,
        useNativeDriver: false,
      }).start();
    });
    const onHide = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardPadding, {
        toValue: 0,
        duration: Platform.OS === "ios" ? (e as any).duration : 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [insets.bottom, keyboardPadding]);

  // Load session on mount
  useEffect(() => {
    (async () => {
      const existing = await loadSession();
      if (existing) {
        setSession(existing);
        if (existing.lang) {
          setLang(existing.lang);
          setScreen("chat");
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

  // Scroll to bottom
  useEffect(() => {
    if (screen !== "chat") return;
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [session?.messages.length, streamingText, screen]);

  const handleStart = () => {
    if (!session) return;
    Animated.timing(screenFade, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      const withLang = setSessionLang(session, lang);
      const welcomeMsg: ChatMessageType = {
        id: Crypto.randomUUID(),
        role: "assistant",
        content: t.chat.welcomeMessage,
        timestamp: Date.now(),
      };
      const withWelcome = appendMessage(withLang, welcomeMsg);
      setSession(withWelcome);
      setScreen("chat");
      Animated.timing(screenFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const accumulatedRef = useRef("");

  const handleSseToken = useCallback((token: string) => {
    accumulatedRef.current += token;
    setStreamingText(accumulatedRef.current);
  }, []);

  const handleSseDone = useCallback((conversationHistoryId?: number) => {
    const content = accumulatedRef.current;
    if (content) {
      const assistantMessage: ChatMessageType = {
        id: Crypto.randomUUID(),
        role: "assistant",
        content,
        timestamp: Date.now(),
        conversationHistoryId,
      };
      setSession((prev) =>
        prev ? appendMessage(prev, assistantMessage) : prev,
      );
    }
    setStreamingText("");
    setIsStreaming(false);
    setSseUrl(null);
    accumulatedRef.current = "";
  }, []);

  const handleSseError = useCallback(() => {
    const errorMessage: ChatMessageType = {
      id: Crypto.randomUUID(),
      role: "assistant",
      content: t.chat.errorMessage,
      timestamp: Date.now(),
      isError: true,
    };
    setSession((prev) => (prev ? appendMessage(prev, errorMessage) : prev));
    setStreamingText("");
    setIsStreaming(false);
    setSseUrl(null);
    accumulatedRef.current = "";
  }, [t]);

  const sendMessage = useCallback(
    (prompt: string, displayText?: string) => {
      if (!session || isStreaming || !session.lang) return;

      Keyboard.dismiss();

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
      accumulatedRef.current = "";

      const url = buildStreamUrl(prompt, session.id, session.lang);
      setSseUrl(url);
    },
    [session, isStreaming],
  );

  const handleNewChat = useCallback(() => {
    Alert.alert(t.menu.newChatConfirmTitle, t.menu.newChatConfirmMessage, [
      { text: t.menu.cancel, style: "cancel" },
      {
        text: t.menu.confirm,
        style: "destructive",
        onPress: async () => {
          setSseUrl(null);
          setIsStreaming(false);
          setStreamingText("");
          accumulatedRef.current = "";
          await clearSession();
          const id = Crypto.randomUUID();
          setSession(createSession(id));
          setScreen("welcome");
        },
      },
    ]);
  }, [t]);

  const settingsOverlay = (
    <SettingsPanel
      visible={showSettings}
      onClose={() => setShowSettings(false)}
      fontSize={fontSize}
      onFontSizeChange={setFontSize}
      contrast={contrast}
      onContrastChange={setContrast}
      brightness={brightness}
      onBrightnessChange={setBrightness}
    />
  );

  // Brightness overlay: black to dim (<100), white to brighten (>100)
  // Contrast overlay: gray to wash out (<100), black to deepen (>100)
  const visualOverlays = (
    <>
      {brightness !== 100 && (
        <View
          pointerEvents="none"
          style={[
            styles.filterOverlay,
            {
              backgroundColor: "#000",
              opacity: (100 - brightness) / 50,
            },
          ]}
        />
      )}
      {contrast !== 100 && (
        <View
          pointerEvents="none"
          style={[
            styles.filterOverlay,
            {
              backgroundColor: "#808080",
              opacity: (100 - contrast) / 50,
            },
          ]}
        />
      )}
    </>
  );

  // ── Welcome Screen ──
  if (screen === "welcome") {
    return (
      <Animated.View
        style={[styles.container, { backgroundColor: bg, opacity: screenFade }]}
      >
        <View style={[styles.welcomeBody, { paddingTop: insets.top + 16 }]}>
          {/* Option A: Circle + arched text */}
          {/* <Animated.View style={[styles.logoContainer, entryAnims[0]]}>
            <View style={styles.arcTextWrapper}>
              {"ADAM".split("").map((letter, i) => {
                const angles = [-22, -7, 7, 22];
                const radius = 72;
                const angle = angles[i];
                const rad = (angle * Math.PI) / 180;
                const x = radius * Math.sin(rad);
                const y = -radius * Math.cos(rad) + radius - 6;
                return (
                  <Text
                    key={i}
                    style={[
                      styles.arcLetter,
                      {
                        color: accentColor,
                        transform: [
                          { translateX: x },
                          { translateY: y },
                          { rotate: `${angle}deg` },
                        ],
                      },
                    ]}
                  >
                    {letter}
                  </Text>
                );
              })}
            </View>
            <View style={styles.logoWrapper}>
              <Image
                source={require("@/assets/images/logo.jpg")}
                style={styles.welcomeLogo}
              />
            </View>
          </Animated.View> */}

          {/* Option B: No circle, just logo */}
          <Animated.View style={[styles.logoContainerAlt, entryAnims[0]]}>
            <Image
              source={require("@/assets/images/logo.jpg")}
              style={styles.welcomeLogoAlt}
            />
          </Animated.View>

          <Animated.View style={entryAnims[1]}>
            <Text style={[styles.welcomeTitle, { color: accentColor }]}>
              {t.welcome.title}
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: subtitleColor }]}>
              {t.welcome.subtitle.split("Adam").map((part, i, arr) => (
                <Text key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <Text
                      style={[
                        styles.welcomeSubtitleBold,
                        { color: accentColor },
                      ]}
                    >
                      Adam
                    </Text>
                  )}
                </Text>
              ))}
            </Text>
          </Animated.View>

          <Animated.View
            style={[{ width: "100%", alignItems: "center" }, entryAnims[2]]}
          >
            <Text style={[styles.featuresTitle, { color: subtitleColor }]}>
              {t.welcome.featuresTitle}
            </Text>
            <View style={styles.featureCards}>
              {t.welcome.features.map((feature, index) => (
                <View
                  key={index}
                  style={[
                    styles.featureCard,
                    { backgroundColor: featureCardBg },
                  ]}
                >
                  <IconSymbol
                    name={feature.icon as any}
                    size={22}
                    color={accentColor}
                    style={styles.featureIcon}
                  />
                  <Text style={[styles.featureText, { color: accentColor }]}>
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View style={entryAnims[3]}>
            <Pressable
              onPress={handleStart}
              style={({ pressed }) => [
                styles.startButton,
                {
                  backgroundColor: startButtonBg,
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text
                style={[
                  styles.startButtonText,
                  { color: startButtonTextColor },
                ]}
              >
                {t.welcome.start}
              </Text>
            </Pressable>
          </Animated.View>
        </View>

        {/* Language selector pinned to bottom */}
        <Animated.View
          style={[
            styles.welcomeFooter,
            { paddingBottom: insets.bottom + 16 },
            entryAnims[4],
          ]}
        >
          <LanguageDropdown value={lang} onChange={setLang} />
        </Animated.View>
      </Animated.View>
    );
  }

  // ── Chat Screen ──
  // Show quick actions after welcome message (1 initial message) or after an error
  const lastMessage = session?.messages[session.messages.length - 1];
  const showQuickActions =
    session?.lang &&
    !isStreaming &&
    ((session?.messages.length ?? 0) <= 2 || lastMessage?.isError);
  const messages = session?.messages ?? [];
  const displayMessages: ChatMessageType[] = [
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

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: bg, opacity: screenFade }]}
    >
      <Header
        insets={insets}
        headerBg={headerBg}
        borderColor={borderColor}
        rightAction={
          <HeaderMenu
            onAccount={() => setAuthModalVisible(true)}
            onSettings={() => setShowSettings((v) => !v)}
            onNewChat={handleNewChat}
          />
        }
      />
      {settingsOverlay}

      <FlatList
        ref={flatListRef}
        data={displayMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatMessage
            message={item}
            fontSize={fontSize}
            isTyping={item.id === "_streaming" && !streamingText}
          />
        )}
        contentContainerStyle={styles.messageList}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={
          showQuickActions ? (
            <View style={styles.quickActions}>
              {t.quickActions.map((action) => (
                <Pressable
                  key={action.prompt}
                  onPress={() => sendMessage(action.prompt, action.label)}
                  style={({ pressed }) => [
                    styles.quickActionButton,
                    {
                      backgroundColor: featureCardBg,
                      borderColor: accentColor,
                      opacity: pressed ? 0.85 : 1,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    },
                  ]}
                >
                  <Text
                    style={[styles.quickActionText, { color: accentColor }]}
                  >
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null
        }
      />

      <Animated.View
        style={{ paddingBottom: Animated.add(keyboardPadding, insets.bottom) }}
      >
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </Animated.View>
      {visualOverlays}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
      <View style={styles.sseContainer} pointerEvents="none">
        <SseWebView
          url={sseUrl}
          onToken={handleSseToken}
          onDone={handleSseDone}
          onError={handleSseError}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sseContainer: {
    position: "absolute",
    width: 0,
    height: 0,
    overflow: "hidden",
  },
  filterOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
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
  logoImage: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginRight: 8,
  },
  logoText: {
    color: "#2f2482",
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },

  // Welcome
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 160,
    marginBottom: 12,
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    shadowColor: "rgba(47,36,130,0.3)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 12,
  },
  welcomeBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingBottom: 50,
  },
  welcomeLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 15,
  },
  logoContainerAlt: {
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 140,
    marginBottom: 12,
  },
  welcomeLogoAlt: {
    width: 90,
    height: 90,
    borderRadius: 22,
    marginTop: 40,
  },
  arcTextWrapper: {
    position: "absolute",
    top: 0,
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    height: 90,
    zIndex: 1,
  },
  arcLetter: {
    position: "absolute",
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 2,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: "Poppins_600SemiBold",
    // fontFamily: "Poppins_700Bold",
    marginBottom: 10,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
  },
  welcomeSubtitleBold: {
    fontFamily: "Poppins_700Bold",
    textShadowColor: "rgba(255,255,255,0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  featuresTitle: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    marginBottom: 12,
    textAlign: "center",
  },
  featureCards: {
    width: "100%",
    gap: 10,
    marginBottom: 36,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  featureIcon: {
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    lineHeight: 20,
  },
  welcomeFooter: {
    alignItems: "center",
    paddingTop: 8,
  },

  startButton: {
    borderRadius: 28,
    paddingHorizontal: 56,
    paddingVertical: 16,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1.5,
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
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  quickActionText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
});
