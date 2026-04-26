/**
 * ════════════════════════════════════════════════════
 *  NetworkStatusBanner — Banner global de modo offline
 *  Se muestra cuando el backend no está disponible.
 * ════════════════════════════════════════════════════
 */

import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, typography, spacing, radii, DS } from "../tokens";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export default function NetworkStatusBanner(): React.JSX.Element | null {
  const isOnline = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!isOnline) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(-80, { duration: 300 });
      opacity.value = withTiming(0, { duration: 250 });
    }
  }, [isOnline]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top + 4 },
        animatedStyle,
      ]}
      pointerEvents={isOnline ? "none" : "auto"}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline-outline" size={18} color={DS.textPrimary} />
        <Text style={styles.text}>Modo sin conexión — Mostrando datos de ejemplo</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: "rgba(229, 162, 35, 0.92)",
    paddingBottom: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: DS.background,
    letterSpacing: 0.2,
  },
});
