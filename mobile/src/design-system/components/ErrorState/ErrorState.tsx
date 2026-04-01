import React from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassButton from "../GlassButton/GlassButton";
import { colors, typography, spacing } from "../../tokens";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export default function ErrorState({
  title = "Algo salio mal",
  message = "Ha ocurrido un error inesperado. Intenta de nuevo.",
  onRetry,
  retryLabel = "Reintentar",
  style,
}: ErrorStateProps): React.JSX.Element {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name="warning-outline" size={32} color={colors.status.error} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <GlassButton title={retryLabel} variant="secondary" size="sm" onPress={onRetry} style={styles.button} />
      ) : null}
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.status.errorBg,
    borderWidth: 1,
    borderColor: "rgba(255, 79, 111, 0.20)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  message: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  button: { marginTop: spacing.md },
});
