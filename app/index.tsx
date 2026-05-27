import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LanguageDropdown } from "@/components/layout/language-dropdown";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { IS_SMALL, s } from "@/constants/scale";
import { useChatSessionContext } from "@/contexts/chat-session-context";
import { useI18n } from "@/hooks/use-i18n";

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
      <ScrollView
        style={styles.welcomeBody}
        contentContainerStyle={styles.welcomeBodyContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.welcomeTitle, { color: accentColor }]}>
          {t.welcome.title}
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: subtitleColor }]}>
          {t.welcome.heroDescription.split("Adam").map((part, i, arr) =>
            i < arr.length - 1 ? (
              <Text key={i}>
                {part}
                <Text style={styles.welcomeSubtitleBold}>Adam</Text>
              </Text>
            ) : (
              <Text key={i}>{part}</Text>
            ),
          )}{" "}
          <Text
            style={styles.welcomeSubtitleLink}
            onPress={() => Linking.openURL("https://academiasperanta.ro/")}
          >
            Academia Speranța
          </Text>
        </Text>
        <Pressable
          onPress={() => Linking.openURL("https://speranta.media")}
          style={({ pressed }) => [
            styles.poweredBySection,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Image
            source={require("@/assets/images/logo vectorial trust.png")}
            style={styles.poweredByLogo}
            resizeMode="contain"
          />
          <Text style={styles.poweredByText}>
            {t.welcome.poweredBy}{" "}
            <Text style={styles.poweredByBold}>{t.welcome.trustName}</Text>
          </Text>
        </Pressable>

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
                size={s(22)}
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
      </ScrollView>

      {/* Language selector pinned to bottom */}
      <View
        style={[styles.welcomeFooter, { paddingBottom: insets.bottom + s(16) }]}
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
    width: "100%",
    height: s(IS_SMALL ? 225 : 270),
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: s(80),
  },
  adamLogoText: {
    marginTop: s(-85),
    fontSize: s(70),
    fontFamily: "Poppins_500Medium_Italic",
    color: "#FFFFFF",
    letterSpacing: s(22),
    paddingLeft: s(26),
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  welcomeBody: {
    flex: 1,
    paddingHorizontal: s(36),
  },
  welcomeBodyContent: {
    alignItems: "center",
    paddingTop: s(IS_SMALL ? 22 : 30),
    paddingBottom: s(20),
  },
  welcomeTitle: {
    fontSize: s(22),
    fontFamily: "Poppins_600SemiBold",
    marginBottom: s(2),
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: s(13),
    fontFamily: "Poppins_400Regular",
    lineHeight: s(20),
    textAlign: "center",
    marginTop: s(4),
  },
  welcomeSubtitleBold: {
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
  },
  welcomeSubtitleLink: {
    textDecorationLine: "underline",
    fontFamily: "Poppins_500Medium",
  },
  poweredBySection: {
    alignItems: "center",
    marginTop: s(8),
  },
  poweredByLogo: {
    width: s(32),
    height: s(25),
    marginBottom: s(3),
  },
  poweredByText: {
    fontSize: s(12),
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.4)",
  },
  poweredByBold: {
    fontFamily: "Poppins_500Medium",
    color: "rgba(255,255,255,0.55)",
    textDecorationLine: "underline",
  },
  featuresTitle: {
    fontSize: s(13),
    fontFamily: "Poppins_500Medium",
    marginTop: s(IS_SMALL ? 28 : 38),
    marginBottom: s(8),
    textAlign: "center",
  },
  featureCards: {
    width: "100%",
    gap: s(8),
    marginBottom: s(28),
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: s(14),
    paddingHorizontal: s(14),
    paddingVertical: s(10),
    gap: s(10),
  },
  featureIcon: {
    flexShrink: 0,
  },
  featureText: {
    flex: 1,
    fontSize: s(14),
    fontFamily: "Poppins_500Medium",
    lineHeight: s(20),
  },
  welcomeFooter: {
    alignItems: "center",
    paddingTop: s(8),
  },
  startButton: {
    borderRadius: s(27),
    paddingHorizontal: s(48),
    paddingVertical: s(11),
  },
  startButtonText: {
    fontSize: s(19),
    fontFamily: "Poppins_700Bold",
    letterSpacing: s(4),
  },
});
