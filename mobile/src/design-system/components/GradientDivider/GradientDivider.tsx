/**
 * ════════════════════════════════════════════════════
 *  GradientDivider — Gold → transparent fade line
 *  Used between sections for European Glass visual rhythm
 * ════════════════════════════════════════════════════
 */
import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { spacing } from "../../tokens";

export interface GradientDividerProps {
  /** Vertical margin around the divider */
  marginVertical?: number;
  /** Optional custom style */
  style?: StyleProp<ViewStyle>;
  /** Gold color — default rgba(255,215,0,0.3) */
  color?: string;
}

export default function GradientDivider({
  marginVertical = spacing.sm,
  style,
  color = "rgba(255,215,0,0.3)",
}: GradientDividerProps): React.JSX.Element {
  return (
    <View style={[{ marginVertical }, style]}>
      <LinearGradient
        colors={[
          "transparent",
          color,
          color,
          "transparent",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.line}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    width: "100%",
  },
});
