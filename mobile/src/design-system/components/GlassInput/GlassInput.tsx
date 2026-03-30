import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
  TextInputProps,
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
  ...textInputProps
}: GlassInputProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  const hasValue = !!value && value.length > 0;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: animation.duration.fast,
        useNativeDriver: false,
      }),
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: animation.duration.normal,
        useNativeDriver: false,
      }),
    ]).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (!hasValue) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: animation.duration.fast,
        useNativeDriver: false,
      }).start();
    }
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: animation.duration.normal,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [17, -8],
  });

  const labelSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [typography.sizes.body.fontSize, typography.sizes.small.fontSize],
  });

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

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <View style={styles.inputWrapper}>
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelTop,
                fontSize: labelSize,
                color: error
                  ? colors.status.error
                  : isFocused
                    ? colors.eu.star
                    : colors.text.secondary,
              },
            ]}
          >
            {label}
          </Animated.Text>

          <TextInput
            style={[
              styles.input,
              leftIcon ? { paddingLeft: 0 } : null,
            ]}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={colors.text.disabled}
            selectionColor={colors.eu.star}
            {...textInputProps}
          />
        </View>

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}

        {success && !error && (
          <Text style={styles.successIcon}>✓</Text>
        )}
      </Animated.View>

      {error && (
        <Animated.Text style={styles.errorText}>{error}</Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  inputWrapper: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    position: "absolute",
    left: 0,
    fontFamily: typography.families.body,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  input: {
    color: colors.text.primary,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    paddingVertical: spacing.sm + 4,
    paddingTop: spacing.md,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
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
    marginLeft: spacing.md,
  },
});
