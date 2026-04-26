import { useRef, useCallback } from "react";
import { Animated } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Bounce scale press — para interacciones con feedback háptico y visual.
 */
export function useBouncePress(scaleTo = 0.94) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scale, {
      toValue: scaleTo,
      damping: 15,
      stiffness: 400,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  }, [scaleTo]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      damping: 8,
      stiffness: 300,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  }, []);

  return {
    scale,
    animatedStyle: { transform: [{ scale }] },
    handlers: { onPressIn, onPressOut },
  };
}
