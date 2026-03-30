import { useEffect, useRef } from "react";
import { Animated, AccessibilityInfo, ViewStyle } from "react-native";
import { animation } from "../tokens";

export function useSlideUp(
  delay: number = 0,
  distance: number = 20
): { style: Animated.WithAnimatedObject<ViewStyle> } {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;
  const isReducedMotion = useRef(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      isReducedMotion.current = reduced;
    });
  }, []);

  useEffect(() => {
    if (isReducedMotion.current) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: animation.duration.normal,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: animation.duration.normal,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, distance, opacity, translateY]);

  return {
    style: {
      opacity,
      transform: [{ translateY }],
    },
  };
}
