import React from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, radii, typography, spacing } from "../../tokens";

export interface BadgeProps {
  count?: number;
  maxCount?: number;
  variant?: "primary" | "secondary" | "error";
  dot?: boolean;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_BG: Record<string, string> = {
  primary: colors.eu.star,
  secondary: colors.eu.deep,
  error: colors.status.error,
};

const VARIANT_TEXT: Record<string, string> = {
  primary: colors.background.end,
  secondary: colors.text.primary,
  error: colors.text.primary,
};

export default function Badge({
  count,
  maxCount = 99,
  variant = "error",
  dot = false,
  style,
}: BadgeProps): React.JSX.Element {
  const bg = VARIANT_BG[variant] ?? VARIANT_BG.error;
  const fg = VARIANT_TEXT[variant] ?? VARIANT_TEXT.error;

  if (dot) {
    return <View style={[styles.dot, { backgroundColor: bg }, style]} />;
  }

  const label = count !== undefined && count > maxCount ? `${maxCount}+` : String(count ?? 0);

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: spacing.xs,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 11,
    fontFamily: typography.families.bodyBold,
    fontWeight: "700",
    lineHeight: 14,
  },
});
