/**
 * ────────────────────────────────────────────────────────
 *  GlassMetricCard — Card con métrica y icono
 * ────────────────────────────────────────────────────────
 */

import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
} from "../../tokens";

export interface GlassMetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor?: string;
  iconBgColor?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  gradientColors?: readonly [string, string, ...string[]];
  style?: ViewStyle;
}

export function GlassMetricCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = colors.eu.star,
  iconBgColor = "rgba(255, 215, 0, 0.12)",
  trend,
  trendValue,
  gradientColors = colors.gradient.surface,
  style,
}: GlassMetricCardProps): React.JSX.Element {
  const trendIcon =
    trend === "up"
      ? "trending-up"
      : trend === "down"
        ? "trending-down"
        : "remove";
  const trendColor =
    trend === "up"
      ? colors.status.success
      : trend === "down"
        ? colors.status.error
        : colors.text.tertiary;

  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={25} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          {trend && trendValue && (
            <View style={styles.trendBadge}>
              <Ionicons name={trendIcon} size={14} color={trendColor} />
              <Text style={[styles.trendText, { color: trendColor }]}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.glass.border,
    ...shadows.glassSmall,
  },
  blur: {
    padding: spacing.md,
    overflow: "hidden",
    borderRadius: radii.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  trendText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.tiny.fontSize,
  },
  title: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontFamily: typography.families.heading,
    fontSize: 24,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.tertiary,
    marginTop: spacing.xxs,
  },
});
