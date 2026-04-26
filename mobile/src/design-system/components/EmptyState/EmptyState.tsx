import React from "react";
import { View, Text, Image, StyleSheet, ViewStyle, StyleProp, ImageSourcePropType, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography, spacing } from "../../tokens";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export interface EmptyStateProps {
  icon?: IoniconsName;
  image?: ImageSourcePropType;
  imageWidth?: number;
  title: string;
  message?: string;
  /** Legacy: pass a ReactNode as CTA */
  action?: React.ReactNode;
  /** New: simple CTA label — renders a glass outline button */
  ctaLabel?: string;
  onCtaPress?: () => void;
  /** Use gradient gold-orange CTA instead of glass outline */
  ctaGradient?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export default function EmptyState({
  icon = "search-outline",
  image,
  imageWidth,
  title,
  message,
  action,
  ctaLabel,
  onCtaPress,
  ctaGradient = false,
  style,
  compact = false,
}: EmptyStateProps): React.JSX.Element {
  const imgW = imageWidth ?? (compact ? 120 : 180);

  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      {image ? (
        <Image
          source={image}
          style={{ width: imgW, height: imgW, marginBottom: 20 }}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={compact ? 24 : 30} color="rgba(255,255,255,0.50)" />
        </View>
      )}
      <Text style={[styles.title, compact && styles.titleCompact]}>{title}</Text>
      {message ? (
        <Text style={[styles.message, compact && styles.messageCompact]}>{message}</Text>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
      {!action && ctaLabel && onCtaPress ? (
        ctaGradient ? (
          <Pressable onPress={onCtaPress} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
            <LinearGradient
              colors={["#FFD700", "#FF6B2B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradientButton}
            >
              <Text style={styles.ctaGradientText}>{ctaLabel}</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable onPress={onCtaPress} style={({ pressed }) => [styles.ctaButton, pressed && { opacity: 0.7 }]}>
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </Pressable>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  containerCompact: { paddingVertical: spacing.lg },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 22,
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  titleCompact: { fontSize: 17 },
  message: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: "rgba(255,255,255,0.60)",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 24,
  },
  messageCompact: { fontSize: 13 },
  action: { marginTop: 0 },
  ctaButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
  ctaText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: "#FFFFFF",
  },
  ctaGradientButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaGradientText: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: "#0A1628",
    fontWeight: "700",
  },
});
