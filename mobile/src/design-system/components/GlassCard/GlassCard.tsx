import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii, opacity, shadows, spacing, borders } from "../../tokens";

export type GlassCardVariant = "surface" | "elevated" | "prominent" | "accent" | "outlined";

export interface GlassCardProps {
  variant?: GlassCardVariant;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof spacing;
  onPress?: () => void;
  noPadding?: boolean;
  glowColor?: string;
}

const variantConfig = {
  surface: {
    borderOpacity: opacity.border.subtle,
    radius: radii.lg,
    shadow: shadows.glassSmall,
    gradientColors: ["rgba(15, 21, 53, 0.55)", "rgba(11, 14, 42, 0.70)"],
    borderTopHighlight: 0.12,
  },
  elevated: {
    borderOpacity: opacity.border.mid,
    radius: radii.lg,
    shadow: shadows.glass,
    gradientColors: ["rgba(20, 28, 68, 0.60)", "rgba(15, 21, 53, 0.75)"],
    borderTopHighlight: 0.18,
  },
  prominent: {
    borderOpacity: opacity.border.strong,
    radius: radii.xl,
    shadow: shadows.elevated,
    gradientColors: ["rgba(26, 61, 232, 0.12)", "rgba(15, 21, 53, 0.80)"],
    borderTopHighlight: 0.25,
  },
  accent: {
    borderOpacity: opacity.border.strong,
    radius: radii.lg,
    shadow: shadows.glow,
    gradientColors: ["rgba(255, 215, 0, 0.06)", "rgba(15, 21, 53, 0.70)"],
    borderTopHighlight: 0.3,
  },
  outlined: {
    borderOpacity: opacity.border.mid,
    radius: radii.lg,
    shadow: shadows.none,
    gradientColors: ["rgba(15, 21, 53, 0.20)", "rgba(11, 14, 42, 0.30)"],
    borderTopHighlight: 0.08,
  },
};

export default function GlassCard({
  variant = "surface",
  children,
  style,
  padding = "md",
  onPress,
  noPadding = false,
  glowColor,
}: GlassCardProps): React.JSX.Element {
  const config = variantConfig[variant];
  const cardContent = (
    <View
      style={[
        styles.outer,
        { borderRadius: config.radius },
        config.shadow,
        glowColor ? { shadowColor: glowColor, shadowOpacity: 0.25, shadowRadius: 16 } : null,
        style,
      ]}
    >
      <LinearGradient
        colors={config.gradientColors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={[styles.gradient, { borderRadius: config.radius }]}
      >
        <View
          style={[
            styles.inner,
            {
              borderColor: `rgba(255, 255, 255, ${config.borderOpacity})`,
              borderTopColor: `rgba(255, 255, 255, ${config.borderTopHighlight})`,
              borderLeftColor: `rgba(255, 255, 255, ${config.borderTopHighlight * 0.8})`,
              borderRightColor: `rgba(255, 255, 255, ${config.borderOpacity * 0.6})`,
              borderBottomColor: `rgba(255, 255, 255, ${config.borderOpacity * 0.5})`,
              borderRadius: config.radius,
              padding: noPadding ? 0 : spacing[padding],
            },
          ]}
        >
          {children}
        </View>
      </LinearGradient>
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] }]}>
        {cardContent}
      </Pressable>
    );
  }
  return cardContent;
}

const styles = StyleSheet.create({
  outer: { overflow: "hidden" },
  gradient: { overflow: "hidden" },
  inner: { borderWidth: borders.hairline, overflow: "hidden" },
});
