/**
 * ────────────────────────────────────────────────────────
 *  FloatingActionButton — FAB con gradiente
 * ────────────────────────────────────────────────────────
 */

import React from "react";
import { StyleSheet, Pressable, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  colors,
  radii,
  shadows,
  animation,
} from "../../tokens";

export interface FloatingActionButtonProps {
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  gradientColors?: readonly [string, string, ...string[]];
  size?: number;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingActionButton({
  icon = "add",
  onPress,
  gradientColors = colors.gradient.primary,
  size = 56,
  style,
}: FloatingActionButtonProps): React.JSX.Element {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(animation.scale.press, animation.spring.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, animation.spring.default);
      }}
    >
      <LinearGradient
        colors={gradientColors}
        style={[styles.gradient, { borderRadius: size / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={size * 0.45} color="#FFF" />
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    right: 24,
    ...shadows.floating,
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
