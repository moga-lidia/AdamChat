import { useThemeColor } from "@/hooks/use-theme-color";
import { TypingIndicator } from "@/components/typing-indicator";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { Image, StyleSheet, Text, View } from "react-native";

interface Props {
  message: ChatMessageType;
  fontSize?: number;
  isTyping?: boolean;
}

export function ChatMessage({ message, fontSize, isTyping }: Props) {
  const isUser = message.role === "user";
  const textColor = useThemeColor({}, "text");
  const userBubbleBg = useThemeColor(
    { light: "#2f2482", dark: "#4a3a9e" },
    "tint",
  );
  const assistantBubbleBg = useThemeColor(
    { light: "#EEECEC", dark: "#2A2A2A" },
    "background",
  );

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <Image
          source={require("@/assets/images/logo-speranta.jpg")}
          style={styles.avatar}
        />
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: userBubbleBg }]
            : [styles.bubbleAssistant, { backgroundColor: assistantBubbleBg }],
        ]}
      >
        {isTyping ? (
          <TypingIndicator />
        ) : (
          <Text
            style={[
              styles.text,
              { color: isUser ? "#FFFFFF" : textColor },
              fontSize != null && { fontSize, lineHeight: fontSize * 1.4 },
            ]}
          >
            {message.content}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowAssistant: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 4,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
    shadowColor: "rgba(47,36,130,0.3)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
  },
});
