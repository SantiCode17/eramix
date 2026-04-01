import React, { useState, useEffect } from "react";
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideOutLeft,
  Layout,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { GlassInput, GlassButton, GlassCard } from "@/design-system";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthStackParamList, RegisterRequest } from "@/types";
import { parseApiError, logError } from "@/utils/errorHandler";

const { width } = Dimensions.get("window");
type Nav = StackNavigationProp<AuthStackParamList, "Register">;

// ── Step indicator component ──────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={stepStyles.container}>
      {Array.from({ length: total }, (_, i) => {
        const isActive = i + 1 === current;
        const isDone = i + 1 < current;
        return (
          <View key={i} style={stepStyles.stepRow}>
            <View style={[
              stepStyles.dot,
              isActive && stepStyles.dotActive,
              isDone && stepStyles.dotDone,
            ]}>
              {isDone ? (
                <Ionicons name="checkmark" size={10} color="#FFF" />
              ) : (
                <Text style={[stepStyles.dotText, isActive && stepStyles.dotTextActive]}>
                  {i + 1}
                </Text>
              )}
            </View>
            {i < total - 1 && (
              <View style={[stepStyles.line, isDone && stepStyles.lineDone]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: spacing.lg },
  stepRow: { flexDirection: "row", alignItems: "center" },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  dotActive: {
    backgroundColor: "rgba(26, 61, 232, 0.25)",
    borderColor: colors.eu.light,
  },
  dotDone: {
    backgroundColor: colors.status.success,
    borderColor: colors.status.success,
  },
  dotText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11, color: colors.text.disabled,
  },
  dotTextActive: { color: colors.eu.light },
  line: {
    width: 40, height: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: spacing.xs,
  },
  lineDone: { backgroundColor: colors.status.success },
});

export default function RegisterScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldError = (field: string, msg: string | null) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  // Password strength
  const passwordStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Débil", "Regular", "Buena", "Fuerte"][passwordStrength];
  const strengthColor = ["transparent", colors.status.error, colors.eu.orange, colors.eu.star, colors.status.success][passwordStrength];

  const validateStep1 = (): boolean => {
    let valid = true;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) { setFieldError("email", "El email es obligatorio"); valid = false; }
    else if (!emailRe.test(email)) { setFieldError("email", "Formato de email inválido"); valid = false; }
    else setFieldError("email", null);
    if (!password) { setFieldError("password", "La contraseña es obligatoria"); valid = false; }
    else if (password.length < 8) { setFieldError("password", "Mínimo 8 caracteres"); valid = false; }
    else setFieldError("password", null);
    if (password !== confirmPassword) { setFieldError("confirmPassword", "Las contraseñas no coinciden"); valid = false; }
    else setFieldError("confirmPassword", null);
    return valid;
  };

  const validateStep2 = (): boolean => {
    let valid = true;
    if (!firstName.trim()) { setFieldError("firstName", "El nombre es obligatorio"); valid = false; }
    else setFieldError("firstName", null);
    if (!lastName.trim()) { setFieldError("lastName", "El apellido es obligatorio"); valid = false; }
    else setFieldError("lastName", null);
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateOfBirth.trim()) { setFieldError("dateOfBirth", "La fecha es obligatoria"); valid = false; }
    else if (!dateRe.test(dateOfBirth)) { setFieldError("dateOfBirth", "Formato: AAAA-MM-DD"); valid = false; }
    else {
      const d = new Date(dateOfBirth);
      if (isNaN(d.getTime()) || d >= new Date()) { setFieldError("dateOfBirth", "Fecha no válida"); valid = false; }
      else setFieldError("dateOfBirth", null);
    }
    return valid;
  };

  const handleNext = () => {
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (validateStep1()) setStep(2);
  };

  const handleRegister = async () => {
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!validateStep2()) return;
    const data: RegisterRequest = {
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      destinationCity: destinationCity.trim() || undefined,
      destinationCountry: destinationCountry.trim() || undefined,
    };
    try {
      await register(data);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const parsed = parseApiError(err, "Registro");
      logError(parsed);
      switch (parsed.code) {
        case "CONFLICT":
          setError("Ya existe una cuenta con ese email."); setStep(1); break;
        case "VALIDATION_ERROR": case "BAD_REQUEST":
          setError(parsed.serverMessage || "Datos inválidos. Revisa los campos."); break;
        case "NETWORK_ERROR":
          setError("No se pudo conectar al servidor."); break;
        case "TIMEOUT":
          setError("El servidor tardó demasiado."); break;
        default:
          setError(parsed.serverMessage || parsed.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[...colors.gradient.dark]}
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
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
            <Pressable
              onPress={() => step === 2 ? setStep(1) : navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Crear cuenta</Text>
              <Text style={styles.headerSubtitle}>
                {step === 1 ? "Credenciales de acceso" : "Información personal"}
              </Text>
            </View>
            <View style={{ width: 40 }} />
          </Animated.View>

          <StepIndicator current={step} total={2} />

          {/* Error */}
          {error && (
            <Animated.View entering={FadeInDown.springify()}>
              <GlassCard variant="elevated" style={styles.errorCard}>
                <View style={styles.errorRow}>
                  <Ionicons name="alert-circle" size={18} color={colors.status.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <Animated.View entering={SlideInRight.springify()} style={styles.formCard}>
              <LinearGradient
                colors={["rgba(15, 21, 53, 0.65)", "rgba(11, 14, 42, 0.80)"]}
                style={styles.formGradient}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconCircle}>
                    <Ionicons name="shield-checkmark-outline" size={22} color={colors.eu.star} />
                  </View>
                  <View>
                    <Text style={styles.stepTitle}>Seguridad</Text>
                    <Text style={styles.stepDesc}>Email y contraseña seguros</Text>
                  </View>
                </View>

                <View style={styles.inputs}>
                  <GlassInput
                    label="Email"
                    value={email}
                    onChangeText={(t) => { setEmail(t); if (fieldErrors.email) setFieldError("email", null); }}
                    error={fieldErrors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    leftIcon={<Ionicons name="mail-outline" size={18} color={colors.text.tertiary} />}
                  />

                  <GlassInput
                    label="Contraseña"
                    value={password}
                    onChangeText={(t) => { setPassword(t); if (fieldErrors.password) setFieldError("password", null); }}
                    error={fieldErrors.password}
                    secureTextEntry={!showPassword}
                    leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.text.tertiary} />}
                    rightIcon={
                      <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={12}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={colors.text.secondary} />
                      </Pressable>
                    }
                  />

                  {/* Password strength bar */}
                  {password.length > 0 && (
                    <View style={styles.strengthRow}>
                      <View style={styles.strengthTrack}>
                        {[1, 2, 3, 4].map((i) => (
                          <View
                            key={i}
                            style={[
                              styles.strengthSegment,
                              i <= passwordStrength && { backgroundColor: strengthColor },
                            ]}
                          />
                        ))}
                      </View>
                      <Text style={[styles.strengthLabel, { color: strengthColor }]}>
                        {strengthLabel}
                      </Text>
                    </View>
                  )}

                  <GlassInput
                    label="Confirmar contraseña"
                    value={confirmPassword}
                    onChangeText={(t) => { setConfirmPassword(t); if (fieldErrors.confirmPassword) setFieldError("confirmPassword", null); }}
                    error={fieldErrors.confirmPassword}
                    secureTextEntry={!showPassword}
                    leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.text.tertiary} />}
                  />
                </View>

                <GlassButton
                  title="Continuar"
                  variant="primary"
                  size="lg"
                  onPress={handleNext}
                  style={styles.actionButton}
                />
              </LinearGradient>
            </Animated.View>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <Animated.View entering={SlideInRight.springify()} style={styles.formCard}>
              <LinearGradient
                colors={["rgba(15, 21, 53, 0.65)", "rgba(11, 14, 42, 0.80)"]}
                style={styles.formGradient}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconCircle}>
                    <Ionicons name="person-outline" size={22} color={colors.eu.star} />
                  </View>
                  <View>
                    <Text style={styles.stepTitle}>Tu perfil</Text>
                    <Text style={styles.stepDesc}>Cuéntanos sobre ti</Text>
                  </View>
                </View>

                <View style={styles.inputs}>
                  <View style={styles.row}>
                    <View style={styles.halfInput}>
                      <GlassInput
                        label="Nombre"
                        value={firstName}
                        onChangeText={(t) => { setFirstName(t); if (fieldErrors.firstName) setFieldError("firstName", null); }}
                        error={fieldErrors.firstName}
                        leftIcon={<Ionicons name="person-outline" size={16} color={colors.text.tertiary} />}
                      />
                    </View>
                    <View style={styles.halfInput}>
                      <GlassInput
                        label="Apellido"
                        value={lastName}
                        onChangeText={(t) => { setLastName(t); if (fieldErrors.lastName) setFieldError("lastName", null); }}
                        error={fieldErrors.lastName}
                      />
                    </View>
                  </View>

                  <GlassInput
                    label="Fecha de nacimiento"
                    value={dateOfBirth}
                    onChangeText={(t) => { setDateOfBirth(t); if (fieldErrors.dateOfBirth) setFieldError("dateOfBirth", null); }}
                    error={fieldErrors.dateOfBirth}
                    placeholder="1999-06-15"
                    leftIcon={<Ionicons name="calendar-outline" size={18} color={colors.text.tertiary} />}
                  />

                  {/* Divider */}
                  <View style={styles.sectionDivider}>
                    <View style={styles.sectionLine} />
                    <Text style={styles.sectionLabel}>Opcional</Text>
                    <View style={styles.sectionLine} />
                  </View>

                  <GlassInput
                    label="Ciudad destino Erasmus"
                    value={destinationCity}
                    onChangeText={setDestinationCity}
                    leftIcon={<Ionicons name="location-outline" size={18} color={colors.text.tertiary} />}
                  />

                  <GlassInput
                    label="País destino"
                    value={destinationCountry}
                    onChangeText={setDestinationCountry}
                    leftIcon={<Ionicons name="flag-outline" size={18} color={colors.text.tertiary} />}
                  />
                </View>

                <GlassButton
                  title="Crear mi cuenta"
                  variant="primary"
                  size="lg"
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.actionButton}
                />
              </LinearGradient>
            </Animated.View>
          )}

          {/* Login CTA */}
          <Animated.View entering={FadeIn.delay(500)} style={styles.loginCTA}>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta?{" "}
                <Text style={styles.loginBold}>Inicia sesión</Text>
              </Text>
            </Pressable>
          </Animated.View>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 20,
    paddingTop: spacing.xl,
  },
  decorCircle1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(26, 61, 232, 0.06)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: 100,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255, 215, 0, 0.04)",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // Error
  errorCard: {
    marginBottom: spacing.md,
    backgroundColor: "rgba(244, 67, 54, 0.12)",
    borderColor: "rgba(244, 67, 54, 0.25)",
    borderWidth: 1,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  errorText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.status.error,
    flex: 1,
  },

  // Form
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
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stepIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
  },
  stepDesc: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  inputs: { gap: spacing.sm },
  row: { flexDirection: "row", gap: spacing.sm },
  halfInput: { flex: 1 },

  // Strength
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: -spacing.xs,
  },
  strengthTrack: {
    flex: 1,
    flexDirection: "row",
    gap: 3,
  },
  strengthSegment: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  strengthLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.tiny.fontSize,
  },

  // Section divider
  sectionDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: spacing.xs,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  sectionLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.disabled,
    paddingHorizontal: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  actionButton: { marginTop: spacing.lg },

  // Login CTA
  loginCTA: {
    alignItems: "center",
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  loginText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  loginBold: {
    fontFamily: typography.families.subheading,
    color: colors.eu.star,
  },
});
