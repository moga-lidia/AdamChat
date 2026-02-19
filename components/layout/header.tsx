import { Image, StyleSheet, Text, View } from "react-native";
import { AppColors } from "@/constants/theme";

interface HeaderProps {
  insets: { top: number };
  headerBg: string;
  borderColor: string;
  rightAction?: React.ReactNode;
}

export function Header({ insets, headerBg, borderColor, rightAction }: HeaderProps) {
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
          source={require("@/assets/images/logo.jpg")}
          style={styles.logoImage}
        />
        <Text style={styles.logoText}>ADAM</Text>
      </View>
      {rightAction}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginRight: 8,
  },
  logoText: {
    color: AppColors.primary,
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
});
