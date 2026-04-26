import React, { useEffect } from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, View, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { colors, typography, spacing, radii, animation, shadows, borders } from "../../tokens";

export type GlassButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type GlassButtonSize = "sm" | "md" | "lg";

export interface GlassButtonProps {
  title: string;
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

const SZ = {
  sm: { pv: 10, ph: 16, fs: 13, r: radii.sm, h: 38 },
  md: { pv: 14, ph: 24, fs: 15, r: radii.md, h: 48 },
  lg: { pv: 18, ph: 32, fs: 17, r: radii.lg, h: 56 },
};

const GRADS: Record<GlassButtonVariant, [string, string]> = {
  primary: ["#FFD700", "#FF6D3F"],
  secondary: ["rgba(255,255,255,0.10)", "rgba(255,255,255,0.04)"],
  ghost: ["transparent", "transparent"],
  danger: ["#FF4F6F", "#FF2D87"],
  success: ["#00D68F", "#00BFA6"],
};

const TXT_C: Record<GlassButtonVariant, string> = {
  primary: "#06081A",
  secondary: colors.text.primary,
  ghost: colors.text.secondary,
  danger: "#FFFFFF",
  success: "#06081A",
};

export default function GlassButton({
  title, variant = "primary", size = "md", onPress, disabled = false,
  loading = false, icon, iconRight, style, fullWidth = false,
}: GlassButtonProps): React.JSX.Element {
  const scale = useSharedValue(1);
  const shimmerX = useSharedValue(0);

  useEffect(() => {
    if (variant === "primary" && !disabled) {
      shimmerX.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [variant, disabled]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmerX.value, [0, 1], [-200, 400]) }],
  }));

  const s = SZ[size];
  const tc = disabled ? colors.text.disabled : TXT_C[variant];

  const handlePressIn = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(animation.scale.press, animation.spring.snappy);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring.bouncy);
  };

  const shadow = variant === "primary" ? shadows.glow : variant === "danger" ? shadows.glowCoral : variant === "success" ? shadows.glowEmerald : shadows.none;

  return (
    <Animated.View style={[scaleStyle, fullWidth && ({ width: "100%" } as ViewStyle), style]}>
      <Pressable onPress={disabled || loading ? undefined : onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={[styles.pressable, disabled && styles.disabled]}>
        <View style={[styles.btnWrap, { borderRadius: s.r, minHeight: s.h }, variant !== "ghost" && !disabled && shadow, variant === "secondary" && styles.secondaryBorder]}>
          <LinearGradient
            colors={disabled ? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.03)"] as [string, string] : GRADS[variant]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {/* Shimmer sweep for primary buttons */}
          {variant === "primary" && !disabled && (
            <Animated.View style={[styles.shimmerWrap, shimmerStyle]}>
              <LinearGradient
                colors={["transparent", "rgba(255,255,255,0.30)", "transparent"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.shimmerGrad}
              />
            </Animated.View>
          )}
          <View style={[styles.content, { paddingVertical: s.pv, paddingHorizontal: s.ph }]}>
            {loading ? <ActivityIndicator size="small" color={tc} /> : (
              <>
                {icon ? <View style={styles.iconL}>{icon}</View> : null}
                <Text style={[styles.text, { fontSize: s.fs, color: tc, fontFamily: variant === "ghost" ? typography.families.bodyMedium : typography.families.subheading }]} numberOfLines={1}>{title}</Text>
                {iconRight ? <View style={styles.iconR}>{iconRight}</View> : null}
              </>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: { overflow: "hidden" },
  disabled: { opacity: 0.45 },
  btnWrap: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  shimmerWrap: { position: "absolute", top: 0, left: 0, bottom: 0, width: 80 },
  shimmerGrad: { flex: 1 },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  iconL: { marginRight: 2 },
  iconR: { marginLeft: 2 },
  text: { letterSpacing: 0.3, textAlign: "center" },
  secondaryBorder: { borderWidth: borders.thin, borderColor: colors.glass.borderMid },
});
