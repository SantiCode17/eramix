import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

/**
 * Breathing glow effect — sutil pulsación de luz para elementos destacados.
 */
export function useBreathingGlow(active = true) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active]);

  const shadowOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.4],
  });

  const shadowRadius = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 24],
  });

  return { shadowOpacity, shadowRadius };
}
