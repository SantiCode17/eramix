import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, spacing, opacity } from "../../tokens";

export interface DividerProps {
  style?: StyleProp<ViewStyle>;
}

export default function Divider({ style }: DividerProps): React.JSX.Element {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: `rgba(255, 255, 255, ${opacity.border.subtle})`,
    marginVertical: spacing.md,
  },
});
