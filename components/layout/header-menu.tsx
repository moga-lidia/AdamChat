import { IconSymbol } from "@/components/ui/icon-symbol";
import { s } from "@/constants/scale";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { requestAccountDeletion } from "@/services/auth-api";
import { loadAuthTokens } from "@/services/auth-storage";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FilmReelIcon } from "../ui/film-reel-icon";

const SCREEN_WIDTH = Dimensions.get("window").width;
const PANEL_WIDTH = SCREEN_WIDTH * 0.75;

interface HeaderMenuProps {
  onAccount: () => void;
  onSettings: () => void;
  onCourses: () => void;
  onNewChat?: () => void;
}

export function HeaderMenu({
  onAccount,
  onSettings,
  onCourses,
  onNewChat,
}: HeaderMenuProps) {
  const { user, signOut } = useAuth();
  const { t, lang } = useI18n();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(PANEL_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const animateOpen = useCallback(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const animateClose = useCallback(
    (cb?: () => void) => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: PANEL_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setOpen(false);
        cb?.();
      });
    },
    [slideAnim, fadeAnim],
  );

  useEffect(() => {
    if (open) animateOpen();
  }, [open, animateOpen]);

  const handleItem = (action: () => void) => {
    animateClose(action);
  };

  const handleClose = () => {
    animateClose();
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <IconSymbol name="line.3.horizontal" size={s(24)} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <View style={styles.container}>
          {/* Blurred backdrop */}
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
            <BlurView
              intensity={10}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { opacity: fadeAnim, backgroundColor: "rgba(0,0,0,0.3)" },
              ]}
            />
          </Pressable>

          {/* Slide-in panel from right */}
          <Animated.View
            style={[
              styles.panel,
              {
                width: PANEL_WIDTH,
                paddingTop: insets.top + s(8),
                paddingBottom: insets.bottom + s(20),
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Close button */}
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [
                styles.closeButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <IconSymbol name="xmark" size={s(20)} color="#FFFFFF" />
            </Pressable>

            {/* Menu items */}
            <View style={styles.menuItems}>
              {user ? (
                <Pressable
                  onPress={() => {
                    animateClose(() => setSignOutOpen(true));
                  }}
                  style={({ pressed }) => [
                    styles.menuItem,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <IconSymbol
                    name="rectangle.portrait.and.arrow.right"
                    size={s(22)}
                    color="#FF6B6B"
                  />
                  <Text style={[styles.menuLabel, { color: "#FF6B6B" }]}>
                    {t.menu.signOut}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => handleItem(onAccount)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <IconSymbol name="person.fill" size={s(22)} color="#FFFFFF" />
                  <Text style={styles.menuLabel}>{t.menu.signIn}</Text>
                </Pressable>
              )}

              {onNewChat && (
                <>
                  <View style={styles.separator} />
                  <Pressable
                    onPress={() => handleItem(onNewChat)}
                    style={({ pressed }) => [
                      styles.menuItem,
                      { opacity: pressed ? 0.6 : 1 },
                    ]}
                  >
                    <IconSymbol name="plus" size={s(22)} color="#FFFFFF" />
                    <Text style={styles.menuLabel}>{t.menu.newChat}</Text>
                  </Pressable>
                </>
              )}

              <View style={styles.separator} />

              <Pressable
                onPress={() => handleItem(onCourses)}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol name="book.fill" size={s(22)} color="#FFFFFF" />
                <Text style={styles.menuLabel}>{t.menu.courses}</Text>
              </Pressable>

              <View style={styles.separator} />
              <Pressable
                onPress={() => {
                  animateClose(() =>
                    Linking.openURL(
                      "https://www.sperantatv.ro/urmareste-live/",
                    ),
                  );
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol
                  name="video.fill"
                  size={s(22)}
                  color="#FFFFFF"
                />
                <Text style={styles.menuLabel}>{t.menu.sperantaTvLive}</Text>
              </Pressable>

              <View style={styles.separator} />
              <Pressable
                onPress={() => {
                  animateClose(() =>
                    Linking.openURL(
                      "https://www.youtube.com/@sperantatvoficial",
                    ),
                  );
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol
                  name="play.rectangle.fill"
                  size={s(22)}
                  color="#FFFFFF"
                />
                <Text style={styles.menuLabel}>
                  {t.menu.sperantaTvYoutube}
                </Text>
              </Pressable>

              <View style={styles.separator} />
              <Pressable
                onPress={() => {
                  animateClose(() =>
                    Linking.openURL("https://live.rvs.ro/play"),
                  );
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol name="mic.fill" size={s(22)} color="#FFFFFF" />
                <Text style={styles.menuLabel}>{t.menu.sperantaFmLive}</Text>
              </Pressable>

              <View style={styles.separator} />
              <Pressable
                onPress={() => {
                  animateClose(() =>
                    Linking.openURL("https://live.rvs.ro/splay"),
                  );
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol name="music.note" size={s(22)} color="#FFFFFF" />
                <Text style={styles.menuLabel}>{t.menu.sperantaFmMusic}</Text>
              </Pressable>

              {lang === "hu" && t.menu.remenysegFmLive && (
                <>
                  <View style={styles.separator} />
                  <Pressable
                    onPress={() => {
                      animateClose(() =>
                        Linking.openURL("https://live.rvs.ro/mg"),
                      );
                    }}
                    style={({ pressed }) => [
                      styles.menuItem,
                      { opacity: pressed ? 0.6 : 1 },
                    ]}
                  >
                    <IconSymbol name="mic.fill" size={s(22)} color="#FFFFFF" />
                    <Text style={styles.menuLabel}>
                      {t.menu.remenysegFmLive}
                    </Text>
                  </Pressable>
                </>
              )}

              <View style={styles.separator} />
              <Pressable
                onPress={() => {
                  animateClose(() =>
                    Linking.openURL(
                      "https://youtube.com/@hopediscoveryromania?si=8WbLBVUYmOHIWpPJ",
                    ),
                  );
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <FilmReelIcon size={s(22)} color="#FFFFFF" />
                <Text style={styles.menuLabel}>{t.menu.hopeDiscovery}</Text>
              </Pressable>

              <View style={styles.separator} />
              <Pressable
                onPress={() => {
                  animateClose(() => Linking.openURL("https://hopeplay.ro"));
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol name="play.circle.fill" size={s(22)} color="#FFFFFF" />
                <Text style={styles.menuLabel}>{t.menu.hopePlay}</Text>
              </Pressable>

              <View style={styles.separator} />
              <Pressable
                onPress={() => handleItem(onSettings)}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol name="gearshape.fill" size={s(22)} color="#FFFFFF" />
                <Text style={styles.menuLabel}>{t.menu.settings}</Text>
              </Pressable>
            </View>

            {/* About item */}
            <View style={{ paddingTop: s(12) }}>
              <View style={styles.separator} />
              <Pressable
                onPress={() => {
                  animateClose(() => setAboutOpen(true));
                }}
                style={({ pressed }) => [
                  styles.menuAbout,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol name="info.circle" size={s(22)} color="#FFFFFF" />
                <Text
                  style={[styles.menuLabel, { marginLeft: s(14), marginRight: s(6) }]}
                >
                  {t.menu.about}
                </Text>
                <Image
                  source={require("@/assets/images/logo vectorial trust.png")}
                  style={styles.menuAboutLogo}
                  resizeMode="contain"
                />
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* About modal */}
      <Modal
        visible={aboutOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAboutOpen(false)}
      >
        <Pressable
          style={styles.aboutBackdrop}
          onPress={() => setAboutOpen(false)}
        >
          <BlurView
            intensity={15}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View
            style={styles.aboutDialog}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.aboutHeader}>
              <View />
              <Pressable
                onPress={() => setAboutOpen(false)}
                style={({ pressed }) => [
                  styles.aboutCloseButton,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol
                  name="xmark"
                  size={s(18)}
                  color="rgba(255,255,255,0.6)"
                />
              </Pressable>
            </View>

            <View style={styles.aboutContent}>
              <Pressable
                onPress={() => Linking.openURL("https://speranta.media")}
                style={({ pressed }) => [
                  styles.aboutLogoWrap,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Image
                  source={require("@/assets/images/logo vectorial trust+text.png")}
                  style={styles.aboutLogo}
                  resizeMode="contain"
                />
              </Pressable>

              <ScrollView
                style={styles.aboutScroll}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.aboutText}>
                  {t.menu.aboutDescriptionPart1}
                  <Text
                    style={styles.aboutLink}
                    onPress={() => Linking.openURL("https://speranta.media")}
                  >
                    {t.menu.aboutLinkText}
                  </Text>
                  {t.menu.aboutDescriptionPart2}
                </Text>
              </ScrollView>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Sign out dialog */}
      <Modal
        visible={signOutOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSignOutOpen(false)}
      >
        <Pressable
          style={styles.aboutBackdrop}
          onPress={() => setSignOutOpen(false)}
        >
          <BlurView
            intensity={15}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View
            style={styles.signOutDialog}
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.signOutTitle}>
              {t.menu.signOutConfirmTitle}
            </Text>
            <Text style={styles.signOutMessage}>
              {t.menu.signOutConfirmMessage}
            </Text>

            <Pressable
              onPress={() => {
                setSignOutOpen(false);
                signOut();
              }}
              style={({ pressed }) => [
                styles.signOutBtn,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.signOutBtnText}>{t.menu.signOut}</Text>
            </Pressable>

            <Pressable
              onPress={() => setSignOutOpen(false)}
              style={({ pressed }) => [
                styles.signOutCancelBtn,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={styles.signOutCancelText}>{t.menu.cancel}</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setSignOutOpen(false);
                Alert.alert(
                  t.auth.deleteAccountConfirmTitle,
                  t.auth.deleteAccountConfirmMessage,
                  [
                    { text: t.menu.cancel, style: "cancel" },
                    {
                      text: t.auth.deleteAccount,
                      style: "destructive",
                      onPress: async () => {
                        const tokens = await loadAuthTokens();
                        if (!tokens?.accessToken) {
                          Alert.alert(t.auth.deleteAccountError);
                          return;
                        }
                        const result = await requestAccountDeletion(
                          tokens.accessToken,
                          lang,
                        );
                        if ("success" in result) {
                          await signOut();
                          Alert.alert(t.auth.deleteAccountSuccess);
                        } else {
                          Alert.alert(t.auth.deleteAccountError);
                        }
                      },
                    },
                  ],
                );
              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
                marginTop: s(20),
              })}
            >
              <Text style={styles.deleteAccountLink}>
                {t.auth.deleteAccount}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  panel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(20,20,20,0.92)",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: s(24),
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: s(4),
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: s(16),
    gap: s(14),
  },
  menuLogo: {
    width: s(24),
    height: s(24),
  },
  menuLabel: {
    fontSize: s(17),
    fontFamily: "Poppins_500Medium",
    color: "#FFFFFF",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  menuAbout: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: s(16),
    gap: 0,
  },
  menuAboutLogo: {
    width: s(28),
    height: s(20),
  },
  aboutBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    padding: s(24),
  },
  aboutDialog: {
    width: "100%",
    maxWidth: s(340),
    maxHeight: "80%",
    backgroundColor: "rgba(20,20,20,0.92)",
    borderRadius: s(28),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  aboutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    paddingHorizontal: s(16),
    paddingTop: s(12),
  },
  aboutCloseButton: {
    padding: s(4),
  },
  aboutContent: {
    paddingHorizontal: s(28),
    paddingTop: s(8),
    paddingBottom: s(28),
    alignItems: "center",
  },
  aboutLogoWrap: {
    marginBottom: s(16),
  },
  aboutLogo: {
    width: s(120),
    height: s(132),
  },
  aboutScroll: {
    flexGrow: 0,
  },
  aboutText: {
    fontSize: s(14),
    fontFamily: "Poppins_400Regular",
    color: "rgba(255,255,255,0.65)",
    lineHeight: s(22),
    textAlign: "center",
  },
  aboutLink: {
    color: "#fec216",
    fontFamily: "Poppins_600SemiBold",
    textDecorationLine: "underline",
  },
  signOutDialog: {
    width: "100%",
    maxWidth: s(300),
    backgroundColor: "rgba(20,20,20,0.92)",
    borderRadius: s(20),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: s(24),
    paddingTop: s(28),
    paddingBottom: s(24),
    alignItems: "center",
  },
  signOutTitle: {
    color: "#FFFFFF",
    fontSize: s(17),
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginBottom: s(8),
  },
  signOutMessage: {
    color: "rgba(255,255,255,0.6)",
    fontSize: s(14),
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: s(24),
  },
  signOutBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: s(12),
    paddingVertical: s(14),
    alignItems: "center",
    alignSelf: "stretch",
  },
  signOutBtnText: {
    color: "#D32F2F",
    fontSize: s(15),
    fontFamily: "Poppins_600SemiBold",
  },
  signOutCancelBtn: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: s(12),
    paddingVertical: s(14),
    alignItems: "center",
    alignSelf: "stretch",
    marginTop: s(10),
  },
  signOutCancelText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: s(14),
    fontFamily: "Poppins_500Medium",
  },
  deleteAccountLink: {
    color: "rgba(255,255,255,0.35)",
    fontSize: s(12),
    fontFamily: "Poppins_400Regular",
    textDecorationLine: "underline",
  },
});
