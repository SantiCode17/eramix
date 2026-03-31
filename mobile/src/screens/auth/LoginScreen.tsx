import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { GlassInput, GlassButton, GlassCard } from "@/design-system";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
import Globe3D from "@/components/Globe3D";
import type { AuthStackParamList } from "@/types";
import { AxiosError } from "axios";

const { width } = Dimensions.get("window");

type Nav = StackNavigationProp<AuthStackParamList, "Login">;

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

  const validateEmail = (value: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailError("El email es obligatorio");
      return false;
    }
    if (!re.test(value)) {
      setEmailError("Formato de email inválido");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setPasswordError("La contraseña es obligatoria");
      return false;
    }
    if (value.length < 8) {
      setPasswordError("Mínimo 8 caracteres");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleLogin = async () => {
    setError(null);
    const emailValid = validateEmail(email);
    const passwordValid = validatePassword(password);
    if (!emailValid || !passwordValid) return;

    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err) {
      if (err instanceof AxiosError) {
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.response?.data?.error;
        if (status === 401) {
          setError("Email o contraseña incorrectos");
        } else if (status === 404) {
          setError("No existe una cuenta con ese email");
        } else {
          setError(msg || "Error al iniciar sesión. Intenta de nuevo.");
        }
      } else {
        setError("Error de conexión. Comprueba tu red.");
      }
    }
  };

  // Globe rotation drives background warmth
  const bgWarmth = useSharedValue(0.3);

  const handleRotationChange = useCallback(
    (normalizedX: number) => {
      bgWarmth.value = normalizedX;
    },
    [bgWarmth],
  );

  // Animated background that shifts warm/cool based on globe rotation
  const warmOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      bgWarmth.value,
      [0, 0.5, 1],
      [0.1, 0.3, 0.1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      {/* Warm overlay that shifts with globe */}
      <Animated.View style={[styles.warmOverlay, warmOverlayStyle]}>
        <LinearGradient
          colors={["rgba(255, 150, 50, 0.3)", "transparent"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.6 }}
        />
      </Animated.View>

      {/* Decorative arc behind globe */}
      <View style={styles.arcContainer}>
        <View style={styles.arc} />
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
          {/* 3D Globe */}
          <View style={styles.globeContainer}>
            <Globe3D
              size={180}
              onRotationChange={handleRotationChange}
            />
            <Text style={styles.appName}>EraMix</Text>
          </View>

          {/* Error card */}
          {error && (
            <GlassCard variant="elevated" style={styles.errorCard}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </GlassCard>
          )}

          {/* Form */}
          <View style={styles.form}>
            <GlassInput
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              error={emailError ?? undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
            />

            <GlassInput
              label="Contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) validatePassword(text);
              }}
              error={passwordError ?? undefined}
              secureTextEntry={!showPassword}
              textContentType="password"
              rightIcon={
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={styles.eyeButton}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </Pressable>
              }
            />

            <GlassButton
              title="Iniciar sesión"
              variant="primary"
              size="lg"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
            />

            <Pressable
              onPress={() => navigation.navigate("ForgotPassword")}
              style={styles.linkContainer}
            >
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              onPress={() => navigation.navigate("Register")}
              style={styles.linkContainer}
            >
              <Text style={styles.secondaryText}>
                ¿No tienes cuenta?{" "}
                <Text style={styles.linkTextBold}>Regístrate</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  warmOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  arcContainer: {
    position: "absolute",
    top: -width * 0.35,
    left: -width * 0.15,
    right: -width * 0.15,
    alignItems: "center",
  },
  arc: {
    width: width * 1.3,
    height: width * 1.3,
    borderRadius: width * 0.65,
    borderWidth: 2.5,
    borderColor: "rgba(76, 175, 80, 0.35)",
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.lg,
  },
  globeContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  appName: {
    fontFamily: typography.families.heading,
    fontSize: 32,
    color: colors.eu.star,
    letterSpacing: 2,
    marginTop: spacing.sm,
  },
  errorCard: {
    marginBottom: spacing.md,
    backgroundColor: "rgba(244, 67, 54, 0.15)",
    borderColor: "rgba(244, 67, 54, 0.3)",
  },
  errorText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.status.error,
    textAlign: "center",
  },
  form: {
    gap: spacing.md,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  linkContainer: {
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  linkText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
  },
  linkTextBold: {
    fontFamily: typography.families.subheading,
    color: colors.eu.star,
  },
  secondaryText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dividerText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.disabled,
    paddingHorizontal: spacing.md,
  },
  eyeIcon: {
    fontSize: 20,
    padding: spacing.xs,
  },
  eyeButton: {
    padding: spacing.xs,
    minWidth: 36,
    minHeight: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
});
