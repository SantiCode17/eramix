import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { GlassInput, GlassButton, GlassCard } from "@/design-system";
import { colors, typography, spacing } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
import Globe3D from "@/components/Globe3D";
import type { AuthStackParamList } from "@/types";
import { parseApiError, logError } from "@/utils/errorHandler";

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

  // Day/night background state  (0 = day, 1 = night)
  const [nightAmount, setNightAmount] = useState(0);

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
      const parsed = parseApiError(err, "Login");
      logError(parsed);

      switch (parsed.code) {
        case "UNAUTHORIZED":
          setError("Email o contraseña incorrectos. Verifica tus credenciales.");
          break;
        case "NOT_FOUND":
          setError("No existe una cuenta con ese email. ¿Quieres registrarte?");
          break;
        case "NETWORK_ERROR":
          setError(
            "No se pudo conectar al servidor.\n\n" +
            "• Verifica tu conexión a Internet\n" +
            "• Asegúrate de que el backend está ejecutándose"
          );
          break;
        case "TIMEOUT":
          setError("El servidor tardó demasiado en responder. Intenta de nuevo.");
          break;
        case "SERVER_ERROR":
          setError(`Error interno del servidor (${parsed.status}). Intenta más tarde.`);
          break;
        default:
          setError(parsed.serverMessage || parsed.message);
      }
    }
  };

  const handleDayNight = useCallback((n: number) => {
    setNightAmount(n);
  }, []);

  // Dynamic gradient: day = blue sky, night = dark navy
  const bgStart = lerpColor("#1a6dd4", "#0a0e1a", nightAmount);
  const bgEnd = lerpColor("#003399", "#070b15", nightAmount);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[bgStart, bgEnd]}
        style={StyleSheet.absoluteFill}
      />

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
            <Globe3D size={200} onDayNightChange={handleDayNight} />
            <Text style={styles.appName}>EraMix</Text>
            <Text style={styles.tagline}>Tu aventura Erasmus empieza aquí</Text>
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

/* ─── Helpers ─── */

/** Linearly interpolate between two hex colors. t ∈ [0, 1] */
function lerpColor(a: string, b: string, t: number): string {
  const clamp = Math.max(0, Math.min(1, t));
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const r = Math.round(r1 + (r2 - r1) * clamp);
  const g = Math.round(g1 + (g2 - g1) * clamp);
  const bl = Math.round(b1 + (b2 - b1) * clamp);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
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
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  appName: {
    fontFamily: typography.families.heading,
    fontSize: 36,
    color: colors.eu.star,
    letterSpacing: 3,
    marginTop: spacing.md,
  },
  tagline: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xs,
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
    gap: spacing.xs,
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
  },
  eyeButton: {
    padding: spacing.xs,
    minWidth: 36,
    minHeight: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
});
