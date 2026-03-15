import { TypingIndicator } from "@/components/chat/typing-indicator";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { Image, Linking, StyleSheet, Text, View } from "react-native";

// Matches markdown links like [text](url)
const MD_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
// Matches bare URLs
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

function renderTextWithLinks(content: string, textStyle: any[]) {
  // First: convert markdown links [text](url) to tokens we can split on
  // Then: handle any remaining bare URLs
  const tokens: { type: "text" | "link"; text: string; url?: string }[] = [];
  let lastIndex = 0;

  // Find all markdown links
  const mdMatches = [...content.matchAll(MD_LINK_REGEX)];

  if (mdMatches.length === 0) {
    // No markdown links — handle bare URLs
    const urlParts = content.split(URL_REGEX);
    if (urlParts.length === 1) {
      return <Text style={textStyle}>{content}</Text>;
    }
    return (
      <Text style={textStyle}>
        {urlParts.map((part, i) =>
          URL_REGEX.test(part) ? (
            <Text
              key={i}
              style={styles.link}
              onPress={() => Linking.openURL(part)}
            >
              {part}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          ),
        )}
      </Text>
    );
  }

  for (const match of mdMatches) {
    const matchStart = match.index!;
    // Add text before this match
    if (matchStart > lastIndex) {
      tokens.push({ type: "text", text: content.slice(lastIndex, matchStart) });
    }
    // Add the link
    tokens.push({ type: "link", text: match[1], url: match[2] });
    lastIndex = matchStart + match[0].length;
  }
  // Add remaining text
  if (lastIndex < content.length) {
    tokens.push({ type: "text", text: content.slice(lastIndex) });
  }

  // Remove any remaining bare URLs from text tokens
  const finalTokens: typeof tokens = [];
  for (const token of tokens) {
    if (token.type === "text") {
      const cleaned = token.text.replace(URL_REGEX, "");
      if (cleaned) finalTokens.push({ type: "text", text: cleaned });
    } else {
      finalTokens.push(token);
    }
  }

  return (
    <Text style={textStyle}>
      {finalTokens.map((token, i) =>
        token.type === "link" ? (
          <Text
            key={i}
            style={styles.link}
            onPress={() => Linking.openURL(token.url!)}
          >
            {token.text}
          </Text>
        ) : (
          <Text key={i}>{token.text}</Text>
        ),
      )}
    </Text>
  );
}

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
              renderTextWithLinks(message.content, [
                styles.text,
                { color: "#FFFFFF" },
                fontSize != null && { fontSize, lineHeight: fontSize * 1.4 },
              ])
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
  link: {
    color: "#B5B7DD",
    textDecorationLine: "underline" as const,
  },
});
