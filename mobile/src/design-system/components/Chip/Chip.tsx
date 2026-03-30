import React from "react";
import { Pressable, Text, View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, radii, typography, spacing, opacity } from "../../tokens";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  disabled = false,
  style,
}: ChipProps): React.JSX.Element {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          selected && styles.labelSelected,
          disabled && styles.labelDisabled,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {onRemove && !disabled && (
        <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
          <Text style={styles.removeIcon}>✕</Text>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: `rgba(255, 255, 255, ${opacity.border.mid})`,
    backgroundColor: `rgba(255, 255, 255, ${opacity.glass.surface})`,
  },
  chipSelected: {
    backgroundColor: colors.eu.deep,
    borderColor: colors.eu.star,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  label: {
    color: colors.text.secondary,
    fontSize: typography.sizes.caption.fontSize,
    fontFamily: typography.families.bodyMedium,
    fontWeight: "500",
  },
  labelSelected: {
    color: colors.text.primary,
  },
  labelDisabled: {
    color: colors.text.disabled,
  },
  removeBtn: {
    marginLeft: spacing.xs,
  },
  removeIcon: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: "700",
  },
});
