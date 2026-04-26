/**
 * ForgotPasswordScreen — Diseño premium con estados animados
 */
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeIn,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  sizes,
  DS,
} from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
import { authApi } from "@/api/authService";
import type { AuthStackParamList } from "@/types";

const { width } = Dimensions.get("window");

type Nav = StackNavigationProp<AuthStackParamList, "ForgotPassword">;

export default function ForgotPasswordScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const shakeValue = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeValue.value }],
  }));

  const triggerShake = () => {
    shakeValue.value = withSpring(0, {}, () => {});
    shakeValue.value = 0;
    const times = [8, -8, 6, -6, 4, -4, 0];
    let delay = 0;
    times.forEach((v) => {
      setTimeout(() => { shakeValue.value = withTiming(v, { duration: 60 }); }, delay);
      delay += 65;
    });
  };

  const validate = (): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setErrorMessage("El email es obligatorio");
      triggerShake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return false;
    }
    if (!re.test(email)) {
      setErrorMessage("Introduce un email válido");
      triggerShake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setErrorMessage(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      const token = (res as any).resetToken || (res as any).token;
      if (token) setResetToken(token);
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Algo salió mal. Inténtalo de nuevo.";
      setErrorMessage(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  // ── Success view ─────────────────────────────────────────
  if (success) {
    return (
      <ScreenBackground>
        <View style={[st.container, { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl }]}>
          {/* Back */}
          <Pressable onPress={() => navigation.goBack()} style={st.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </Pressable>

          <Animated.View entering={FadeIn.duration(400)} style={st.successContainer}>
            {/* Círculo de éxito animado */}
            <View style={st.successCircleOuter}>
              <View style={st.successCircleInner}>
                <Ionicons name="mail-open" size={32} color="#000" />
              </View>
            </View>

            <Animated.Text entering={FadeInDown.delay(200)} style={st.successTitle}>
              ¡Correo enviado!
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(300)} style={st.successSubtitle}>
              Hemos enviado las instrucciones a{"\n"}
              <Text style={{ color: DS.primary, fontFamily: typography.families.bodyMedium }}>
                {email.toLowerCase()}
              </Text>
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(400)} style={st.successHint}>
              <Ionicons name="mail-unread-outline" size={16} color={colors.text.tertiary} />
              <Text style={st.successHintText}>
                Revisa tu bandeja de entrada y también spam
              </Text>
            </Animated.View>

            {/* Botón directo si hay token (dev mode) */}
            {resetToken ? (
              <Animated.View entering={FadeInDown.delay(500)} style={{ width: "100%" }}>
                <Pressable
                  onPress={() => navigation.navigate("ResetPassword", { token: resetToken })}
                  style={({ pressed }) => [st.primaryBtn, pressed && { opacity: 0.85 }]}
                >
                  <LinearGradient
                    colors={colors.gradient.accent}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={st.primaryBtnInner}
                  >
                    <Ionicons name="key-outline" size={18} color="#000" />
                    <Text style={st.primaryBtnText}>Restablecer contraseña</Text>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            ) : null}

            <Animated.View entering={FadeInDown.delay(600)} style={{ width: "100%", marginTop: spacing.sm }}>
              <Pressable
                onPress={() => { setSuccess(false); setEmail(""); setResetToken(null); }}
                style={st.secondaryBtn}
              >
                <Ionicons name="refresh-outline" size={16} color={DS.primary} />
                <Text style={st.secondaryBtnText}>Enviar de nuevo</Text>
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(700)}>
              <Pressable onPress={() => navigation.goBack()} style={st.backLink}>
                <Ionicons name="arrow-back" size={14} color={colors.text.tertiary} />
                <Text style={st.backLinkText}>Volver al inicio de sesión</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </View>
      </ScreenBackground>
    );
  }

  // ── Form view ─────────────────────────────────────────────
  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={[st.container, { flexGrow: 1, paddingTop: insets.top + spacing.md, paddingBottom: spacing.md }]} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <Animated.View entering={FadeIn.duration(300)}>
            <Pressable onPress={() => navigation.goBack()} style={st.backBtn}>
              <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
            </Pressable>
          </Animated.View>

          {/* Hero */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={st.hero}>
            <LinearGradient
              colors={[DS.primary + "30", DS.primary + "08"]}
              style={st.iconCircle}
            >
              <Ionicons name="lock-open-outline" size={36} color={DS.primary} />
            </LinearGradient>
            <Text style={st.title}>¿Olvidaste tu contraseña?</Text>
            <Text style={st.subtitle}>
              Sin problema. Introduce tu email y te enviaremos un enlace para recuperarla.
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ flex: 1 }}>
            {/* Input */}
            <Animated.View style={shakeStyle}>
              <Text style={st.label}>Tu email</Text>
              <Pressable onPress={() => inputRef.current?.focus()} style={[st.inputWrap, focused && st.inputFocused]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={focused ? DS.primary : colors.text.tertiary}
                  style={st.inputIcon}
                />
                <TextInput
                  ref={inputRef}
                  style={st.inputText}
                  value={email}
                  onChangeText={(t) => { setEmail(t); if (errorMessage) setErrorMessage(null); }}
                  placeholder="tu@email.com"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="send"
                />
                {email.length > 0 && (
                  <Pressable onPress={() => { setEmail(""); setErrorMessage(null); }}>
                    <Ionicons name="close-circle" size={18} color={colors.text.tertiary} />
                  </Pressable>
                )}
              </Pressable>

              {/* Error inline */}
              {errorMessage ? (
                <Animated.View entering={FadeInDown.duration(250)} style={st.errorRow}>
                  <Ionicons name="alert-circle" size={14} color={colors.status.error} />
                  <Text style={st.errorText}>{errorMessage}</Text>
                </Animated.View>
              ) : null}
            </Animated.View>

            {/* CTA */}
            <View style={{ marginTop: spacing.xl }}>
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={({ pressed }) => [st.primaryBtn, pressed && { opacity: 0.85 }, loading && { opacity: 0.7 }]}
              >
                <LinearGradient
                  colors={colors.gradient.accent}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={st.primaryBtnInner}
                >
                  {loading ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <>
                      <Ionicons name="send-outline" size={18} color="#000" />
                      <Text style={st.primaryBtnText}>Enviar enlace de recuperación</Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>
            </View>

            {/* Info card */}
            <Animated.View entering={FadeInDown.delay(300)} style={st.infoCard}>
              <Ionicons name="information-circle-outline" size={16} color={colors.text.tertiary} style={{ marginTop: 1 }} />
              <Text style={st.infoText}>
                Si existe una cuenta con ese email, recibirás las instrucciones en unos minutos.
              </Text>
            </Animated.View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer link */}
      <Animated.View entering={FadeInDown.delay(400)} style={{ paddingBottom: insets.bottom + spacing.lg }}>
        <Pressable onPress={() => navigation.goBack()} style={st.backLink}>
          <Ionicons name="arrow-back" size={14} color={colors.text.tertiary} />
          <Text style={st.backLinkText}>Volver al inicio de sesión</Text>
        </Pressable>
      </Animated.View>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.glass.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: DS.primary + "30",
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 26,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  inputWrap: {
    height: 56,
    backgroundColor: colors.background.input,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: DS.primary,
    borderWidth: 1.5,
  },
  inputIcon: { marginRight: 10 },
  inputText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 16,
    color: colors.text.primary,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  errorText: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.status.error,
    flex: 1,
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
    fontSize: 16,
    color: "#000",
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
  },
  infoText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.tertiary,
    lineHeight: 19,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: spacing.md,
  },
  backLinkText: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  // Success states
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  successCircleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.status.success + "20",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.status.success + "40",
    marginBottom: spacing.sm,
  },
  successCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.status.success,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    color: colors.text.primary,
    textAlign: "center",
  },
  successSubtitle: {
    fontFamily: typography.families.body,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
  },
  successHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    marginVertical: spacing.sm,
  },
  successHintText: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.tertiary,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: DS.primary,
    gap: 8,
  },
  secondaryBtnText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: DS.primary,
  },
});
