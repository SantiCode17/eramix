import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

/**
 * Liquid Glass shimmer effect — simula tensión superficial del cristal líquido.
 * Usado en botones CTA y cards de perfil.
 */
export function useLiquidGlass(active = true) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;

    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    shimmerLoop.start();
    glowLoop.start();

    return () => {
      shimmerLoop.stop();
      glowLoop.stop();
    };
  }, [active]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.03, 0.12],
  });

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.0, 0.08],
  });

  return {
    shimmerStyle: {
      opacity: shimmerOpacity,
      transform: [{ translateX: shimmerTranslateX }],
    },
    glowStyle: {
      opacity: glowOpacity,
    },
  };
}
