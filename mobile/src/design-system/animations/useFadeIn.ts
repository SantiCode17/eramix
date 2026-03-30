import { useEffect, useRef } from "react";
import { Animated, AccessibilityInfo, ViewStyle } from "react-native";
import { animation } from "../tokens";

export function useFadeIn(delay: number = 0): { style: Animated.WithAnimatedObject<ViewStyle> } {
  const opacity = useRef(new Animated.Value(0)).current;
  const isReducedMotion = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      isReducedMotion.current = reduced;
    });
  }, []);

  useEffect(() => {
    if (isReducedMotion.current) {
      opacity.setValue(1);
      return;
    }

    Animated.timing(opacity, {
      toValue: 1,
      duration: animation.duration.normal,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, opacity]);

  return { style: { opacity } };
}
