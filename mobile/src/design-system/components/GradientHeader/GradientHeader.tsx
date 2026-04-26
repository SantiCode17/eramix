/**
 * ────────────────────────────────────────────────────────
 *  GradientHeader — Header con gradiente premium
 * ────────────────────────────────────────────────────────
 */

import React from "react";
import { View, Text, StyleSheet, Pressable, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  typography,
  spacing,
  radii,
  DS,
} from "../../tokens";

export interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: React.ComponentProps<typeof Ionicons>["name"];
  onRightPress?: () => void;
  gradientColors?: readonly [string, string, ...string[]];
  style?: ViewStyle;
}

export function GradientHeader({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
  gradientColors = [DS.background, "#0E1A35"],
  style,
}: GradientHeaderProps): React.JSX.Element {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, { paddingTop: insets.top + spacing.md }, style]}
    >
      <View style={styles.row}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.iconBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightIcon ? (
          <Pressable onPress={onRightPress} style={styles.iconBtn} hitSlop={12}>
            <Ionicons name={rightIcon} size={22} color={colors.text.primary} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
