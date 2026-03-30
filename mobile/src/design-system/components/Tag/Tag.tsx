import React from "react";
import { View, Text, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, radii, typography, spacing } from "../../tokens";

export interface TagProps {
  label: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Tag({
  label,
  color = colors.eu.deep,
  style,
}: TagProps): React.JSX.Element {
  return (
    <View style={[styles.tag, { backgroundColor: color }, style]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  label: {
    color: colors.text.primary,
    fontSize: typography.sizes.caption.fontSize,
    fontFamily: typography.families.bodyMedium,
    fontWeight: "500",
  },
});
