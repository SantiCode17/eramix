import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { BlurView } from "expo-blur";
import { colors, radii, opacity, blur as blurTokens, shadows, spacing } from "../../tokens";

export type GlassCardVariant = "surface" | "elevated" | "prominent";

export interface GlassCardProps {
  variant?: GlassCardVariant;
  blurIntensity?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof spacing;
  onPress?: () => void;
}

const variantConfig = {
  surface: {
    bgOpacity: opacity.glass.surface,
    blurAmount: blurTokens.surface,
    borderOpacity: opacity.border.subtle,
    radius: radii.lg,
  },
  elevated: {
    bgOpacity: opacity.glass.elevated,
    blurAmount: blurTokens.elevated,
    borderOpacity: opacity.border.mid,
    radius: radii.lg,
  },
  prominent: {
    bgOpacity: opacity.glass.prominent,
    blurAmount: blurTokens.prominent,
    borderOpacity: opacity.border.strong,
    radius: radii.xl,
  },
};

export default function GlassCard({
  variant = "surface",
  blurIntensity,
  children,
  style,
  padding = "md",
}: GlassCardProps): React.JSX.Element {
  const config = variantConfig[variant];
  const blurAmount = blurIntensity ?? config.blurAmount;

  return (
    <View
      style={[
        styles.outer,
        { borderRadius: config.radius },
        shadows.glass,
        style,
      ]}
    >
      <BlurView
        intensity={blurAmount}
        tint="dark"
        style={[styles.blur, { borderRadius: config.radius }]}
      >
        <View
          style={[
            styles.inner,
            {
              backgroundColor: `rgba(255, 255, 255, ${config.bgOpacity})`,
              borderColor: `rgba(255, 255, 255, ${config.borderOpacity})`,
              borderTopColor: `rgba(255, 255, 255, ${config.borderOpacity + 0.1})`,
              borderRadius: config.radius,
              padding: spacing[padding],
            },
          ]}
        >
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: "hidden",
  },
  blur: {
    overflow: "hidden",
  },
  inner: {
    borderWidth: 1,
    overflow: "hidden",
  },
});
