import { TypingIndicator } from "@/components/chat/typing-indicator";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import * as Clipboard from "expo-clipboard";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Matches markdown links [text](url) OR bare URLs (ASCII-only to avoid
// consuming adjacent non-ASCII text like Romanian characters)
const TOKEN_REGEX =
  /\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/[\x21-\x7E]+)/g;

function isAcademiaUrl(url: string): boolean {
  return url.includes("academiasperanta.ro") && url.includes("/courses");
}

function renderTextWithLinks(content: string, textStyle: any[]) {
  const tokens: { type: "text" | "link"; text: string; url?: string }[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(TOKEN_REGEX)) {
    const matchStart = match.index!;
    if (matchStart > lastIndex) {
      tokens.push({ type: "text", text: content.slice(lastIndex, matchStart) });
    }
    if (match[1] && match[2]) {
      // Markdown link [text](url)
      tokens.push({ type: "link", text: match[1], url: match[2] });
    } else if (match[3]) {
      // Bare URL
      const url = match[3];
      const label = isAcademiaUrl(url)
        ? "Vezi cursul pe Academia Speranța"
        : url;
      tokens.push({ type: "link", text: label, url });
      // Ensure newline after academia course links for separation
      if (isAcademiaUrl(url)) {
        tokens.push({ type: "text", text: "\n" });
      }
    }
    lastIndex = matchStart + match[0].length;
  }
  if (lastIndex < content.length) {
    tokens.push({ type: "text", text: content.slice(lastIndex) });
  }

  if (tokens.length === 0) {
    return (
      <Text style={textStyle} android_hyphenationFrequency="none">
        {content}
      </Text>
    );
  }
  if (tokens.length === 1 && tokens[0].type === "text") {
    return (
      <Text style={textStyle} android_hyphenationFrequency="none">
        {tokens[0].text}
      </Text>
    );
  }

  return (
    <Text style={textStyle} android_hyphenationFrequency="none">
      {tokens.map((token, i) =>
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

  const handleCopy = () => {
    Clipboard.setStringAsync(message.content);
    Alert.alert("", "Textul a fost copiat!");
  };

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={styles.avatarWrapper}>
          <Image
            source={require("@/assets/images/logo-white.png")}
            style={styles.avatar}
          />
        </View>
      )}
      <View
        style={isUser ? styles.bubbleColumnUser : styles.bubbleColumnAssistant}
      >
        {isUser ? (
          <Pressable onLongPress={handleCopy} style={styles.bubbleUser}>
            {isTyping ? (
              <TypingIndicator />
            ) : (
              <Text
                style={[
                  styles.text,
                  { color: "#FFFFFF" },
                  fontSize != null && { fontSize, lineHeight: fontSize * 1.4 },
                ]}
                android_hyphenationFrequency="none"
              >
                {message.content}
              </Text>
            )}
          </Pressable>
        ) : (
          <Pressable onLongPress={handleCopy}>
            {isTyping ? (
              <TypingIndicator />
            ) : (
              renderTextWithLinks(message.content, [
                styles.text,
                { color: "#FFFFFF" },
                fontSize != null && { fontSize, lineHeight: fontSize * 1.4 },
              ])
            )}
          </Pressable>
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
