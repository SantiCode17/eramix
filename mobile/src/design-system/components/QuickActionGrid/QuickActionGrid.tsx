/**
 * ────────────────────────────────────────────────────────
 *  QuickActionGrid — Grid de acciones rápidas
 * ────────────────────────────────────────────────────────
 */

import React from "react";
import { View, Text, StyleSheet, Pressable, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  animation,
} from "../../tokens";

export interface QuickAction {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  color?: string;
  onPress: () => void;
}

export interface QuickActionGridProps {
  actions: QuickAction[];
  columns?: number;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ActionItem({ action }: { action: QuickAction }) {
  const scale = useSharedValue(1);
  const accentColor = action.color || colors.eu.star;
  const bgColor = `${accentColor}14`; // 8% opacity

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.item, animatedStyle]}
      onPress={action.onPress}
      onPressIn={() => {
        scale.value = withSpring(0.93, animation.spring.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, animation.spring.default);
      }}
    >
      <BlurView intensity={15} tint="dark" style={styles.itemBlur}>
        <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
          <Ionicons name={action.icon} size={22} color={accentColor} />
        </View>
        <Text style={styles.label} numberOfLines={2}>
          {action.label}
        </Text>
      </BlurView>
    </AnimatedPressable>
  );
}

export function QuickActionGrid({
  actions,
  columns = 4,
  style,
}: QuickActionGridProps): React.JSX.Element {
  return (
    <View style={[styles.grid, { flexWrap: "wrap" }, style]}>
      {actions.map((action) => (
        <View
          key={action.id}
          style={{ width: `${100 / columns}%`, padding: spacing.xxs }}
        >
          <ActionItem action={action} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
  },
  item: {
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glass.border,
    ...shadows.glassSmall,
  },
  itemBlur: {
    alignItems: "center",
    padding: spacing.md,
    overflow: "hidden",
    borderRadius: radii.lg,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 14,
  },
});
