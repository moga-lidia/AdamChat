import { useEffect, useRef } from "react";
import { Animated, Keyboard, Platform } from "react-native";

/**
 * Returns an Animated.Value that tracks keyboard height.
 * On iOS subtracts bottom inset (home indicator) since the keyboard
 * sits above it. On Android uses the full reported height.
 */
export function useKeyboardPadding(bottomInset: number) {
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(showEvent, (e) => {
      const offset =
        Platform.OS === "ios"
          ? Math.max(0, e.endCoordinates.height - bottomInset)
          : e.endCoordinates.height;
      Animated.timing(keyboardPadding, {
        toValue: offset,
        duration: Platform.OS === "ios" ? e.duration : 150,
        useNativeDriver: false,
      }).start();
    });
    const onHide = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardPadding, {
        toValue: 0,
        duration: Platform.OS === "ios" ? (e as any).duration : 150,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [bottomInset, keyboardPadding]);

  return keyboardPadding;
}
