import React, { useState } from "react";
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
import { authApi } from "@/api/authService";
import type { AuthStackParamList } from "@/types";
import { AxiosError } from "axios";

type Nav = StackNavigationProp<AuthStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // DEV: capture the token returned by the backend for direct navigation
  const [resetToken, setResetToken] = useState<string | null>(null);

  const validate = (): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("El email es obligatorio");
      return false;
    }
    if (!re.test(email)) {
      setEmailError("Formato de email inválido");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      // In DEV mode, the backend returns the reset token directly
      const token = (res as any).resetToken || (res as any).token;
      if (token) {
        setResetToken(token);
      }
      setSuccess("Si el email existe, recibirás un enlace para restablecer tu contraseña.");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Error al enviar el enlace");
      } else {
        setError("Error de conexión");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Recuperar contraseña</Text>
          <Text style={styles.subtitle}>
            Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
          </Text>

          {error && (
            <GlassCard variant="elevated" style={styles.errorCard}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </GlassCard>
          )}

          {success && (
            <GlassCard variant="elevated" style={styles.successCard}>
              <Text style={styles.successText}>✅ {success}</Text>
            </GlassCard>
          )}

          <View style={styles.form}>
            <GlassInput
              label="Email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError(null);
              }}
              error={emailError ?? undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <GlassButton
              title="Enviar enlace"
              variant="primary"
              size="lg"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
            />

            {resetToken && (
              <GlassButton
                title="Ir a restablecer contraseña →"
                variant="secondary"
                size="md"
                onPress={() => navigation.navigate("ResetPassword", { token: resetToken })}
              />
            )}
          </View>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>← Volver al inicio de sesión</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    color: colors.eu.star,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  errorCard: {
    marginBottom: spacing.md,
    backgroundColor: "rgba(244, 67, 54, 0.15)",
  },
  errorText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.status.error,
    textAlign: "center",
  },
  successCard: {
    marginBottom: spacing.md,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  successText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.status.success,
    textAlign: "center",
  },
  form: {
    gap: spacing.md,
  },
  linkContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  linkText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
  },
});
