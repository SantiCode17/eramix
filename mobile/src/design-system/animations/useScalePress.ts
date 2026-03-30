import { useRef, useCallback } from "react";
import { Animated, ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { animation } from "../tokens";

interface ScalePressReturn {
  style: Animated.WithAnimatedObject<ViewStyle>;
  onPressIn: () => void;
  onPressOut: () => void;
}

export function useScalePress(scaleTo: number = animation.scale.press): ScalePressReturn {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scale, {
      toValue: scaleTo,
      ...animation.spring.default,
      useNativeDriver: true,
    }).start();
  }, [scale, scaleTo]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      ...animation.spring.default,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return {
    style: { transform: [{ scale }] },
    onPressIn,
    onPressOut,
  };
}
