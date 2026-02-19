import { IconSymbol } from "@/components/ui/icon-symbol";
import { useI18n } from "@/hooks/use-i18n";
import type { Lang } from "@/types/chat";
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
          <IconSymbol name={icon} size={16} color="#2f2482" />
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
    marginBottom: 28,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: "#333",
    fontSize: 15,
    fontWeight: "600",
  },
  value: {
    color: "#8886A0",
    fontSize: 15,
    fontWeight: "700",
  },
  trackOuter: {
    height: 32,
    justifyContent: "center",
  },
  track: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
  },
  trackFill: {
    height: 6,
    backgroundColor: "#2f2482",
    borderRadius: 3,
  },
  thumb: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2f2482",
    marginLeft: -11,
    top: 5,
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
              <IconSymbol name="xmark" size={18} color="#666" />
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
                <IconSymbol name="globe" size={16} color="#2f2482" />
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
                  <IconSymbol name="chevron.down" size={14} color="#7B7799" />
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dialog: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingTop: 34,
    paddingBottom: 18,
    boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    marginTop: -22,
    marginRight: -16,
  },
  title: {
    color: "#2f2482",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
  },
  closeButton: {
    padding: 4,
  },
});

const langStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
    fontSize: 18,
    marginRight: 6,
  },
  selectedLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2f2482",
    marginRight: 6,
  },
  options: {
    marginTop: 14,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E0",
  },
  optionActive: {
    backgroundColor: "transparent",
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    color: "#999",
  },
  optionLabelActive: {
    color: "#2f2482",
    fontWeight: "600",
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2f2482",
  },
});
