import { AppColors } from "@/constants/theme";
import { useI18n } from "@/hooks/use-i18n";
import { Image, StyleSheet, Text, View } from "react-native";

interface HeaderProps {
  insets: { top: number };
  headerBg: string;
  borderColor: string;
  rightAction?: React.ReactNode;
}

export function Header({
  insets,
  headerBg,
  borderColor,
  rightAction,
}: HeaderProps) {
  const { t } = useI18n();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: headerBg,
          borderBottomColor: borderColor,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <Image
          source={require("@/assets/images/logo-white.jpeg")}
          style={styles.logoImage}
        />
        <View>
          <Text style={styles.logoText}>ADAM</Text>
          <Text style={styles.logoSubtitle}>{t.headerSubtitle}</Text>
        </View>
      </View>
      {rightAction}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 60,
    height: 40,
    borderRadius: 10,
    marginRight: 10,
  },
  logoText: {
    color: AppColors.white,
    fontSize: 22,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1.5,
    lineHeight: 26,
  },
  logoSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
    marginTop: -2,
  },
});
