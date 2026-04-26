import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Defs, Rect, RadialGradient, Stop } from "react-native-svg";
import { colors, typography, spacing, DS } from "../../tokens";

export interface ScreenBackgroundProps {
  children: React.ReactNode;
  /** Optional extra gradient stops, defaults to enriched navy gradient */
  gradient?: readonly [string, string, ...string[]];
  /** Disable decorative overlays for performance */
  noEffects?: boolean;
}

/**
 * ScreenBackground — Enriched European Glass background
 *
 * Rich diagonal gradient: #001A5C → #0A1628 → #0A0A1E
 * Diffuse radial color spots (teal + gold) at 6-8% for visual depth
 * Offline banner with gold accent
 */
const ScreenBackground = ({
  children,
  gradient,
  noEffects,
}: ScreenBackgroundProps): React.JSX.Element => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        await fetch("https://clients3.google.com/generate_204", {
          method: "HEAD",
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (mounted) setIsOnline(true);
      } catch {
        if (mounted) setIsOnline(false);
      }
    };

    check();
    const interval = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* ── Rich diagonal gradient ── */}
      <LinearGradient
        colors={gradient ?? ["#001A5C", "#0A1628", "#0A0A1E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Diffuse color spots for depth (Revolut-style) ── */}
      {!noEffects && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="spotTeal" cx="20%" cy="30%" r="45%">
                <Stop offset="0%" stopColor="#4FD1C5" stopOpacity="0.07" />
                <Stop offset="100%" stopColor="#4FD1C5" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="spotGold" cx="80%" cy="70%" r="35%">
                <Stop offset="0%" stopColor="#FFD700" stopOpacity="0.05" />
                <Stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="spotBlue" cx="55%" cy="10%" r="30%">
                <Stop offset="0%" stopColor="#5B9BD5" stopOpacity="0.04" />
                <Stop offset="100%" stopColor="#5B9BD5" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#spotTeal)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#spotGold)" />
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#spotBlue)" />
          </Svg>
          {/* Subtle grain overlay via micro gradient lines */}
          <LinearGradient
            colors={["rgba(255,255,255,0.012)", "transparent", "rgba(255,255,255,0.008)", "transparent"]}
            locations={[0, 0.25, 0.5, 1]}
            style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
          />
        </View>
      )}

      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#06081A" />
          <Text style={styles.offlineText}>Sin conexión — modo offline</Text>
        </View>
      )}
      {children}
    </View>
  );
};

export default ScreenBackground;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A1E" },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.eu.star,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    ...Platform.select({
      ios: { zIndex: 999 },
      android: { elevation: 10 },
    }),
  },
  offlineText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: "#06081A",
    letterSpacing: 0.3,
  },
});
