import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LanguageDropdown } from "@/components/layout/language-dropdown";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useChatSessionContext } from "@/contexts/chat-session-context";
import { useI18n } from "@/hooks/use-i18n";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
// Scale factor relative to Pixel 8 height (~851dp)
const SCALE = SCREEN_HEIGHT / 851;

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lang, t, setLang } = useI18n();
  const { session, initSession } = useChatSessionContext();

  const accentColor = "#FFFFFF";
  const subtitleColor = "rgba(255,255,255,0.7)";
  const featureCardBg = "rgba(255,255,255,0.1)";
  const startButtonBg = "#FFFFFF";
  const startButtonTextColor = "#000000";

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
    <View style={styles.container}>
      {/* Hero image + ADAM logo — bleeds into status bar */}
      <View style={styles.heroWrapper}>
        <Image
          source={require("@/assets/images/welcome-hero.jpg")}
          style={styles.heroBg}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "#000"]}
          style={styles.heroGradient}
        />
        <Text style={styles.adamLogoText}>ADAM</Text>
      </View>

      {/* Content */}
      <View style={styles.welcomeBody}>
        <Text style={[styles.welcomeTitle, { color: accentColor }]}>
          {t.welcome.title}
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: subtitleColor }]}>
          {t.welcome.subtitle
            .split(/(Adam|Academia Speranța)/)
            .map((part, i) => {
              if (part === "Adam") {
                return (
                  <Text
                    key={i}
                    style={[styles.welcomeSubtitleBold, { color: accentColor }]}
                  >
                    Adam
                  </Text>
                );
              }
              if (part === "Academia Speranța") {
                return (
                  <Text
                    key={i}
                    style={[styles.welcomeSubtitleBold, styles.academiaLink]}
                    onPress={() =>
                      Linking.openURL("https://academiasperanta.ro/")
                    }
                  >
                    Academia Speranța
                  </Text>
                );
              }
              return <Text key={i}>{part}</Text>;
            })}
        </Text>

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
          <Text
            style={[styles.startButtonText, { color: startButtonTextColor }]}
          >
            {t.welcome.start}
          </Text>
        </Pressable>
      </View>

      {/* Language selector pinned to bottom */}
      <View
        style={[styles.welcomeFooter, { paddingBottom: insets.bottom + 16 }]}
      >
        <LanguageDropdown value={lang} onChange={setLang} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  heroWrapper: {
    alignItems: "center",
  },
  heroBg: {
    width: SCREEN_WIDTH,
    height: Math.round(270 * SCALE),
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  adamLogoText: {
    marginTop: Math.round(-85 * SCALE),
    fontSize: Math.round(70 * SCALE),
    fontFamily: "Poppins_500Medium_Italic",
    color: "#FFFFFF",
    letterSpacing: 12,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  welcomeBody: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 36,
    paddingTop: Math.round(30 * SCALE),
  },
  welcomeTitle: {
    fontSize: Math.round(22 * SCALE),
    fontFamily: "Poppins_600SemiBold",
    marginBottom: Math.round(6 * SCALE),
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: Math.round(13 * SCALE),
    fontFamily: "Poppins_400Regular",
    lineHeight: Math.round(20 * SCALE),
    textAlign: "center",
    marginBottom: Math.round(22 * SCALE),
  },
  academiaLink: {
    textDecorationLine: "underline",
  },
  welcomeSubtitleBold: {
    fontFamily: "Poppins_700Bold",
  },
  featuresTitle: {
    fontSize: Math.round(13 * SCALE),
    fontFamily: "Poppins_500Medium",
    marginBottom: Math.round(8 * SCALE),
    textAlign: "center",
  },
  featureCards: {
    width: "100%",
    gap: Math.round(8 * SCALE),
    marginBottom: Math.round(28 * SCALE),
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Math.round(10 * SCALE),
    gap: 10,
  },
  featureIcon: {
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    fontSize: Math.round(14 * SCALE),
    fontFamily: "Poppins_500Medium",
    lineHeight: Math.round(20 * SCALE),
  },
  welcomeFooter: {
    alignItems: "center",
    paddingTop: Math.round(8 * SCALE),
  },
  startButton: {
    borderRadius: 28,
    paddingHorizontal: 50,
    paddingVertical: Math.round(12 * SCALE),
  },
  startButtonText: {
    fontSize: Math.round(20 * SCALE),
    fontFamily: "Poppins_700Bold",
    letterSpacing: 4,
  },
});
