import { IconSymbol } from "@/components/ui/icon-symbol";
import { s } from "@/constants/scale";
import { useI18n } from "@/hooks/use-i18n";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

interface Props {
  onSend: (text: string) => void;
  onCourses?: () => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, onCourses, disabled }: Props) {
  const [text, setText] = useState("");
  const inputRef = useRef<TextInput>(null);
  const sendAnim = useRef(new Animated.Value(1)).current;
  const { t } = useI18n();
  const bg = useThemeColor({ light: "#2A2A2A", dark: "#2A2A2A" }, "background");
  const textColor = "#FFFFFF";
  const placeholderColor = useThemeColor(
    { light: "#999", dark: "#666" },
    "icon",
  );

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    Animated.sequence([
      Animated.timing(sendAnim, {
        toValue: 0.7,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    inputRef.current?.clear();
    setText("");
    onSend(trimmed);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {onCourses && (
        <Pressable
          onPress={onCourses}
          style={({ pressed }) => [
            styles.coursesButton,
            { backgroundColor: "#FFFFFF", opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <IconSymbol name="video.fill" size={s(22)} color="#2f2482" />
        </Pressable>
      )}
      <TextInput
        ref={inputRef}
        style={[styles.input, { color: textColor }]}
        placeholder={t.chat.inputPlaceholder}
        placeholderTextColor={placeholderColor}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={2000}
        editable={!disabled}
        onSubmitEditing={handleSend}
        submitBehavior="newline"
      />
      <Animated.View style={{ transform: [{ scale: sendAnim }] }}>
        <Pressable
          onPress={handleSend}
          disabled={disabled || !text.trim()}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor:
                text.trim() && !disabled ? "#FFFFFF" : "transparent",
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <IconSymbol
            name="arrow.up"
            size={s(22)}
            weight="semibold"
            color={text.trim() && !disabled ? "#2f2482" : placeholderColor}
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: s(12),
    paddingVertical: s(8),
    borderRadius: s(24),
    marginHorizontal: s(12),
    marginBottom: s(8),
  },
  input: {
    flex: 1,
    fontSize: s(16),
    fontFamily: "Poppins_400Regular",
    maxHeight: s(120),
    paddingHorizontal: s(8),
    paddingVertical: Platform.OS === "ios" ? s(8) : s(4),
  },
  coursesButton: {
    width: s(38),
    height: s(38),
    borderRadius: s(19),
    alignItems: "center",
    justifyContent: "center",
    marginRight: s(4),
    marginLeft: s(-2),
  },
  sendButton: {
    width: s(38),
    height: s(38),
    borderRadius: s(19),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: s(6),
  },
});
