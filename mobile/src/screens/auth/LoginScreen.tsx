/**
 * LoginScreen — European Glass DS
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
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
  layout,
} from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
import { useAuthStore } from "@/store/useAuthStore";
import { parseApiError, logError } from "@/utils/errorHandler";
import type { AuthStackParamList } from "@/types";

type Nav = StackNavigationProp<AuthStackParamList, "Login">;

export default function LoginScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 80 });
    logoOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const logoAnim = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage("Completa todos los campos para continuar.");
      return;
    }
    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const parsed = parseApiError(err, "Login");
      logError(parsed);
      switch (parsed.code) {
        case "UNAUTHORIZED":
          setErrorMessage("Email o contraseña incorrectos.");
          break;
        case "NETWORK_ERROR":
          setErrorMessage("Sin conexión. Verifica tu red.");
          break;
        case "TIMEOUT":
          setErrorMessage("El servidor tardó demasiado.");
          break;
        default:
          setErrorMessage("Algo salió mal. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ── Hero zone (40 %) ── */}
        <Animated.View style={[st.heroZone, logoAnim, { paddingTop: insets.top }]}>
          <View style={st.logoGlow} />
          <View style={st.logoCircle}>
            <Ionicons name="globe-outline" size={64} color={DS.primary} />
          </View>
          <Text style={st.appName}>EraMix</Text>
          <Text style={st.tagline}>Tu aventura Erasmus empieza aquí</Text>
        </Animated.View>

        {/* ── Form card (60 %) ── */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={st.cardZone}
        >
          <View style={st.card}>
            <Text style={st.formTitle}>Bienvenido de vuelta</Text>
            <Text style={st.formSub}>Inicia sesión en tu cuenta</Text>

            {/* error banner */}
            {errorMessage && (
              <Animated.View
                entering={FadeInDown.duration(300)}
                style={st.errorBanner}
              >
                <Ionicons
                  name="alert-circle"
                  size={18}
                  color={colors.status.error}
                />
                <Text style={st.errorText}>{errorMessage}</Text>
              </Animated.View>
            )}

            {/* email */}
            <View
              style={[st.inputWrap, emailFocused && st.inputFocused]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={emailFocused ? DS.primary : colors.text.tertiary}
                style={st.inputIcon}
              />
              <TextInput
                style={st.inputText}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* password */}
            <View
              style={[st.inputWrap, passwordFocused && st.inputFocused]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={passwordFocused ? DS.primary : colors.text.tertiary}
                style={st.inputIcon}
              />
              <TextInput
                style={st.inputText}
                value={password}
                onChangeText={setPassword}
                placeholder="Contraseña"
                placeholderTextColor={colors.text.tertiary}
                secureTextEntry={!showPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={12}
                style={st.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.text.tertiary}
                />
              </Pressable>
            </View>

            {/* forgot */}
            <Pressable
              onPress={() => navigation.navigate("ForgotPassword")}
              style={st.forgotLink}
            >
              <Text style={st.forgotText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            {/* login btn */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [
                st.loginBtn,
                pressed && { opacity: 0.85 },
                isLoading && { opacity: 0.7 },
              ]}
            >
              <LinearGradient
                colors={colors.gradient.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={st.loginBtnGrad}
              >
                {isLoading ? (
                  <ActivityIndicator color={DS.secondary} size="small" />
                ) : (
                  <Text style={st.loginBtnText}>Iniciar sesión</Text>
                )}
              </LinearGradient>
            </Pressable>

            {/* register */}
            <View style={st.registerRow}>
              <Text style={st.registerLabel}>¿No tienes cuenta? </Text>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <Text style={st.registerLink}>Regístrate</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

/* ─── styles ─────────────────────────── */
const st = StyleSheet.create({
  heroZone: {
    flex: 0.4,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: DS.primary + "15",
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: DS.primary + "40",
    ...shadows.glow,
  },
  appName: {
    fontFamily: typography.families.heading,
    ...typography.sizes.hero,
    color: DS.primary,
    letterSpacing: 3,
    marginTop: spacing.md,
  },
  tagline: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  cardZone: { flex: 0.6 },
  card: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    borderBottomWidth: 0,
  },
  formTitle: {
    fontFamily: typography.families.heading,
    ...typography.sizes.h3,
    color: colors.text.primary,
  },
  formSub: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },

  /* error */
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.status.errorBg,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.status.error + "40",
  },
  errorText: {
    flex: 1,
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.status.error,
    fontWeight: "500",
  },

  /* inputs */
  inputWrap: {
    height: sizes.inputHeight,
    backgroundColor: colors.background.input,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  inputFocused: { borderColor: DS.primary },
  inputIcon: { marginRight: spacing.sm },
  inputText: {
    flex: 1,
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  eyeBtn: { paddingLeft: spacing.sm },

  /* forgot */
  forgotLink: { alignSelf: "flex-end", marginBottom: spacing.md },
  forgotText: {
    fontFamily: typography.families.body,
    ...typography.sizes.bodySmall,
    color: DS.primary,
  },

  /* login btn */
  loginBtn: {
    borderRadius: radii.md,
    overflow: "hidden",
    ...shadows.glow,
  },
  loginBtnGrad: {
    height: sizes.buttonLg,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
  },
  loginBtnText: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.button,
    color: DS.secondary,
    fontWeight: "600",
  },

  /* register */
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  registerLabel: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.secondary,
  },
  registerLink: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.body,
    color: DS.primary,
    fontWeight: "600",
  },
});
