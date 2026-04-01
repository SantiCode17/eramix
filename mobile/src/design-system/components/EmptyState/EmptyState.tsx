import React from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing } from "../../tokens";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export interface EmptyStateProps {
  icon?: IoniconsName;
  title: string;
  message?: string;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export default function EmptyState({
  icon = "search-outline",
  title,
  message,
  action,
  style,
  compact = false,
}: EmptyStateProps): React.JSX.Element {
  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={compact ? 28 : 36} color={colors.text.tertiary} />
      </View>
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, compact && styles.messageCompact]}>{message}</Text>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  containerCompact: { paddingVertical: spacing.lg, gap: spacing.xs },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  titleCompact: { fontSize: 17 },
  message: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  messageCompact: { fontSize: 13 },
  action: { marginTop: spacing.md },
});
