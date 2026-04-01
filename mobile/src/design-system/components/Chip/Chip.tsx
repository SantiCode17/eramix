import React from "react";
import { Pressable, Text, View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, typography, borders } from "../../tokens";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  variant?: "default" | "filled" | "accent";
  size?: "sm" | "md";
  style?: StyleProp<ViewStyle>;
}

export default function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  disabled = false,
  icon,
  variant = "default",
  size = "md",
  style,
}: ChipProps): React.JSX.Element {
  const isAccent = variant === "accent" || selected;
  const isFilled = variant === "filled";
  const isSm = size === "sm";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        isSm && styles.chipSm,
        isAccent && styles.chipAccent,
        isFilled && styles.chipFilled,
        disabled && styles.chipDisabled,
        pressed && !disabled && { opacity: 0.8, transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      {isAccent && (
        <LinearGradient
          colors={["rgba(255, 215, 0, 0.15)", "rgba(255, 109, 63, 0.08)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {icon ? (
        <Ionicons
          name={icon}
          size={isSm ? 12 : 14}
          color={isAccent ? colors.eu.star : colors.text.secondary}
          style={{ marginRight: 4 }}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          isSm && styles.labelSm,
          isAccent && styles.labelAccent,
          isFilled && styles.labelFilled,
          disabled && styles.labelDisabled,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {onRemove && !disabled && (
        <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
          <Ionicons name="close" size={12} color={colors.text.tertiary} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: borders.thin,
    borderColor: colors.glass.borderMid,
    backgroundColor: colors.glass.white,
    overflow: "hidden",
  },
  chipSm: { paddingHorizontal: 10, paddingVertical: 5 },
  chipAccent: { borderColor: "rgba(255, 215, 0, 0.30)", backgroundColor: "transparent" },
  chipFilled: { borderColor: "transparent", backgroundColor: colors.eu.deep },
  chipDisabled: { opacity: 0.35 },
  label: {
    color: colors.text.secondary,
    fontSize: 13,
    fontFamily: typography.families.bodyMedium,
    letterSpacing: 0.1,
  },
  labelSm: { fontSize: 11 },
  labelAccent: { color: colors.eu.star },
  labelFilled: { color: colors.text.primary },
  labelDisabled: { color: colors.text.disabled },
  removeBtn: { marginLeft: 6, padding: 2 },
});
