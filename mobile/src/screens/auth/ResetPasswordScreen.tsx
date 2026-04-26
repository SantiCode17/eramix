import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
import { authApi } from "@/api/authService";
import type { AuthStackParamList } from "@/types";
import { parseApiError, logError } from "@/utils/errorHandler";
import * as Haptics from "expo-haptics";

type Nav = StackNavigationProp<AuthStackParamList, "ResetPassword">;
type Route = RouteProp<AuthStackParamList, "ResetPassword">;

export default function ResetPasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();

  const [token, setToken] = useState(route.params?.token ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    if (!token.trim()) {
      setError("El token es obligatorio");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return false;
    }
    if (!newPassword) {
      setError("La contraseña es obligatoria");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return false;
    } else if (newPassword.length < 8) {
      setError("Mínimo 8 caracteres");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return false;
    }
    return true;
  };

  const handleReset = async () => {
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.resetPassword({ token: token.trim(), newPassword });
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const parsed = parseApiError(err, "Restablecer contraseña");
      logError(parsed);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

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
      <ScreenBackground>
        <View style={[st.container, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl }]}>
          <Animated.View entering={FadeIn.duration(400)} style={st.successContainer}>
            <View style={st.successCircleOuter}>
              <View style={st.successCircleInner}>
                <Ionicons name="checkmark" size={44} color="#000" />
              </View>
            </View>
            <Animated.Text entering={FadeInDown.delay(200)} style={st.successTitle}>
              ¡Contraseña actualizada!
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(300)} style={st.successSubtitle}>
              Ya puedes iniciar sesión con tu nueva contraseña.
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(400)} style={{ width: "100%", marginTop: spacing.md }}>
              <Pressable
                onPress={() => navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }))}
                style={({ pressed }) => [st.primaryBtn, pressed && { opacity: 0.85 }]}
              >
                <LinearGradient
                  colors={colors.gradient.accent}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={st.primaryBtnInner}
                >
                  <Text style={st.primaryBtnText}>Ir a iniciar sesión</Text>
                  <Ionicons name="arrow-forward" size={18} color="#000" />
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={[st.container, { flexGrow: 1, paddingTop: insets.top + spacing.md, paddingBottom: spacing.md }]} keyboardShouldPersistTaps="handled">
          
          {/* Back Button */}
          <Animated.View entering={FadeIn.duration(300)}>
            <Pressable onPress={() => navigation.goBack()} style={st.backBtn}>
              <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify().damping(14)} style={{ flex: 1, marginTop: spacing.xl }}>
            <View style={st.headerText}>
              <Text style={st.title}>Nueva contraseña</Text>
              <Text style={st.subtitle}>Introduce tu nueva contraseña segura.</Text>
            </View>

            {error && (
              <Animated.View entering={FadeInDown} style={st.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.status.error} />
                <Text style={st.errorText}>{error}</Text>
                <Pressable onPress={() => setError(null)}>
                  <Ionicons name="close" size={16} color={colors.status.error} />
                </Pressable>
              </Animated.View>
            )}

            <View style={st.form}>
              {!route.params?.token && (
                <DSInput
                  icon="key"
                  label="Token de recuperación"
                  value={token}
                  onChangeText={setToken}
                  placeholder="Introduce el código token"
                  autoCapitalize="none"
                />
              )}

              <DSInput
                icon="lock-closed"
                label="Nueva contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mínimo 8 caracteres"
                secureTextEntry={!showPassword}
                rightElement={
                  <Pressable onPress={() => setShowPassword((v) => !v)}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.text.tertiary} />
                  </Pressable>
                }
              />

              <DSInput
                icon="checkmark-circle"
                label="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite tu contraseña"
                secureTextEntry={!showPassword}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Animated.View entering={FadeInDown.delay(400)} style={{ paddingBottom: insets.bottom + spacing.lg }}>
        <Pressable
          onPress={handleReset}
          disabled={loading}
          style={({ pressed }) => [st.primaryBtn, pressed && { opacity: 0.85 }, { marginHorizontal: spacing.xl }]}
        >
          <LinearGradient
            colors={colors.gradient.accent}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={st.primaryBtnInner}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#000" />
                <Text style={st.primaryBtnText}>Guardar contraseña</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </ScreenBackground>
  );
}

// ── Custom Input Helper ────────────────────────────────────
function DSInput({
  icon, label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType, autoCapitalize, rightElement, containerStyle
}: any) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ marginBottom: spacing.md }, containerStyle]}>
      <Text style={st.label}>{label}</Text>
      <View style={[st.inputWrap, focused && st.inputFocused]}>
        <Ionicons name={icon as any} size={20} color={focused ? DS.primary : colors.text.tertiary} style={st.inputIcon} />
        <TextInput style={st.inputText} value={value} onChangeText={onChangeText}
          placeholder={placeholder} placeholderTextColor={colors.text.tertiary}
          secureTextEntry={secureTextEntry} keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? "sentences"}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        {rightElement}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────
const st = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.glass.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 32,
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: typography.families.body,
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.status.errorBg,
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.error + "40",
  },
  errorText: {
    color: colors.status.error,
    flex: 1,
    fontSize: 14,
    fontFamily: typography.families.body,
  },
  form: {
    marginTop: spacing.sm,
  },
  label: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  inputWrap: {
    height: 54,
    backgroundColor: colors.background.input,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: DS.primary,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 16,
    color: colors.text.primary,
  },
  primaryBtn: {
    borderRadius: radii.md,
    overflow: "hidden",
  },
  primaryBtnInner: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  primaryBtnText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 17,
    color: "#000",
    fontWeight: "600",
  },
  // Success states
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  successCircleOuter: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: DS.primary + "15", borderWidth: 2, borderColor: DS.primary + "40",
    alignItems: "center", justifyContent: "center", marginBottom: spacing.md,
  },
  successCircleInner: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: DS.primary,
    alignItems: "center", justifyContent: "center",
  },
  successTitle: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
