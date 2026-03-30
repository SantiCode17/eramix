import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { colors, spacing } from "../../tokens";

export interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function LoadingSpinner({
  size = 32,
  color = colors.eu.star,
  style,
}: LoadingSpinnerProps): React.JSX.Element {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 3,
            borderColor: `rgba(255, 255, 255, 0.15)`,
            borderTopColor: color,
            transform: [{ rotate: spin }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
});
