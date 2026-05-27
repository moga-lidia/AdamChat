import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthModal } from "@/components/auth/auth-modal";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage } from "@/components/chat/chat-message";
import { SseWebView } from "@/components/chat/sse-webview";
import { Header } from "@/components/layout/header";
import { HeaderMenu } from "@/components/layout/header-menu";
import {
  MentorLiveModal,
  loadMentorData,
  type MentorData,
} from "@/components/mentor/mentor-live-modal";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { s } from "@/constants/scale";
import { AppColors } from "@/constants/theme";
import { useChatSessionContext } from "@/contexts/chat-session-context";
import { useSettings } from "@/contexts/settings-context";
import { useAuth } from "@/hooks/use-auth";
import { useChatSession } from "@/hooks/use-chat-session";
import { useI18n } from "@/hooks/use-i18n";
import { useKeyboardPadding } from "@/hooks/use-keyboard-padding";
import { useThemeColor } from "@/hooks/use-theme-color";
import { translations } from "@/i18n/translations";
import { StompClient, WS_URL } from "@/services/stomp-client";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { lang, t, setLang } = useI18n();
  const { session, setSession, resetSession, addMessage } =
    useChatSessionContext();
  const {
    fontSize,
    setFontSize,
    contrast,
    setContrast,
    brightness,
    setBrightness,
  } = useSettings();

  const bg = useThemeColor(
    { light: AppColors.background, dark: AppColors.backgroundDark },
    "background",
  );
  const headerBg = useThemeColor(
    { light: AppColors.headerBg, dark: AppColors.headerBgDark },
    "background",
  );
  const borderColor = useThemeColor(
    { light: AppColors.border, dark: AppColors.borderDark },
    "icon",
  );
  const accentColor = useThemeColor(
    { light: AppColors.accent, dark: AppColors.accent },
    "tint",
  );
  const featureCardBg = useThemeColor(
    { light: AppColors.accentBg, dark: AppColors.accentBg },
    "background",
  );

  const {
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
  } = useChatSession();

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mentorModalVisible, setMentorModalVisible] = useState(false);
  const [mentorConnected, setMentorConnected] = useState(false);
  const stompRef = useRef<StompClient | null>(null);
  const keyboardPadding = useKeyboardPadding(insets.bottom);

  // Cleanup STOMP on unmount
  useEffect(() => {
    return () => {
      stompRef.current?.disconnect();
    };
  }, []);

  const connectStomp = useCallback(
    (data: MentorData) => {
      if (!session) return;

      const stomp = new StompClient();
      stompRef.current = stomp;

      stomp.connect(
        () => {
          // Subscribe to chat topic for this session
          stomp.subscribe(`/topic/chat/${session.id}`, (body) => {
            try {
              const msg = JSON.parse(body);
              // Skip echoed user messages
              if (msg.sender === "user") return;

              if (msg.type === "SEND_MESSAGE" && msg.payload?.message) {
                // Regular operator message
                addMessage({
                  id: Crypto.randomUUID(),
                  role: "assistant",
                  content: msg.payload.message,
                  timestamp: Date.now(),
                });
              } else if (
                msg.type === "OPERATOR_ASSIGNED" &&
                msg.payload?.message
              ) {
                // Operator assignment notification
                addMessage({
                  id: Crypto.randomUUID(),
                  role: "assistant",
                  content: msg.payload.message,
                  timestamp: Date.now(),
                });
              } else if (msg.type === "CLOSE_CONVERSATION") {
                // Operator closed the conversation
                addMessage({
                  id: Crypto.randomUUID(),
                  role: "assistant",
                  content: t.mentor.conversationClosed,
                  timestamp: Date.now(),
                });
                stomp.disconnect();
                stompRef.current = null;
                setMentorConnected(false);
              }
            } catch {
              // ignore unparseable frames
            }
          });

          // Send REQUEST_HANDOVER
          const handoverPayload = JSON.stringify({
            id: WS_URL,
            type: "REQUEST_HANDOVER",
            payload: {
              username: data.name,
              contact: data.contact,
              department: data.countyCode,
              language: lang,
            },
            timestamp: new Date().toISOString(),
            sender: "user",
            sessionId: session.id,
          });
          stomp.send("/app/chat.userMessage", handoverPayload);
        },
        () => {
          // On disconnect
          setMentorConnected(false);
        },
      );
    },
    [session, lang, t.mentor.conversationClosed, addMessage],
  );

  // Send a user message to the operator via STOMP
  const sendMentorMessage = useCallback(
    (text: string) => {
      if (!session || !stompRef.current?.isConnected()) return;

      // Add user message to chat locally
      const userMsg: ChatMessageType = {
        id: Crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };
      addMessage(userMsg);

      // Send via STOMP
      const payload = JSON.stringify({
        id: WS_URL,
        type: "SEND_MESSAGE",
        payload: { message: text },
        timestamp: new Date().toISOString(),
        sender: "user",
        sessionId: session.id,
      });
      stompRef.current.send("/app/chat.userMessage", payload);
    },
    [session, addMessage],
  );

  const handleMentorPress = async () => {
    if (mentorConnected) {
      // Already connected — re-send handover through existing STOMP
      const saved = await loadMentorData();
      if (saved) {
        connectStomp(saved);
      }
      const mentorMessage: ChatMessageType = {
        id: Crypto.randomUUID(),
        role: "assistant",
        content: t.mentor.connectedMessage,
        timestamp: Date.now(),
      };
      addMessage(mentorMessage);
    } else {
      setMentorModalVisible(true);
    }
  };

  const handleMentorConnect = (data: MentorData) => {
    setMentorModalVisible(false);
    setMentorConnected(true);
    const mentorMessage: ChatMessageType = {
      id: Crypto.randomUUID(),
      role: "assistant",
      content: t.mentor.connectedMessage,
      timestamp: Date.now(),
    };
    addMessage(mentorMessage);
    connectStomp(data);
  };

  const handleMentorClose = () => {
    // Send CLOSE_CONVERSATION to backend before disconnecting
    if (session && stompRef.current?.isConnected()) {
      const payload = JSON.stringify({
        id: WS_URL,
        type: "CLOSE_CONVERSATION",
        timestamp: new Date().toISOString(),
        sender: "user",
        sessionId: session.id,
      });
      stompRef.current.send("/app/chat.userMessage", payload);
    }
    stompRef.current?.disconnect();
    stompRef.current = null;
    setMentorConnected(false);
    addMessage({
      id: Crypto.randomUUID(),
      role: "assistant",
      content: t.mentor.conversationClosed,
      timestamp: Date.now(),
    });
  };

  // Routing guard: redirect to welcome if no lang set
  useEffect(() => {
    if (session && !session.lang) {
      router.replace("/");
    }
  }, [session, router]);

  const handleNewChat = () => {
    Alert.alert(t.menu.newChatConfirmTitle, t.menu.newChatConfirmMessage, [
      { text: t.menu.cancel, style: "cancel" },
      {
        text: t.menu.confirm,
        style: "destructive",
        onPress: async () => {
          resetStreaming();
          await resetSession();
          router.replace("/");
        },
      },
    ]);
  };

  const handleCourses = () => {
    router.push("/courses");
  };

  // Don't render until session is ready
  if (!session || !session.lang) return null;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Header
        insets={insets}
        headerBg={headerBg}
        borderColor={borderColor}
        rightAction={
          <View style={styles.headerRight}>
            {/* TODO: Re-enable mentor live button
            {mentorConnected ? (
              <Pressable
                onPress={handleMentorClose}
                style={({ pressed }) => [
                  styles.mentorButton,
                  styles.mentorButtonActive,
                  {
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <View style={styles.liveDot} />
                <IconSymbol name="bubble.left.fill" size={s(14)} color="#FFFFFF" />
                <Text style={styles.mentorButtonText}>
                  {t.mentor.closeConversation}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleMentorPress}
                style={({ pressed }) => [
                  styles.mentorButton,
                  {
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <IconSymbol name="bubble.left.fill" size={s(14)} color="#FFFFFF" />
                <Text style={styles.mentorButtonText}>
                  {t.mentor.buttonLabel}
                </Text>
              </Pressable>
            )}
            */}
            <HeaderMenu
              onAccount={() => setAuthModalVisible(true)}
              onSettings={() => setShowSettings((v) => !v)}
              onCourses={handleCourses}
              onNewChat={handleNewChat}
            />
          </View>
        }
      />

      <SettingsPanel
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        contrast={contrast}
        onContrastChange={setContrast}
        brightness={brightness}
        onBrightnessChange={setBrightness}
        lang={lang}
        onLangChange={(newLang) => {
          setLang(newLang);
          const newT = translations[newLang];
          setSession((prev) => {
            if (!prev) return prev;
            const messages = prev.messages.map((msg, i) =>
              i === 0 && msg.role === "assistant"
                ? { ...msg, content: newT.chat.welcomeMessage }
                : msg,
            );
            return { ...prev, lang: newLang, messages };
          });
        }}
      />

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
        ListHeaderComponent={
          !user ? (
            <Pressable
              onPress={() => setAuthModalVisible(true)}
              style={({ pressed }) => [
                styles.saveNoteBanner,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <IconSymbol
                name="person.crop.circle.badge.exclamationmark"
                size={s(14)}
                color="rgba(255,255,255,0.45)"
              />
              <Text style={styles.saveNoteText}>
                {t.chat.saveNotePrefix}
                <Text style={styles.saveNoteLink}>{t.chat.saveNoteAction}</Text>
                {t.chat.saveNoteSuffix}
              </Text>
            </Pressable>
          ) : null
        }
        ListFooterComponent={
          showQuickActions && !mentorConnected ? (
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

              {/* WHITE + PURPLE */}
              <Pressable
                onPress={() => router.push("/courses")}
                style={({ pressed }) => [
                  styles.quickActionButton,
                  styles.studyVideoButton,
                  {
                    backgroundColor: AppColors.accentBg,
                    borderColor: AppColors.accent,
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <IconSymbol
                  name="play.circle.fill"
                  size={s(15)}
                  color={AppColors.accent}
                  style={styles.studyVideoIcon}
                />
                <Text
                  style={[styles.quickActionText, { color: AppColors.accent }]}
                  numberOfLines={1}
                >
                  {t.studyVideo}
                </Text>
              </Pressable>
            </View>
          ) : null
        }
      />

      <Animated.View
        style={{ paddingBottom: Animated.add(keyboardPadding, insets.bottom) }}
      >
        <ChatInput
          onSend={
            mentorConnected && stompRef.current?.isConnected()
              ? sendMentorMessage
              : sendMessage
          }
          onCourses={handleCourses}
          disabled={isStreaming}
        />
      </Animated.View>

      {/* Visual overlays for brightness/contrast */}
      {brightness !== 100 && (
        <View
          pointerEvents="none"
          style={[
            styles.filterOverlay,
            { backgroundColor: "#000", opacity: (100 - brightness) / 50 },
          ]}
        />
      )}
      {contrast !== 100 && (
        <View
          pointerEvents="none"
          style={[
            styles.filterOverlay,
            { backgroundColor: "#808080", opacity: (100 - contrast) / 50 },
          ]}
        />
      )}

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />

      <MentorLiveModal
        visible={mentorModalVisible}
        onClose={() => setMentorModalVisible(false)}
        onConnect={handleMentorConnect}
      />

      <View style={styles.sseContainer} pointerEvents="none">
        <SseWebView
          url={sseUrl}
          onToken={handleSseToken}
          onDone={handleSseDone}
          onError={handleSseError}
        />
      </View>
    </View>
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
  messageList: {
    paddingTop: s(24),
    paddingBottom: s(12),
  },
  saveNoteBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: s(6),
    paddingVertical: s(8),
    paddingHorizontal: s(16),
    marginHorizontal: s(24),
    marginBottom: s(12),
    borderRadius: s(12),
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  saveNoteText: {
    fontSize: s(12),
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.45)",
  },
  saveNoteLink: {
    fontFamily: "Poppins_600SemiBold",
    textDecorationLine: "underline",
  },
  quickActions: {
    alignItems: "center",
    gap: s(10),
    marginTop: s(16),
    paddingHorizontal: s(12),
  },
  quickActionButton: {
    borderWidth: 1,
    borderRadius: s(22),
    paddingHorizontal: s(22),
    paddingVertical: s(10),
  },
  quickActionText: {
    fontSize: s(14),
    fontFamily: "Poppins_500Medium",
  },
  studyVideoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(7),
  },
  studyVideoIcon: {
    marginTop: s(1),
  },
  studyVideoText: {
    fontSize: s(14),
    fontFamily: "Poppins_500Medium",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(10),
  },
  mentorButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(6),
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: s(22),
    paddingHorizontal: s(14),
    paddingVertical: s(8),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  mentorButtonActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  liveDot: {
    width: s(7),
    height: s(7),
    borderRadius: s(4),
    backgroundColor: "#4ADE80",
  },
  mentorButtonText: {
    color: "#FFFFFF",
    fontSize: s(13),
    fontFamily: "Poppins_700Bold",
  },
});
