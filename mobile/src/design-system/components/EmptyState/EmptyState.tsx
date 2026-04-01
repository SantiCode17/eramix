import React from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { colors, typography, spacing, radii } from "../../tokens";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

export interface EmptyStateProps {
  icon?: string;
  iconName?: IoniconsName;
  title: string;
  message?: string;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function EmptyState({
  icon,
  iconName,
  title,
  message,
  action,
  style,
}: EmptyStateProps): React.JSX.Element {
  return (
    <View style={[styles.container, style]}>
      {iconName ? (
        <Ionicons name={iconName} size={48} color={colors.text.secondary} style={{ marginBottom: spacing.md }} />
      ) : icon ? (
        <Text style={styles.icon}>{icon}</Text>
      ) : (
        <Ionicons name="file-tray-outline" size={48} color={colors.text.secondary} style={{ marginBottom: spacing.md }} />
      )}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text.primary,
    fontSize: typography.sizes.h3.fontSize,
    fontFamily: typography.families.heading,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.text.secondary,
    fontSize: typography.sizes.body.fontSize,
    fontFamily: typography.families.body,
    textAlign: "center",
    lineHeight: typography.sizes.body.lineHeight,
    marginBottom: spacing.lg,
  },
  action: {
    marginTop: spacing.sm,
  },
});
