import { useCallback, useRef } from "react";
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useI18n } from "@/hooks/use-i18n";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onValueChange: (value: number) => void;
}

function CustomSlider({
  label,
  value,
  min,
  max,
  suffix,
  onValueChange,
}: SliderProps) {
  const trackRef = useRef<View>(null);
  const trackLayout = useRef({ x: 0, width: 0 });

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

  const ratio = (value - min) / (max - min);
  const displayValue = suffix ? `${value}${suffix}` : `${value}`;

  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.labelRow}>
        <Text style={sliderStyles.label}>{label}</Text>
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
          <View
            style={[sliderStyles.trackFill, { width: `${ratio * 100}%` }]}
          />
        </View>
        <View style={[sliderStyles.thumb, { left: `${ratio * 100}%` }]} />
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    color: "#333",
    fontSize: 15,
    fontWeight: "600",
  },
  value: {
    color: "#2f2482",
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

interface SettingsPanelProps {
  visible: boolean;
  onClose: () => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  contrast: number;
  onContrastChange: (value: number) => void;
  brightness: number;
  onBrightnessChange: (value: number) => void;
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
}: SettingsPanelProps) {
  const { t } = useI18n();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={panelStyles.backdrop} onPress={onClose}>
        <View
          style={panelStyles.dialog}
          onStartShouldSetResponder={() => true}
        >
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
            label={t.settings.fontSize}
            value={fontSize}
            min={12}
            max={24}
            onValueChange={onFontSizeChange}
          />
          <CustomSlider
            label={t.settings.contrast}
            value={contrast}
            min={70}
            max={100}
            suffix="%"
            onValueChange={onContrastChange}
          />
          <CustomSlider
            label={t.settings.brightness}
            value={brightness}
            min={70}
            max={100}
            suffix="%"
            onValueChange={onBrightnessChange}
          />
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
    boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    marginTop: -8,
    marginRight: -12,
  },
  title: {
    color: "#2f2482",
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
});
