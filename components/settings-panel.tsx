import { useCallback, useRef } from "react";
import {
  GestureResponderEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onValueChange: (value: number) => void;
}

function CustomSlider({ label, value, min, max, suffix, onValueChange }: SliderProps) {
  const trackWidth = useRef(0);
  const callbackRef = useRef(onValueChange);
  callbackRef.current = onValueChange;

  const handleTouch = useCallback(
    (evt: GestureResponderEvent) => {
      if (trackWidth.current > 0) {
        const x = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(1, x / trackWidth.current));
        callbackRef.current(Math.round(min + ratio * (max - min)));
      }
    },
    [min, max],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => handleTouch(evt),
      onPanResponderMove: (evt) => handleTouch(evt),
    }),
  ).current;

  const ratio = (value - min) / (max - min);
  const displayValue = suffix ? `${value}${suffix}` : `${value}`;

  return (
    <View style={sliderStyles.container}>
      <View style={sliderStyles.labelRow}>
        <Text style={sliderStyles.label}>{label}</Text>
        <Text style={sliderStyles.value}>{displayValue}</Text>
      </View>
      <View
        style={sliderStyles.track}
        onLayout={(e) => {
          trackWidth.current = e.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}
      >
        <View style={[sliderStyles.trackFill, { width: `${ratio * 100}%` }]} />
        <View
          style={[
            sliderStyles.thumb,
            { left: `${ratio * 100}%` },
          ]}
        />
      </View>
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  value: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  track: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 3,
    justifyContent: "center",
  },
  trackFill: {
    height: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  thumb: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    marginLeft: -10,
    top: -7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
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
  if (!visible) return null;

  return (
    <View style={panelStyles.overlay}>
      <View style={panelStyles.panel}>
        <View style={panelStyles.header}>
          <Text style={panelStyles.title}>Setari</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              panelStyles.closeButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={panelStyles.closeText}>—</Text>
          </Pressable>
        </View>

        <CustomSlider
          label="Mărime Font"
          value={fontSize}
          min={12}
          max={24}
          onValueChange={onFontSizeChange}
        />
        <CustomSlider
          label="Contrast"
          value={contrast}
          min={50}
          max={150}
          suffix="%"
          onValueChange={onContrastChange}
        />
        <CustomSlider
          label="Luminozitate"
          value={brightness}
          min={50}
          max={150}
          suffix="%"
          onValueChange={onBrightnessChange}
        />
      </View>
    </View>
  );
}

const panelStyles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 100,
  },
  panel: {
    backgroundColor: "#2f2482",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
