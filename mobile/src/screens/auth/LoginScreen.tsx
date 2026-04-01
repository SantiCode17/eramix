import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Dimensions,
  Animated as RNAnimated,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInUp,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { GlassInput, GlassButton, GlassCard } from "@/design-system";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
import Globe3D from "@/components/Globe3D";
import type { AuthStackParamList } from "@/types";
import { parseApiError, logError } from "@/utils/errorHandler";

const { width, height } = Dimensions.get("window");
type Nav = StackNavigationProp<AuthStackParamList, "Login">;

// ── Floating particle component ─────────────────────
function FloatingParticle({ delay, size, x, duration }: {
  delay: number; size: number; x: number; duration: number;
}) {
  const translateY = useSharedValue(height + 50);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(height + 50, { duration: 0 }),
          withTiming(-50, { duration, easing: Easing.linear }),
        ),
        -1,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(0.6, { duration: duration * 0.2 }),
          withTiming(0.6, { duration: duration * 0.6 }),
          withTiming(0, { duration: duration * 0.2 }),
        ),
        -1,
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.eu.star,
        },
        animStyle,
      ]}
    />
  );
}

// ── Orbiting ring ───────────────────────────────────
function OrbitRing({ size, duration, color, borderWidth: bw }: {
  size: number; duration: number; color: string; borderWidth: number;
}) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration, easing: Easing.linear }),
      -1,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateX: "65deg" },
      { rotateZ: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: bw,
          borderColor: color,
          borderStyle: "dashed",
        },
        animStyle,
      ]}
    />
  );
}

export default function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [nightAmount, setNightAmount] = useState(0);

  // Animated entry
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 80 });
    logoOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const logoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const validateEmail = (value: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) { setEmailError("El email es obligatorio"); return false; }
    if (!re.test(value)) { setEmailError("Formato de email inválido"); return false; }
    setEmailError(null);
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) { setPasswordError("La contraseña es obligatoria"); return false; }
    if (value.length < 8) { setPasswordError("Mínimo 8 caracteres"); return false; }
    setPasswordError(null);
    return true;
  };

  const handleLogin = async () => {
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);
    if (!emailValid || !passwordValid) return;

    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const parsed = parseApiError(err, "Login");
      logError(parsed);
      switch (parsed.code) {
        case "UNAUTHORIZED":
          setError("Email o contraseña incorrectos.");
          break;
        case "NOT_FOUND":
          setError("No existe una cuenta con ese email.");
          break;
        case "NETWORK_ERROR":
          setError("No se pudo conectar al servidor. Verifica tu conexión.");
          break;
        case "TIMEOUT":
          setError("El servidor tardó demasiado. Intenta de nuevo.");
          break;
        case "SERVER_ERROR":
          setError(`Error del servidor (${parsed.status}).`);
          break;
        default:
          setError(parsed.serverMessage || parsed.message);
      }
    }
  };

  const handleDayNight = useCallback((n: number) => setNightAmount(n), []);

  const bgStart = lerpColor("#0B0E2A", "#06081A", nightAmount);
  const bgEnd = lerpColor("#141C44", "#0B0E2A", nightAmount);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[bgStart, bgEnd]} style={StyleSheet.absoluteFill} />

      {/* Floating particles */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {[...Array(8)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 1200}
            size={2 + Math.random() * 3}
            x={Math.random() * width}
            duration={8000 + Math.random() * 6000}
          />
        ))}
      </View>

      {/* Ambient glow */}
      <View style={styles.ambientGlow} pointerEvents="none">
        <LinearGradient
          colors={["rgba(26, 61, 232, 0.12)", "transparent"]}
          style={styles.glowCircle}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero section with globe */}
          <Animated.View style={[styles.heroSection, logoAnimStyle]}>
            <View style={styles.globeWrapper}>
              <OrbitRing size={240} duration={20000} color="rgba(59, 107, 255, 0.15)" borderWidth={1} />
              <OrbitRing size={280} duration={30000} color="rgba(255, 215, 0, 0.08)" borderWidth={0.5} />
              <Globe3D size={180} onDayNightChange={handleDayNight} />
            </View>

            <Animated.Text entering={FadeInDown.delay(400).springify()} style={styles.appName}>
              EraMix
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(600).springify()} style={styles.tagline}>
              Tu aventura Erasmus empieza aquí
            </Animated.Text>

            {/* EU Stars decoration */}
            <Animated.View entering={FadeIn.delay(800)} style={styles.starsRow}>
              {[...Array(5)].map((_, i) => (
                <View key={i} style={styles.euStar} />
              ))}
            </Animated.View>
          </Animated.View>

          {/* Error toast */}
          {error && (
            <Animated.View entering={FadeInDown.springify()}>
              <GlassCard variant="elevated" style={styles.errorCard}>
                <View style={styles.errorRow}>
                  <View style={styles.errorIconWrap}>
                    <Ionicons name="alert-circle" size={20} color={colors.status.error} />
                  </View>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
                <Pressable onPress={() => setError(null)} hitSlop={12}>
                  <Ionicons name="close" size={16} color={colors.text.secondary} />
                </Pressable>
              </GlassCard>
            </Animated.View>
          )}

          {/* Form card */}
          <Animated.View entering={FadeInUp.delay(300).springify()}>
            <View style={styles.formCard}>
              <LinearGradient
                colors={["rgba(15, 21, 53, 0.65)", "rgba(11, 14, 42, 0.80)"]}
                style={styles.formGradient}
              >
                <Text style={styles.formTitle}>Iniciar sesión</Text>
                <Text style={styles.formSubtitle}>Bienvenido de vuelta, explorador</Text>

                <View style={styles.inputsContainer}>
                  <GlassInput
                    label="Email"
                    value={email}
                    onChangeText={(t) => { setEmail(t); if (emailError) validateEmail(t); }}
                    error={emailError ?? undefined}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    leftIcon={<Ionicons name="mail-outline" size={18} color={colors.text.tertiary} />}
                  />

                  <GlassInput
                    label="Contraseña"
                    value={password}
                    onChangeText={(t) => { setPassword(t); if (passwordError) validatePassword(t); }}
                    error={passwordError ?? undefined}
                    secureTextEntry={!showPassword}
                    textContentType="password"
                    leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.text.tertiary} />}
                    rightIcon={
                      <Pressable
                        onPress={() => { setShowPassword(!showPassword); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                        hitSlop={12}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={18}
                          color={colors.text.secondary}
                        />
                      </Pressable>
                    }
                  />
                </View>

                <Pressable
                  onPress={() => navigation.navigate("ForgotPassword")}
                  style={styles.forgotLink}
                >
                  <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                </Pressable>

                <GlassButton
                  title="Iniciar sesión"
                  variant="primary"
                  size="lg"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.loginButton}
                />
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Divider */}
          <Animated.View entering={FadeIn.delay(500)} style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Register CTA */}
          <Animated.View entering={FadeInUp.delay(600).springify()}>
            <Pressable
              onPress={() => navigation.navigate("Register")}
              style={({ pressed }) => [styles.registerCTA, pressed && { opacity: 0.8 }]}
            >
              <LinearGradient
                colors={["rgba(15, 21, 53, 0.45)", "rgba(11, 14, 42, 0.60)"]}
                style={styles.registerGradient}
              >
                <View style={styles.registerContent}>
                  <View style={styles.registerIconCircle}>
                    <Ionicons name="rocket-outline" size={20} color={colors.eu.star} />
                  </View>
                  <View style={styles.registerTextWrap}>
                    <Text style={styles.registerQuestion}>¿No tienes cuenta?</Text>
                    <Text style={styles.registerAction}>Comienza tu aventura</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(800)} style={styles.footer}>
            <View style={styles.footerStars}>
              {[...Array(12)].map((_, i) => (
                <View key={i} style={styles.footerStar} />
              ))}
            </View>
            <Text style={styles.footerText}>Erasmus Student Network</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ─ Color lerp helper ─ */
function lerpColor(a: string, b: string, t: number): string {
  const c = Math.max(0, Math.min(1, t));
  const p = (hex: string) => {
    const h = hex.replace("#", "");
    return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
  };
  const [r1, g1, b1] = p(a);
  const [r2, g2, b2] = p(b);
  const r = Math.round(r1 + (r2 - r1) * c);
  const g = Math.round(g1 + (g2 - g1) * c);
  const bl = Math.round(b1 + (b2 - b1) * c);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 20,
    paddingTop: spacing.md,
  },
  ambientGlow: {
    position: "absolute",
    top: -100,
    left: -100,
    right: -100,
    height: 400,
    alignItems: "center",
    justifyContent: "center",
  },
  glowCircle: {
    width: 400,
    height: 400,
    borderRadius: 200,
  },

  // Hero
  heroSection: {
    alignItems: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  globeWrapper: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontFamily: typography.families.heading,
    fontSize: 44,
    color: colors.eu.star,
    letterSpacing: 4,
    marginTop: spacing.sm,
    textShadowColor: "rgba(255, 215, 0, 0.3)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },
  starsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: spacing.md,
  },
  euStar: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.eu.star,
    opacity: 0.5,
  },

  // Error
  errorCard: {
    marginBottom: spacing.md,
    backgroundColor: "rgba(244, 67, 54, 0.12)",
    borderColor: "rgba(244, 67, 54, 0.25)",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
  },
  errorIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(244, 67, 54, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.status.error,
    flex: 1,
    lineHeight: 18,
  },

  // Form card
  formCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    ...shadows.card,
  },
  formGradient: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  formTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  formSubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    marginTop: spacing.xxs,
    marginBottom: spacing.lg,
  },
  inputsContainer: {
    gap: spacing.sm,
  },
  forgotLink: {
    alignSelf: "flex-end",
    paddingVertical: spacing.sm,
  },
  forgotText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.light,
    letterSpacing: 0.2,
  },
  loginButton: {
    marginTop: spacing.xs,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    marginHorizontal: spacing.md,
  },

  // Register CTA
  registerCTA: {
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  registerGradient: {
    padding: spacing.lg,
  },
  registerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  registerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  registerTextWrap: {
    flex: 1,
  },
  registerQuestion: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
  },
  registerAction: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.eu.star,
    marginTop: 2,
  },

  // Footer
  footer: {
    alignItems: "center",
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  footerStars: {
    flexDirection: "row",
    gap: 4,
  },
  footerStar: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.eu.star,
    opacity: 0.25,
  },
  footerText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.disabled,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
