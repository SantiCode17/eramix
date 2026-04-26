/**
 * ────────────────────────────────────────────────────────
 *  SectionHeader — Título de sección reutilizable
 * ────────────────────────────────────────────────────────
 */

import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import {
  colors,
  typography,
  spacing,
} from "../../tokens";

export interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({
  title,
  action,
  onAction,
}: SectionHeaderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
  },
  action: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.eu.star,
  },
});
