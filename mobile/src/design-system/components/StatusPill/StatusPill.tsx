/**
 * ────────────────────────────────────────────────────────
 *  StatusPill — Pill de estado con colores dinámicos
 * ────────────────────────────────────────────────────────
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  radii,
} from "../../tokens";

type StatusVariant = "success" | "warning" | "error" | "info" | "neutral";

const variantConfig: Record<StatusVariant, { bg: string; text: string; icon: string }> = {
  success: { bg: "rgba(0, 214, 143, 0.12)", text: colors.status.success, icon: "checkmark-circle" },
  warning: { bg: "rgba(255, 171, 0, 0.12)", text: colors.status.warning, icon: "warning" },
  error: { bg: "rgba(255, 79, 111, 0.12)", text: colors.status.error, icon: "close-circle" },
  info: { bg: "rgba(59, 107, 255, 0.12)", text: colors.status.info, icon: "information-circle" },
  neutral: { bg: colors.glass.white, text: colors.text.secondary, icon: "ellipse" },
};

export interface StatusPillProps {
  label: string;
  variant?: StatusVariant;
  showIcon?: boolean;
  style?: ViewStyle;
}

export function StatusPill({
  label,
  variant = "neutral",
  showIcon = true,
  style,
}: StatusPillProps): React.JSX.Element {
  const config = variantConfig[variant];

  return (
    <View style={[styles.container, { backgroundColor: config.bg }, style]}>
      {showIcon && (
        <Ionicons name={config.icon as any} size={12} color={config.text} />
      )}
      <Text style={[styles.label, { color: config.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 1,
    borderRadius: radii.full,
  },
  label: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.tiny.fontSize,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
