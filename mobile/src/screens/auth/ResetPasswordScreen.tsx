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
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { GlassInput, GlassButton, GlassCard } from "@/design-system";
import { colors, typography, spacing } from "@/design-system/tokens";
import { authApi } from "@/api/authService";
import type { AuthStackParamList } from "@/types";
import { parseApiError, logError } from "@/utils/errorHandler";

type Nav = StackNavigationProp<AuthStackParamList, "ResetPassword">;
type Route = RouteProp<AuthStackParamList, "ResetPassword">;

export default function ResetPasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();

  const [token, setToken] = useState(route.params?.token ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    let valid = true;
    const errors: Record<string, string> = {};

    if (!token.trim()) {
      errors.token = "El token es obligatorio";
      valid = false;
    }
    if (!newPassword) {
      errors.newPassword = "La contraseña es obligatoria";
      valid = false;
    } else if (newPassword.length < 8) {
      errors.newPassword = "Mínimo 8 caracteres";
      valid = false;
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
      valid = false;
    }

    setFieldErrors(errors);
    return valid;
  };

  const handleReset = async () => {
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.resetPassword({ token: token.trim(), newPassword });
      setSuccess(true);
    } catch (err) {
      const parsed = parseApiError(err, "Restablecer contraseña");
      logError(parsed);

      if (parsed.code === "NETWORK_ERROR") {
        setError("No se pudo conectar al servidor. Verifica tu conexión.");
      } else if (parsed.code === "TIMEOUT") {
        setError("El servidor tardó demasiado. Intenta de nuevo.");
      } else if (parsed.code === "UNAUTHORIZED") {
        setError("Token inválido o expirado. Solicita un nuevo enlace.");
      } else {
        setError(parsed.serverMessage || parsed.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.background.start, colors.background.end]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.title}>¡Contraseña actualizada!</Text>
          <Text style={styles.subtitle}>
            Ya puedes iniciar sesión con tu nueva contraseña.
          </Text>
          <GlassButton
            title="Ir a iniciar sesión"
            variant="primary"
            size="lg"
            onPress={() =>
              navigation.dispatch(
                CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }),
              )
            }
          />
        </View>
      </View>
    );
  }

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
          <Text style={styles.title}>Restablecer contraseña</Text>
          <Text style={styles.subtitle}>
            Introduce el token recibido y tu nueva contraseña.
          </Text>

          {error && (
            <GlassCard variant="elevated" style={styles.errorCard}>
              <Text style={styles.errorText}><Ionicons name="alert-circle-outline" size={14} color={colors.eu.orange} /> {error}</Text>
            </GlassCard>
          )}

          <View style={styles.form}>
            {!route.params?.token && (
              <GlassInput
                label="Token de recuperación"
                value={token}
                onChangeText={(t) => {
                  setToken(t);
                  if (fieldErrors.token) setFieldErrors((p) => ({ ...p, token: "" }));
                }}
                error={fieldErrors.token}
                autoCapitalize="none"
                autoCorrect={false}
              />
            )}

            <GlassInput
              label="Nueva contraseña"
              value={newPassword}
              onChangeText={(t) => {
                setNewPassword(t);
                if (fieldErrors.newPassword) setFieldErrors((p) => ({ ...p, newPassword: "" }));
              }}
              error={fieldErrors.newPassword}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              rightIcon={
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={{ padding: 4, minWidth: 36, minHeight: 36, alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.text.secondary} />
                  </Text>
                </Pressable>
              }
            />

            <GlassInput
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                if (fieldErrors.confirmPassword)
                  setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
              }}
              error={fieldErrors.confirmPassword}
              secureTextEntry={!showPassword}
            />

            <GlassButton
              title="Restablecer contraseña"
              variant="primary"
              size="lg"
              onPress={handleReset}
              loading={loading}
              disabled={loading}
            />
          </View>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>← Volver</Text>
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
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
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
  eyeIcon: {
    fontSize: 18,
  },
});
