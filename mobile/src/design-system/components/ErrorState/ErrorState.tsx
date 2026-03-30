import React from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, typography, spacing } from "../../tokens";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function ErrorState({
  title = "Algo salió mal",
  message = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
  action,
  style,
}: ErrorStateProps): React.JSX.Element {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
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
    color: colors.status.error,
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
