import { useEffect, useRef } from "react";
import { Animated } from "react-native";

/**
 * Returns an array of animated styles (opacity + translateY) that
 * fire in staggered sequence on mount — used for welcome-screen entrance.
 */
export function useStaggeredEntry(count: number, baseDelay = 120) {
  const anims = useRef(
    Array.from({ length: count }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: i * baseDelay,
        useNativeDriver: true,
      }),
    );
    Animated.stagger(baseDelay, animations).start();
  }, [anims, baseDelay]);

  return anims.map((anim) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  }));
}
