import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
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
        <IconSymbol name="line.3.horizontal" size={24} color="#FFFFFF" />
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
                paddingTop: insets.top - 4,
                paddingBottom: insets.bottom + 20,
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
              <IconSymbol name="xmark" size={20} color="#FFFFFF" />
            </Pressable>

            {/* Menu items */}
            <View style={styles.menuItems}>
              {user ? (
                <Pressable
                  onPress={() => {
                    animateClose(() => {
                      Alert.alert(
                        t.menu.signOutConfirmTitle,
                        t.menu.signOutConfirmMessage,
                        [
                          { text: t.menu.cancel, style: "cancel" },
                          {
                            text: t.menu.signOut,
                            style: "destructive",
                            onPress: () => signOut(),
                          },
                        ],
                      );
                    });
                  }}
                  style={({ pressed }) => [
                    styles.menuItem,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                >
                  <IconSymbol
                    name="rectangle.portrait.and.arrow.right"
                    size={22}
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
                  <IconSymbol name="person.fill" size={22} color="#FFFFFF" />
                  <Text style={styles.menuLabel}>{t.menu.signIn}</Text>
                </Pressable>
              )}

              <View style={styles.separator} />

              <Pressable
                onPress={() => handleItem(onSettings)}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol name="gearshape.fill" size={22} color="#FFFFFF" />
                <Text style={styles.menuLabel}>{t.menu.settings}</Text>
              </Pressable>

              <View style={styles.separator} />

              <Pressable
                onPress={() => handleItem(onCourses)}
                style={({ pressed }) => [
                  styles.menuItem,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <IconSymbol name="book.fill" size={22} color="#FFFFFF" />
                <Text style={styles.menuLabel}>{t.menu.courses}</Text>
              </Pressable>

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
                    <IconSymbol name="plus" size={22} color="#FFFFFF" />
                    <Text style={styles.menuLabel}>{t.menu.newChat}</Text>
                  </Pressable>
                </>
              )}
            </View>
          </Animated.View>
        </View>
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
    paddingHorizontal: 24,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 4,
  },
  menuItems: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 14,
  },
  menuLabel: {
    fontSize: 17,
    fontFamily: "Poppins_500Medium",
    color: "#FFFFFF",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
