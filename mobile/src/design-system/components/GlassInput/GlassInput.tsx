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
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  radii,
  animation,
  borders,
  shadows,
} from "../../tokens";

export interface GlassInputProps extends Omit<TextInputProps, "style"> {
  label: string;
  error?: string;
  success?: boolean;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function GlassInput({
  label,
  error,
  success = false,
  hint,
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
  const [labelAnim] = useState(() => new Animated.Value(value ? 1 : 0));
  const inputRef = useRef<TextInput>(null);

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(borderAnim, { toValue: 1, duration: animation.duration.normal, useNativeDriver: false }),
      Animated.timing(labelAnim, { toValue: 1, duration: animation.duration.normal, useNativeDriver: false }),
    ]).start();
  }, [borderAnim, labelAnim]);

  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(borderAnim, { toValue: 0, duration: animation.duration.normal, useNativeDriver: false }),
      ...(value ? [] : [Animated.timing(labelAnim, { toValue: 0, duration: animation.duration.normal, useNativeDriver: false })]),
    ]).start();
  }, [borderAnim, labelAnim, value]);

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      animateIn();
      onFocus?.(e);
    },
    [onFocus, animateIn],
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      animateOut();
      onBlur?.(e);
    },
    [onBlur, animateOut],
  );

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? colors.status.error : colors.glass.borderMid,
      error ? colors.status.error : success ? colors.status.success : colors.eu.mid,
    ],
  });

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 6],
  });

  const labelSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 11],
  });

  const labelColor = error
    ? colors.status.error
    : isFocused
    ? colors.eu.star
    : colors.text.secondary;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Pressable onPress={() => inputRef.current?.focus()}>
        <Animated.View
          style={[
            styles.container,
            { borderColor },
            isFocused && !error && styles.containerFocused,
            error ? styles.containerError : null,
            success && !error ? styles.containerSuccess : null,
          ]}
        >
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelTop,
                fontSize: labelSize,
                color: labelColor,
                left: leftIcon ? 44 : spacing.md,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>

          <View style={styles.inputRow}>
            {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
            <TextInput
              ref={inputRef}
              value={value}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={isFocused ? placeholder : ""}
              placeholderTextColor={colors.text.disabled}
              style={[styles.input, leftIcon ? { paddingLeft: 0 } : null]}
              selectionColor={colors.eu.star}
              {...textInputProps}
            />
            {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
          </View>
        </Animated.View>
      </Pressable>

      {error ? (
        <View style={styles.messageRow}>
          <Ionicons name="alert-circle" size={13} color={colors.status.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  container: {
    backgroundColor: colors.background.input,
    borderWidth: borders.medium,
    borderColor: colors.glass.borderMid,
    borderRadius: radii.md,
    minHeight: 58,
    justifyContent: "center",
    overflow: "hidden",
  },
  containerFocused: {
    backgroundColor: "rgba(26, 61, 232, 0.05)",
  },
  containerError: {
    backgroundColor: "rgba(255, 79, 111, 0.04)",
    borderColor: colors.status.error,
  },
  containerSuccess: { borderColor: colors.status.success },
  label: {
    position: "absolute",
    fontFamily: typography.families.bodyMedium,
    letterSpacing: 0.2,
    zIndex: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: 20,
    paddingBottom: 6,
  },
  leftIcon: { marginRight: spacing.sm, width: 24, alignItems: "center" },
  rightIcon: { marginLeft: spacing.sm },
  input: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
    minHeight: 24,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.status.error,
    flex: 1,
  },
  hintText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 6,
    paddingHorizontal: spacing.xs,
  },
});
