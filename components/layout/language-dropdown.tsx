import { IconSymbol } from "@/components/ui/icon-symbol";
import { s } from "@/constants/scale";
import type { Lang } from "@/types/chat";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

const LANG_OPTIONS: { label: string; flag: string; value: Lang }[] = [
  { label: "Română", flag: "🇷🇴", value: "ro" },
  { label: "English", flag: "🇬🇧", value: "en" },
  { label: "Magyar", flag: "🇭🇺", value: "hu" },
];

interface LanguageDropdownProps {
  value: Lang;
  onChange: (lang: Lang) => void;
}

export function LanguageDropdown({ value, onChange }: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const selected = LANG_OPTIONS.find((o) => o.value === value)!;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: open ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: open ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [open, heightAnim, rotateAnim]);

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const dropdownHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, LANG_OPTIONS.length * s(42)],
  });

  const handleSelect = (lang: Lang) => {
    onChange(lang);
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [
          styles.trigger,
          open && styles.triggerOpen,
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Text style={styles.flag}>{selected.flag}</Text>
        <Text style={styles.triggerLabel}>{selected.label}</Text>
        <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
          <IconSymbol
            name="chevron.down"
            size={s(16)}
            color="rgba(255,255,255,0.6)"
          />
        </Animated.View>
      </Pressable>

      <Animated.View
        style={[
          styles.menu,
          {
            maxHeight: dropdownHeight,
            opacity: heightAnim,
            borderWidth: open ? 1.5 : 0,
          },
        ]}
      >
        {LANG_OPTIONS.map((opt) => {
          const isActive = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => handleSelect(opt.value)}
              style={({ pressed }) => [
                styles.option,
                isActive && styles.optionActive,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.flag}>{opt.flag}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  isActive && styles.optionLabelActive,
                ]}
              >
                {opt.label}
              </Text>
              {isActive && <View style={styles.checkDot} />}
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: s(180),
    zIndex: 10,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(40,40,40,1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: s(22),
    paddingHorizontal: s(14),
    paddingVertical: s(10),
    gap: s(8),
  },
  triggerOpen: {
    borderBottomLeftRadius: s(4),
    borderBottomRightRadius: s(4),
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  flag: {
    fontSize: s(17),
  },
  triggerLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.85)",
    fontSize: s(14),
    fontFamily: "Poppins_500Medium",
  },
  menu: {
    overflow: "hidden",
    backgroundColor: "rgba(40,40,40,1)",
    borderColor: "rgba(255,255,255,0.3)",
    borderTopWidth: 0,
    borderBottomLeftRadius: s(16),
    borderBottomRightRadius: s(16),
    marginTop: -1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: s(14),
    paddingVertical: s(10),
    gap: s(8),
  },
  optionActive: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  optionLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.5)",
    fontSize: s(14),
    fontFamily: "Poppins_400Regular",
  },
  optionLabelActive: {
    color: "#FFFFFF",
    fontFamily: "Poppins_500Medium",
  },
  checkDot: {
    width: s(6),
    height: s(6),
    borderRadius: s(3),
    backgroundColor: "#FFFFFF",
  },
});
