import { s } from "@/constants/scale";
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
          paddingTop: insets.top + s(8),
        },
      ]}
    >
      <View style={styles.headerLeft}>
        <Image
          source={require("@/assets/images/logo-white.png")}
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
    paddingHorizontal: s(16),
    paddingBottom: s(12),
    borderBottomWidth: 0,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: s(60),
    height: s(40),
    borderRadius: s(10),
    marginRight: s(10),
  },
  logoText: {
    color: AppColors.white,
    fontSize: s(22),
    fontFamily: "Poppins_700Bold",
    letterSpacing: s(1.5),
    lineHeight: s(26),
  },
  logoSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: s(11),
    fontFamily: "Poppins_400Regular",
    marginTop: s(-2),
  },
});
