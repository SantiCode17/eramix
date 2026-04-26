import React from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography, shadows } from "../../tokens";

export interface BadgeProps {
  count?: number;
  maxCount?: number;
  variant?: "primary" | "secondary" | "error" | "success" | "accent";
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

const GRADS: Record<string, [string, string]> = {
  primary: ["#FFD700", "#FF6D3F"],
  secondary: ["#3B6BFF", "#6B9CFF"],
  error: ["#FF4F6F", "#FF2D87"],
  success: ["#00D68F", "#00BFA6"],
  accent: ["#8B5CF6", "#B47AFF"],
};

const TXT: Record<string, string> = {
  primary: colors.text.inverse,
  secondary: "#FFFFFF",
  error: "#FFFFFF",
  success: colors.text.inverse,
  accent: "#FFFFFF",
};

export default function Badge({
  count,
  maxCount = 99,
  variant = "error",
  dot = false,
  style,
}: BadgeProps): React.JSX.Element {
  const gradColors = GRADS[variant] ?? GRADS.error;
  const fg = TXT[variant] ?? "#FFFFFF";

  if (dot) {
    return (
      <View style={[styles.dotOuter, style]}>
        <LinearGradient colors={gradColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.dot} />
      </View>
    );
  }

  const label = count !== undefined && count > maxCount ? `${maxCount}+` : String(count ?? 0);

  return (
    <View style={[styles.badgeOuter, style]}>
      <LinearGradient colors={gradColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.badge}>
        <Text style={[styles.text, { color: fg }]}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  dotOuter: { ...shadows.sm },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#04061A",
  },
  badgeOuter: { ...shadows.sm },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#04061A",
  },
  text: {
    fontSize: 11,
    fontFamily: typography.families.bodyBold,
    fontWeight: "700",
    lineHeight: 14,
    letterSpacing: 0.2,
  },
});
