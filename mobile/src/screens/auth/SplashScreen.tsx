import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { colors, typography, spacing } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthStackParamList } from "@/types";

const { width, height } = Dimensions.get("window");
const ONBOARDING_KEY = "eramix_onboarding_complete";

type SplashNav = StackNavigationProp<AuthStackParamList, "Splash">;

export default function SplashScreen(): React.JSX.Element {
  const navigation = useNavigation<SplashNav>();
  const initialize = useAuthStore((s) => s.initialize);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Animations
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Run choreographed animation
    Animated.sequence([
      // Background fade in
      Animated.timing(bgOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Logo scale + fade
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          damping: 15,
          stiffness: 150,
          mass: 1,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Text slide up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 2. Initialize session in parallel
    const checkSession = async () => {
      await initialize();
      // Give animation time to complete (~2s total)
      await new Promise((r) => setTimeout(r, 2200));

      const { isAuthenticated: authed } = useAuthStore.getState();

      if (authed) {
        // Go to main — RootNavigator will handle via auth state
        return;
      }

      // Check onboarding
      const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!onboardingDone) {
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: "Onboarding" }] }),
        );
      } else {
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }),
        );
      }
    };

    checkSession();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacity }]}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🌍</Text>
        </View>
      </Animated.View>

      {/* App name + tagline */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.appName}>EraMix</Text>
        <Text style={styles.tagline}>Tu comunidad Erasmus</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  decorCircle1: {
    position: "absolute",
    top: -height * 0.15,
    right: -width * 0.2,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: "rgba(255, 204, 0, 0.06)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -height * 0.1,
    left: -width * 0.15,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "rgba(255, 107, 43, 0.05)",
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 2,
    borderColor: "rgba(255, 204, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: {
    fontSize: 56,
  },
  textContainer: {
    alignItems: "center",
  },
  appName: {
    fontFamily: typography.families.heading,
    fontSize: 42,
    color: colors.eu.star,
    letterSpacing: 2,
  },
  tagline: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
});
