/**
 * ══════════════════════════════════════════════════════════════════════
 *  SplashScreen — Premium Animated Launch
 *
 *  • Anillo pulsante dorado
 *  • Logo centrado con icono + nombre
 *  • Partículas decorativas
 *  • Transición suave a Onboarding o Login
 * ══════════════════════════════════════════════════════════════════════
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, DS } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthStackParamList } from "@/types";

const { width, height } = Dimensions.get("window");
const ONBOARDING_KEY = "eramix_onboarding_complete";
type SplashNav = StackNavigationProp<AuthStackParamList, "Splash">;

export default function SplashScreen(): React.JSX.Element {
  const navigation = useNavigation<SplashNav>();
  const initialize = useAuthStore((s) => s.initialize);

  const [bgOpacity] = useState(() => new Animated.Value(0));
  const [logoScale] = useState(() => new Animated.Value(0.6));
  const [logoOpacity] = useState(() => new Animated.Value(0));
  const [textOpacity] = useState(() => new Animated.Value(0));
  const [textY] = useState(() => new Animated.Value(20));
  const [ringScale] = useState(() => new Animated.Value(0.8));
  const [ringOpacity] = useState(() => new Animated.Value(0));
  const [taglineOpacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // Ring pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, { toValue: 1.15, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 0.9, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Main sequence
    Animated.sequence([
      Animated.timing(bgOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(textY, { toValue: 0, friction: 10, tension: 40, useNativeDriver: true }),
      ]),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
    ]).start();

    // Navigate
    const checkSession = async () => {
      await initialize();
      await new Promise((r) => setTimeout(r, 2400));
      const { isAuthenticated: authed, forceOnboarding } = useAuthStore.getState();
      if (authed) return;
      // forceOnboarding flag is set when user explicitly logs out → always show onboarding
      if (forceOnboarding) {
        // Clear the flag so next cold launch goes to Login
        useAuthStore.setState({ forceOnboarding: false });
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: "Onboarding" }] })
        );
        return;
      }
      const done = await AsyncStorage.getItem(ONBOARDING_KEY);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: done ? "Login" : "Onboarding" }],
        })
      );
    };
    checkSession();
  }, []);

  return (
    <Animated.View style={[st.container, { opacity: bgOpacity }]}>
      <LinearGradient
        colors={["#0A1628", "#0E1A35", "#0A1628"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circles */}
      <View style={st.deco1} />
      <View style={st.deco2} />
      <View style={st.deco3} />

      {/* Centered block */}
      <View style={st.centerBlock}>
        {/* Pulsing ring */}
        <Animated.View
          style={[
            st.pulseRing,
            { opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
        />

        {/* Logo circle */}
        <Animated.View
          style={[
            st.logoCircle,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <LinearGradient
            colors={["rgba(255,215,0,0.12)", "rgba(255,107,43,0.08)"]}
            style={st.logoGrad}
          >
            <Ionicons name="globe-outline" size={52} color={DS.primary} />
          </LinearGradient>
        </Animated.View>

        {/* App Name */}
        <Animated.View
          style={{ opacity: textOpacity, transform: [{ translateY: textY }] }}
        >
          <Text style={st.appName}>EraMix</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={{ opacity: taglineOpacity }}>
          <Text style={st.tagline}>Tu aventura Erasmus empieza aquí</Text>
        </Animated.View>
      </View>

      {/* Bottom stars */}
      <Animated.View style={[st.bottomStars, { opacity: taglineOpacity }]}>
        <Text style={st.starsText}>✦ ✦ ✦</Text>
      </Animated.View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Deco */
  deco1: {
    position: "absolute",
    top: -height * 0.12,
    right: -width * 0.15,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: "rgba(255,215,0,0.04)",
  },
  deco2: {
    position: "absolute",
    bottom: -height * 0.08,
    left: -width * 0.12,
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: width * 0.225,
    backgroundColor: "rgba(255,107,43,0.03)",
  },
  deco3: {
    position: "absolute",
    top: height * 0.3,
    left: -width * 0.08,
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: width * 0.125,
    backgroundColor: "rgba(108,92,231,0.03)",
  },

  /* Center */
  centerBlock: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: "rgba(255,215,0,0.18)",
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
    overflow: "hidden",
  },
  logoGrad: {
    flex: 1,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: "rgba(255,215,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontFamily: typography.families.heading,
    fontSize: 44,
    color: DS.primary,
    letterSpacing: 3,
    textAlign: "center",
    marginBottom: 8,
  },
  tagline: {
    fontFamily: typography.families.body,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },

  /* Bottom */
  bottomStars: {
    position: "absolute",
    bottom: 60,
  },
  starsText: {
    fontSize: 14,
    color: "rgba(255,215,0,0.25)",
    letterSpacing: 8,
  },
});
