import { IconSymbol } from "@/components/ui/icon-symbol";
import { s } from "@/constants/scale";
import { useAuth } from "@/hooks/use-auth";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props {
  onPress: () => void;
}

export function AuthButton({ onPress }: Props) {
  const { user } = useAuth();
  const borderColor = useThemeColor({ light: "#E0E0E0", dark: "#333" }, "icon");
  const iconColor = useThemeColor(
    { light: "#B5B7DD", dark: "#ECEDEE" },
    "text",
  );

  const initial =
    user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      {user ? (
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>{initial}</Text>
        </View>
      ) : (
        <IconSymbol name="person.fill" size={s(18)} color={iconColor} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: s(16),
    width: s(32),
    height: s(32),
    alignItems: "center",
    justifyContent: "center",
  },
  initialCircle: {
    width: s(24),
    height: s(24),
    borderRadius: s(12),
    backgroundColor: "#B5B7DD",
    alignItems: "center",
    justifyContent: "center",
  },
  initialText: {
    color: "#FFFFFF",
    fontSize: s(13),
    fontWeight: "700",
  },
});
