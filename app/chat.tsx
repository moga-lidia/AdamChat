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

import { AuthModal } from "@/components/auth-modal";
import { ChatInput } from "@/components/chat-input";
import { ChatMessage } from "@/components/chat-message";
import { Header } from "@/components/header";
import { HeaderMenu } from "@/components/header-menu";
import {
  MentorLiveModal,
  loadMentorData,
  type MentorData,
} from "@/components/mentor-live-modal";
import { SettingsPanel } from "@/components/settings-panel";
import { SseWebView } from "@/components/sse-webview";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/theme";
import { useChatSessionContext } from "@/contexts/chat-session-context";
import { useSettings } from "@/contexts/settings-context";
import { useChatSession } from "@/hooks/use-chat-session";
import { useI18n } from "@/hooks/use-i18n";
import { useKeyboardPadding } from "@/hooks/use-keyboard-padding";
import { useThemeColor } from "@/hooks/use-theme-color";
import { StompClient } from "@/services/stomp-client";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lang, t } = useI18n();
  const { session, resetSession, addMessage } = useChatSessionContext();
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
    { light: AppColors.primary, dark: AppColors.accent },
    "tint",
  );
  const featureCardBg = useThemeColor(
    { light: AppColors.primaryLight, dark: AppColors.accentBg },
    "background",
  );

  const keyboardPadding = useKeyboardPadding(insets.bottom);
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
          stomp.subscribe(
            `/topic/chat/${session.id}`,
            (body) => {
              try {
                const msg = JSON.parse(body);
                // Skip echoed user messages
                if (msg.sender === "user") return;

                if (
                  msg.type === "SEND_MESSAGE" &&
                  msg.payload?.message
                ) {
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
            },
          );

          // Send REQUEST_HANDOVER
          const handoverPayload = JSON.stringify({
            id: "wss://ai.chatbot.zaha.tech/chatbot-ai/ws",
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
        id: "wss://ai.chatbot.zaha.tech/chatbot-ai/ws",
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
        id: "wss://ai.chatbot.zaha.tech/chatbot-ai/ws",
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
                <IconSymbol
                  name="bubble.left.fill"
                  size={14}
                  color="#2f2482"
                />
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
                <IconSymbol
                  name="bubble.left.fill"
                  size={14}
                  color="#2f2482"
                />
                <Text style={styles.mentorButtonText}>
                  {t.mentor.buttonLabel}
                </Text>
              </Pressable>
            )}
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
        onLangChange={() => {}}
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
              <Pressable
                onPress={() => router.push("/courses")}
                style={({ pressed }) => [
                  styles.quickActionButton,
                  styles.studyVideoButton,
                  {
                    backgroundColor: featureCardBg,
                    borderColor: accentColor,
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <IconSymbol
                  name="play.circle.fill"
                  size={15}
                  color={accentColor as string}
                  style={styles.studyVideoIcon}
                />
                <Text
                  style={[styles.quickActionText, { color: accentColor }]}
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
    paddingVertical: 12,
  },
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
  studyVideoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  studyVideoIcon: {
    marginTop: 1,
  },
  studyVideoText: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mentorButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F5E6A0",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: "#2f2482",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  mentorButtonActive: {
    backgroundColor: "#F5E6A0",
    borderWidth: 1.5,
    borderColor: "#2f2482",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  mentorButtonText: {
    color: "#2f2482",
    fontSize: 13,
    fontFamily: "Poppins_700Bold",
  },
});
