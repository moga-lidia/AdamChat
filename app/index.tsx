import { useEffect } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LanguageDropdown } from "@/components/language-dropdown";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { AppColors } from "@/constants/theme";
import { useChatSessionContext } from "@/contexts/chat-session-context";
import { useI18n } from "@/hooks/use-i18n";
import { useStaggeredEntry } from "@/hooks/use-staggered-entry";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lang, t, setLang } = useI18n();
  const { session, initSession } = useChatSessionContext();

  const bg = useThemeColor({ light: AppColors.background, dark: AppColors.backgroundDark }, "background");
  const accentColor = useThemeColor({ light: AppColors.primary, dark: AppColors.accent }, "tint");
  const subtitleColor = useThemeColor({ light: AppColors.subtitle, dark: AppColors.subtitleDark }, "icon");
  const featureCardBg = useThemeColor(
    { light: AppColors.primaryLight, dark: AppColors.accentBg },
    "background",
  );
  const startButtonBg = useThemeColor({ light: AppColors.primary, dark: AppColors.accent }, "tint");
  const startButtonTextColor = useThemeColor({ light: AppColors.white, dark: AppColors.darkText }, "text");

  // 5 elements: logo, title+subtitle, features title+cards, start button, language selector
  const entryAnims = useStaggeredEntry(5);

  // If session already has a language, go straight to chat
  useEffect(() => {
    if (session?.lang) {
      router.replace("/chat");
    }
  }, [session, router]);

  const handleStart = () => {
    if (!session) return;
    initSession(lang, t.chat.welcomeMessage);
    setLang(lang);
    router.replace("/chat");
  };

  // Don't render welcome UI if we're about to redirect to chat
  if (session?.lang) return null;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.welcomeBody, { paddingTop: insets.top + 16 }]}>
        <Animated.View style={[styles.logoContainerAlt, entryAnims[0]]}>
          <Image
            source={require("@/assets/images/logo.jpg")}
            style={styles.welcomeLogoAlt}
          />
        </Animated.View>

        <Animated.View style={entryAnims[1]}>
          <Text style={[styles.welcomeTitle, { color: accentColor }]}>
            {t.welcome.title}
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: subtitleColor }]}>
            {t.welcome.subtitle.split("Adam").map((part, i, arr) => (
              <Text key={i}>
                {part}
                {i < arr.length - 1 && (
                  <Text
                    style={[styles.welcomeSubtitleBold, { color: accentColor }]}
                  >
                    Adam
                  </Text>
                )}
              </Text>
            ))}
          </Text>
        </Animated.View>

        <Animated.View
          style={[{ width: "100%", alignItems: "center" }, entryAnims[2]]}
        >
          <Text style={[styles.featuresTitle, { color: subtitleColor }]}>
            {t.welcome.featuresTitle}
          </Text>
          <View style={styles.featureCards}>
            {t.welcome.features.map((feature, index) => (
              <View
                key={index}
                style={[styles.featureCard, { backgroundColor: featureCardBg }]}
              >
                <IconSymbol
                  name={feature.icon as any}
                  size={22}
                  color={accentColor}
                  style={styles.featureIcon}
                />
                <Text style={[styles.featureText, { color: accentColor }]}>
                  {feature.text}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={entryAnims[3]}>
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startButton,
              {
                backgroundColor: startButtonBg,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Text style={[styles.startButtonText, { color: startButtonTextColor }]}>
              {t.welcome.start}
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Language selector pinned to bottom */}
      <Animated.View
        style={[
          styles.welcomeFooter,
          { paddingBottom: insets.bottom + 16 },
          entryAnims[4],
        ]}
      >
        <LanguageDropdown value={lang} onChange={setLang} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingBottom: 50,
  },
  logoContainerAlt: {
    alignItems: "center",
    justifyContent: "center",
    width: 160,
    height: 140,
    marginBottom: 12,
  },
  welcomeLogoAlt: {
    width: 90,
    height: 90,
    borderRadius: 22,
    marginTop: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 10,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 28,
  },
  welcomeSubtitleBold: {
    fontFamily: "Poppins_700Bold",
    textShadowColor: "rgba(255,255,255,0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  featuresTitle: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    marginBottom: 12,
    textAlign: "center",
  },
  featureCards: {
    width: "100%",
    gap: 10,
    marginBottom: 36,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  featureIcon: {
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    lineHeight: 20,
  },
  welcomeFooter: {
    alignItems: "center",
    paddingTop: 8,
  },
  startButton: {
    borderRadius: 28,
    paddingHorizontal: 56,
    paddingVertical: 16,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1.5,
  },
});
