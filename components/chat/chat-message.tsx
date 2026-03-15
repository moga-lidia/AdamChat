import { TypingIndicator } from "@/components/chat/typing-indicator";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { Image, StyleSheet, Text, View } from "react-native";

interface Props {
  message: ChatMessageType;
  fontSize?: number;
  isTyping?: boolean;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessage({ message, fontSize, isTyping }: Props) {
  const isUser = message.role === "user";

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={styles.avatarWrapper}>
          <Image
            source={require("@/assets/images/logo-white.jpeg")}
            style={styles.avatar}
          />
        </View>
      )}
      <View
        style={isUser ? styles.bubbleColumnUser : styles.bubbleColumnAssistant}
      >
        {isUser ? (
          <View style={styles.bubbleUser}>
            {isTyping ? (
              <TypingIndicator />
            ) : (
              <Text
                style={[
                  styles.text,
                  { color: "#FFFFFF" },
                  fontSize != null && { fontSize, lineHeight: fontSize * 1.4 },
                ]}
              >
                {message.content}
              </Text>
            )}
          </View>
        ) : (
          <View>
            {isTyping ? (
              <TypingIndicator />
            ) : (
              <Text
                style={[
                  styles.text,
                  { color: "#FFFFFF" },
                  fontSize != null && { fontSize, lineHeight: fontSize * 1.4 },
                ]}
              >
                {message.content}
              </Text>
            )}
          </View>
        )}
        {!isTyping && message.id !== "_streaming" && (
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.timestampUser : styles.timestampAssistant,
            ]}
          >
            {formatTime(message.timestamp)}
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
  bubbleColumnUser: {
    maxWidth: "78%",
    marginRight: 4,
  },
  bubbleColumnAssistant: {
    maxWidth: "82%",
  },
  avatarWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    marginTop: 4,
    backgroundColor: "#000000",
    overflow: "hidden",
  },
  avatar: {
    width: 24,
    height: 24,
  },
  bubbleUser: {
    backgroundColor: "#333333",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    marginTop: 3,
    marginHorizontal: 4,
  },
  timestampUser: {
    textAlign: "right",
  },
  timestampAssistant: {
    textAlign: "left",
  },
});
