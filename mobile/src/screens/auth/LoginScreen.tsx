import React, { useState } from "react";
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
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { GlassInput, GlassButton, GlassCard } from "@/design-system";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌍</Text>
            </View>
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
                <Pressable onPress={() => setShowPassword(!showPassword)}>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  decorCircle1: {
    position: "absolute",
    top: -100,
    right: -80,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: "rgba(255, 204, 0, 0.05)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -50,
    left: -60,
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: "rgba(255, 107, 43, 0.04)",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 204, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  logoEmoji: {
    fontSize: 36,
  },
  appName: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    color: colors.eu.star,
    letterSpacing: 1.5,
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
    fontSize: 18,
  },
});
