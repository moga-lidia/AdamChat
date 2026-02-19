import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CoursesScreen } from "@/components/courses-screen";
import { Header } from "@/components/header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { AppColors } from "@/constants/theme";

export default function CoursesRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const bg = useThemeColor({ light: AppColors.background, dark: AppColors.backgroundDark }, "background");
  const headerBg = useThemeColor({ light: AppColors.headerBg, dark: AppColors.headerBgDark }, "background");
  const borderColor = useThemeColor({ light: AppColors.border, dark: AppColors.borderDark }, "icon");

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Header
        insets={insets}
        headerBg={headerBg}
        borderColor={borderColor}
        rightAction={
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <IconSymbol name="chevron.left" size={24} color={AppColors.primary} />
          </Pressable>
        }
      />
      <CoursesScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
