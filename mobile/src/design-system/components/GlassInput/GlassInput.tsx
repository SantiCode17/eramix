import React, { useRef, useState, useCallback } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
  TextInputProps,
  Pressable,
} from "react-native";
import {
  colors,
  typography,
  spacing,
  radii,
  opacity,
  animation,
} from "../../tokens";

export interface GlassInputProps extends Omit<TextInputProps, "style"> {
  label: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function GlassInput({
  label,
  error,
  success = false,
  leftIcon,
  rightIcon,
  containerStyle,
  value,
  onFocus,
  onBlur,
  placeholder,
  ...textInputProps
}: GlassInputProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  const [borderAnim] = useState(() => new Animated.Value(0));
  const inputRef = useRef<TextInput>(null);

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: animation.duration.normal,
        useNativeDriver: false,
      }).start();
      onFocus?.(e);
    },
    [onFocus, borderAnim],
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      Animated.timing(borderAnim, {
        toValue: 0,
        duration: animation.duration.normal,
        useNativeDriver: false,
      }).start();
      onBlur?.(e);
    },
    [onBlur, borderAnim],
  );

  const handleContainerPress = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const getBorderColor = () => {
    if (error) return colors.status.error;
    if (success) return colors.status.success;
    return borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        `rgba(255, 255, 255, ${opacity.border.subtle})`,
        colors.eu.star,
      ],
    });
  };

  const labelColor = error
    ? colors.status.error
    : isFocused
      ? colors.eu.star
      : colors.text.secondary;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Label ABOVE the input — always visible */}
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>

      <Pressable onPress={handleContainerPress}>
        <Animated.View
          style={[styles.inputContainer, { borderColor: getBorderColor() }]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
            ref={inputRef}
            style={[styles.input, leftIcon ? { paddingLeft: 0 } : null]}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={isFocused ? (placeholder ?? "") : ""}
            placeholderTextColor={colors.text.disabled}
            selectionColor={colors.eu.star}
            {...textInputProps}
          />

          {rightIcon && (
            <View style={styles.rightIcon} pointerEvents="box-none">
              {rightIcon}
            </View>
          )}

          {success && !error && (
            <Text style={styles.successIcon}>✓</Text>
          )}
        </Animated.View>
      </Pressable>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.small.fontSize,
    marginBottom: spacing.xs + 2,
    marginLeft: spacing.xs,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.white,
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    paddingVertical: 0,
    height: "100%" as any,
    textAlignVertical: "center",
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
    zIndex: 2,
  },
  successIcon: {
    color: colors.status.success,
    fontSize: 18,
    marginLeft: spacing.sm,
  },
  errorText: {
    color: colors.status.error,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.small.fontSize,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
