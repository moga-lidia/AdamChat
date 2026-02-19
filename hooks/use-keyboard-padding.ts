import { useEffect, useRef } from "react";
import { Animated, Keyboard, Platform } from "react-native";

/**
 * Returns an Animated.Value that tracks keyboard height minus bottom inset.
 * Useful for sliding chat input above the keyboard.
 */
export function useKeyboardPadding(bottomInset: number) {
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardPadding, {
        toValue: e.endCoordinates.height - bottomInset,
        duration: Platform.OS === "ios" ? e.duration : 200,
        useNativeDriver: false,
      }).start();
    });
    const onHide = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardPadding, {
        toValue: 0,
        duration: Platform.OS === "ios" ? (e as any).duration : 200,
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
