import { IconSymbol } from "@/components/ui/icon-symbol";
import { s } from "@/constants/scale";
import { useI18n } from "@/hooks/use-i18n";
import type { Lang } from "@/types/chat";
import { BlurView } from "expo-blur";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  GestureResponderEvent,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SFSymbolName = Parameters<typeof IconSymbol>[0]["name"];

interface SliderProps {
  icon: SFSymbolName;
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onValueChange: (value: number) => void;
}

function CustomSlider({
  icon,
  label,
  value,
  min,
  max,
  suffix,
  onValueChange,
}: SliderProps) {
  const trackRef = useRef<View>(null);
  const trackLayout = useRef({ x: 0, width: 0 });
  const animatedRatio = useRef(
    new Animated.Value((value - min) / (max - min)),
  ).current;

  useEffect(() => {
    Animated.spring(animatedRatio, {
      toValue: (value - min) / (max - min),
      friction: 20,
      tension: 150,
      useNativeDriver: false,
    }).start();
  }, [value, min, max, animatedRatio]);

  const computeValue = useCallback(
    (pageX: number) => {
      const { x, width } = trackLayout.current;
      if (width <= 0) return;
      const ratio = Math.max(0, Math.min(1, (pageX - x) / width));
      onValueChange(Math.round(min + ratio * (max - min)));
    },
    [min, max, onValueChange],
  );

  const handleTouch = useCallback(
    (evt: GestureResponderEvent) => {
      computeValue(evt.nativeEvent.pageX);
    },
    [computeValue],
  );

  const displayValue = suffix ? `${value}${suffix}` : `${value}`;

  const fillWidth = animatedRatio.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const thumbLeft = animatedRatio.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.labelRow}>
        <View style={sliderStyles.labelWithIcon}>
          <IconSymbol name={icon} size={s(16)} color="#FFFFFF" />
          <Text style={sliderStyles.label}>{label}</Text>
        </View>
        <Text style={sliderStyles.value}>{displayValue}</Text>
      </View>
      <View
        ref={trackRef}
        style={sliderStyles.trackOuter}
        onLayout={() => {
          trackRef.current?.measureInWindow((x, _y, width) => {
            trackLayout.current = { x, width };
          });
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
      >
        <View style={sliderStyles.track}>
          <Animated.View
            style={[sliderStyles.trackFill, { width: fillWidth }]}
          />
        </View>
        <Animated.View style={[sliderStyles.thumb, { left: thumbLeft }]} />
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    marginBottom: s(28),
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: s(6),
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: s(8),
  },
  label: {
    color: "#FFFFFF",
    fontSize: s(15),
    fontWeight: "600",
  },
  value: {
    color: "#8886A0",
    fontSize: s(15),
    fontWeight: "700",
  },
  trackOuter: {
    height: s(32),
    justifyContent: "center",
  },
  track: {
    height: s(6),
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: s(3),
  },
  trackFill: {
    height: s(6),
    backgroundColor: "#2f2482",
    borderRadius: s(3),
  },
  thumb: {
    position: "absolute",
    width: s(22),
    height: s(22),
    borderRadius: s(11),
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2f2482",
    marginLeft: s(-11),
    top: s(5),
    boxShadow: "0px 2px 4px rgba(0,0,0,0.15)",
    elevation: 3,
  },
});

const LANG_OPTIONS: { label: string; flag: string; value: Lang }[] = [
  { label: "Română", flag: "🇷🇴", value: "ro" },
  { label: "English", flag: "🇬🇧", value: "en" },
  { label: "Magyar", flag: "🇭🇺", value: "hu" },
];

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  contrast: number;
  onContrastChange: (value: number) => void;
  brightness: number;
  onBrightnessChange: (value: number) => void;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

export function SettingsPanel({
  visible,
  onClose,
  fontSize,
  onFontSizeChange,
  contrast,
  onContrastChange,
  brightness,
  onBrightnessChange,
  lang,
  onLangChange,
}: SettingsPanelProps) {
  const { t } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const chevronAnim = useRef(new Animated.Value(0)).current;

  const toggleLang = useCallback(() => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(250, "easeInEaseOut", "opacity"),
    );
    setLangOpen((v) => {
      const next = !v;
      Animated.spring(chevronAnim, {
        toValue: next ? 1 : 0,
        friction: 10,
        useNativeDriver: true,
      }).start();
      return next;
    });
  }, [chevronAnim]);

  const chevronRotate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={panelStyles.backdrop} onPress={onClose}>
        <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={panelStyles.dialog} onStartShouldSetResponder={() => true}>
          <View style={panelStyles.header}>
            <Text style={panelStyles.title}>{t.settings.title}</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                panelStyles.closeButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <IconSymbol name="xmark" size={s(18)} color="#666" />
            </Pressable>
          </View>

          <CustomSlider
            icon="textformat.size"
            label={t.settings.fontSize}
            value={fontSize}
            min={12}
            max={24}
            onValueChange={onFontSizeChange}
          />
          <CustomSlider
            icon="circle.lefthalf.filled"
            label={t.settings.contrast}
            value={contrast}
            min={70}
            max={100}
            suffix="%"
            onValueChange={onContrastChange}
          />
          <CustomSlider
            icon="sun.max.fill"
            label={t.settings.brightness}
            value={brightness}
            min={70}
            max={100}
            suffix="%"
            onValueChange={onBrightnessChange}
          />

          <View style={langStyles.container}>
            <Pressable
              onPress={toggleLang}
              style={({ pressed }) => [
                langStyles.row,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={sliderStyles.labelWithIcon}>
                <IconSymbol name="globe" size={s(16)} color="#FFFFFF" />
                <Text style={sliderStyles.label}>{t.settings.language}</Text>
              </View>
              <View style={langStyles.selectedRow}>
                <Text style={langStyles.flag}>
                  {LANG_OPTIONS.find((o) => o.value === lang)?.flag}
                </Text>
                <Text style={langStyles.selectedLabel}>
                  {LANG_OPTIONS.find((o) => o.value === lang)?.label}
                </Text>
                <Animated.View
                  style={{ transform: [{ rotate: chevronRotate }] }}
                >
                  <IconSymbol name="chevron.down" size={s(14)} color="#7B7799" />
                </Animated.View>
              </View>
            </Pressable>
            {langOpen && (
              <View style={langStyles.options}>
                {LANG_OPTIONS.map((opt) => {
                  const isActive = opt.value === lang;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => {
                        onLangChange(opt.value);
                        LayoutAnimation.configureNext(
                          LayoutAnimation.create(
                            200,
                            "easeInEaseOut",
                            "opacity",
                          ),
                        );
                        setLangOpen(false);
                        Animated.spring(chevronAnim, {
                          toValue: 0,
                          friction: 10,
                          useNativeDriver: true,
                        }).start();
                      }}
                      style={({ pressed }) => [
                        langStyles.option,
                        isActive && langStyles.optionActive,
                        { opacity: pressed ? 0.7 : 1 },
                      ]}
                    >
                      <Text style={langStyles.flag}>{opt.flag}</Text>
                      <Text
                        style={[
                          langStyles.optionLabel,
                          isActive && langStyles.optionLabelActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {isActive && <View style={langStyles.checkDot} />}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const panelStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    padding: s(24),
  },
  dialog: {
    width: "100%",
    maxWidth: s(360),
    backgroundColor: "rgba(20,20,20,0.92)",
    borderRadius: s(16),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: s(28),
    paddingTop: s(34),
    paddingBottom: s(18),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: s(24),
    marginTop: s(-22),
    marginRight: s(-16),
  },
  title: {
    color: "#FFFFFF",
    fontSize: s(18),
    fontWeight: "700",
    marginTop: s(14),
  },
  closeButton: {
    padding: s(4),
  },
});

const langStyles = StyleSheet.create({
  container: {
    marginBottom: s(16),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    fontSize: s(18),
    marginRight: s(6),
  },
  selectedLabel: {
    fontSize: s(15),
    fontWeight: "700",
    color: "#B5B7DD",
    marginRight: s(6),
  },
  options: {
    marginTop: s(14),
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: s(11),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  optionActive: {
    backgroundColor: "transparent",
  },
  optionLabel: {
    flex: 1,
    fontSize: s(14),
    color: "rgba(255,255,255,0.5)",
  },
  optionLabelActive: {
    color: "#B5B7DD",
    fontWeight: "600",
  },
  checkDot: {
    width: s(8),
    height: s(8),
    borderRadius: s(4),
    backgroundColor: "#B5B7DD",
  },
});
