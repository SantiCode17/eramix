import React, { useState, useEffect } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  colors,
  typography,
  spacing,
  radii,
  animation,
  shadows,
  opacity,
  MIN_TOUCH_SIZE,
} from "../../tokens";

export type GlassButtonVariant = "primary" | "secondary" | "ghost";
export type GlassButtonSize = "sm" | "md" | "lg";

export interface GlassButtonProps {
  title: string;
  variant?: GlassButtonVariant;
  size?: GlassButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const sizeConfig = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: typography.sizes.caption.fontSize },
  md: { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, fontSize: typography.sizes.button.fontSize },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, fontSize: typography.sizes.button.fontSize + 2 },
};

export default function GlassButton({
  title,
  variant = "primary",
  size = "md",
  onPress,
  disabled = false,
  loading = false,
  icon,
  style,
}: GlassButtonProps): React.JSX.Element {
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const [shimmerAnim] = useState(() => new Animated.Value(0));
  const sizeValues = sizeConfig[size];

  useEffect(() => {
    if (variant === "primary" && !disabled) {
      const shimmerLoop = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      );
      shimmerLoop.start();
      return () => shimmerLoop.stop();
    }
  }, [variant, disabled, shimmerAnim]);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: animation.scale.press,
      ...animation.spring.default,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      ...animation.spring.default,
      useNativeDriver: true,
    }).start();
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? colors.text.inverse : colors.text.primary}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                fontSize: sizeValues.fontSize,
                fontFamily: typography.families.subheading,
                color: variant === "primary" ? colors.text.inverse : colors.text.primary,
                marginLeft: icon ? spacing.sm : 0,
              },
              disabled && styles.textDisabled,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </>
  );

  if (variant === "primary") {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={[styles.base, { minHeight: MIN_TOUCH_SIZE }]}
        >
          <LinearGradient
            colors={disabled
              ? ["rgba(255, 204, 0, 0.4)", "rgba(255, 107, 43, 0.4)"]
              : [colors.accent.start, colors.accent.end]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.gradient,
              {
                paddingVertical: sizeValues.paddingVertical,
                paddingHorizontal: sizeValues.paddingHorizontal,
                borderRadius: radii.full,
              },
              shadows.glow,
            ]}
          >
            {renderContent()}
            {!disabled && (
              <Animated.View
                style={[
                  styles.shimmer,
                  { transform: [{ translateX: shimmerTranslate }] },
                ]}
              />
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.base,
          styles.secondary,
          {
            paddingVertical: sizeValues.paddingVertical,
            paddingHorizontal: sizeValues.paddingHorizontal,
            borderRadius: radii.full,
            minHeight: MIN_TOUCH_SIZE,
            borderColor: variant === "ghost"
              ? "transparent"
              : `rgba(255, 255, 255, ${opacity.border.mid})`,
          },
          disabled && styles.secondaryDisabled,
        ]}
      >
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  secondary: {
    backgroundColor: colors.glass.white,
    borderWidth: 1,
  },
  secondaryDisabled: {
    opacity: 0.4,
  },
  text: {
    textAlign: "center",
  },
  textDisabled: {
    opacity: 0.5,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    transform: [{ skewX: "-20deg" }],
  },
});
