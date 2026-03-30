import { useEffect, useRef } from "react";
import { Animated, AccessibilityInfo, ViewStyle } from "react-native";
import { animation } from "../tokens";

export function useStaggeredList(
  itemCount: number,
  baseDelay: number = animation.duration.stagger
): { styles: Animated.WithAnimatedObject<ViewStyle>[] } {
  const animations = useRef<Animated.Value[]>([]).current;
  const translates = useRef<Animated.Value[]>([]).current;
  const isReducedMotion = useRef(false);

  while (animations.length < itemCount) {
    animations.push(new Animated.Value(0));
    translates.push(new Animated.Value(20));
  }

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      isReducedMotion.current = reduced;
    });
  }, []);

  useEffect(() => {
    if (isReducedMotion.current) {
      animations.forEach((anim) => anim.setValue(1));
      translates.forEach((t) => t.setValue(0));
      return;
    }

    const staggered = animations.slice(0, itemCount).map((anim, index) =>
      Animated.parallel([
        Animated.timing(anim, {
          toValue: 1,
          duration: animation.duration.normal,
          delay: index * baseDelay,
          useNativeDriver: true,
        }),
        Animated.timing(translates[index], {
          toValue: 0,
          duration: animation.duration.normal,
          delay: index * baseDelay,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(staggered).start();
  }, [itemCount, baseDelay, animations, translates]);

  const styles = animations.slice(0, itemCount).map((anim, index) => ({
    opacity: anim,
    transform: [{ translateY: translates[index] }],
  }));

  return { styles };
}
