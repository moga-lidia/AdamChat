import { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthModal } from "@/components/auth-modal";
import { ChatInput } from "@/components/chat-input";
import { ChatMessage } from "@/components/chat-message";
import { Header } from "@/components/header";
import { HeaderMenu } from "@/components/header-menu";
import { SettingsPanel } from "@/components/settings-panel";
import { SseWebView } from "@/components/sse-webview";
import { useChatSessionContext } from "@/contexts/chat-session-context";
import { useSettings } from "@/contexts/settings-context";
import { useChatSession } from "@/hooks/use-chat-session";
import { useI18n } from "@/hooks/use-i18n";
import { useKeyboardPadding } from "@/hooks/use-keyboard-padding";
import { useThemeColor } from "@/hooks/use-theme-color";
import { AppColors } from "@/constants/theme";

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lang, t } = useI18n();
  const { session, resetSession } = useChatSessionContext();
  const { fontSize, setFontSize, contrast, setContrast, brightness, setBrightness } =
    useSettings();

  const bg = useThemeColor({ light: AppColors.background, dark: AppColors.backgroundDark }, "background");
  const headerBg = useThemeColor({ light: AppColors.headerBg, dark: AppColors.headerBgDark }, "background");
  const borderColor = useThemeColor({ light: AppColors.border, dark: AppColors.borderDark }, "icon");
  const accentColor = useThemeColor({ light: AppColors.primary, dark: AppColors.accent }, "tint");
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
          <HeaderMenu
            onAccount={() => setAuthModalVisible(true)}
            onSettings={() => setShowSettings((v) => !v)}
            onCourses={handleCourses}
            onNewChat={handleNewChat}
          />
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
                  <Text style={[styles.quickActionText, { color: accentColor }]}>
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
});
