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
import { colors, typography, spacing } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthStackParamList, RegisterRequest } from "@/types";
import { AxiosError } from "axios";

const { width } = Dimensions.get("window");
type Nav = StackNavigationProp<AuthStackParamList, "Register">;

export default function RegisterScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);

  // Step 1 fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");

  // Field errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldError = (field: string, msg: string | null) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (msg) next[field] = msg;
      else delete next[field];
      return next;
    });
  };

  const validateStep1 = (): boolean => {
    let valid = true;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setFieldError("email", "El email es obligatorio");
      valid = false;
    } else if (!emailRe.test(email)) {
      setFieldError("email", "Formato de email inválido");
      valid = false;
    } else {
      setFieldError("email", null);
    }

    if (!password) {
      setFieldError("password", "La contraseña es obligatoria");
      valid = false;
    } else if (password.length < 8) {
      setFieldError("password", "Mínimo 8 caracteres");
      valid = false;
    } else {
      setFieldError("password", null);
    }

    if (password !== confirmPassword) {
      setFieldError("confirmPassword", "Las contraseñas no coinciden");
      valid = false;
    } else {
      setFieldError("confirmPassword", null);
    }

    return valid;
  };

  const validateStep2 = (): boolean => {
    let valid = true;

    if (!firstName.trim()) {
      setFieldError("firstName", "El nombre es obligatorio");
      valid = false;
    } else {
      setFieldError("firstName", null);
    }

    if (!lastName.trim()) {
      setFieldError("lastName", "El apellido es obligatorio");
      valid = false;
    } else {
      setFieldError("lastName", null);
    }

    // dateOfBirth: YYYY-MM-DD
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateOfBirth.trim()) {
      setFieldError("dateOfBirth", "La fecha de nacimiento es obligatoria");
      valid = false;
    } else if (!dateRe.test(dateOfBirth)) {
      setFieldError("dateOfBirth", "Formato: AAAA-MM-DD");
      valid = false;
    } else {
      const d = new Date(dateOfBirth);
      if (isNaN(d.getTime()) || d >= new Date()) {
        setFieldError("dateOfBirth", "Fecha no válida");
        valid = false;
      } else {
        setFieldError("dateOfBirth", null);
      }
    }

    return valid;
  };

  const handleNext = () => {
    setError(null);
    if (validateStep1()) setStep(2);
  };

  const handleRegister = async () => {
    setError(null);
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
      if (err instanceof AxiosError) {
        const msg = err.response?.data?.message || err.response?.data?.error;
        if (err.response?.status === 409) {
          setError("Ya existe una cuenta con ese email");
          setStep(1);
        } else {
          setError(msg || "Error al registrarse. Intenta de nuevo.");
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
      <View style={styles.decorCircle1} />

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
          <View style={styles.header}>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>
              Paso {step} de 2 — {step === 1 ? "Credenciales" : "Datos personales"}
            </Text>
            {/* Step indicator */}
            <View style={styles.stepRow}>
              <View style={[styles.stepDot, styles.stepActive]} />
              <View style={[styles.stepLine, step === 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step === 2 && styles.stepActive]} />
            </View>
          </View>

          {/* Error card */}
          {error && (
            <GlassCard variant="elevated" style={styles.errorCard}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </GlassCard>
          )}

          {/* Form */}
          <View style={styles.form}>
            {step === 1 ? (
              <>
                <GlassInput
                  label="Email"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (fieldErrors.email) setFieldError("email", null);
                  }}
                  error={fieldErrors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                />
                <GlassInput
                  label="Contraseña"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (fieldErrors.password) setFieldError("password", null);
                  }}
                  error={fieldErrors.password}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                  rightIcon={
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Text style={styles.eyeIcon}>
                        {showPassword ? "🙈" : "👁️"}
                      </Text>
                    </Pressable>
                  }
                />
                <GlassInput
                  label="Confirmar contraseña"
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    if (fieldErrors.confirmPassword) setFieldError("confirmPassword", null);
                  }}
                  error={fieldErrors.confirmPassword}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                />
                <GlassButton
                  title="Siguiente"
                  variant="primary"
                  size="lg"
                  onPress={handleNext}
                  style={styles.mainButton}
                />
              </>
            ) : (
              <>
                <GlassInput
                  label="Nombre"
                  value={firstName}
                  onChangeText={(t) => {
                    setFirstName(t);
                    if (fieldErrors.firstName) setFieldError("firstName", null);
                  }}
                  error={fieldErrors.firstName}
                  autoCapitalize="words"
                  textContentType="givenName"
                />
                <GlassInput
                  label="Apellidos"
                  value={lastName}
                  onChangeText={(t) => {
                    setLastName(t);
                    if (fieldErrors.lastName) setFieldError("lastName", null);
                  }}
                  error={fieldErrors.lastName}
                  autoCapitalize="words"
                  textContentType="familyName"
                />
                <GlassInput
                  label="Fecha de nacimiento (AAAA-MM-DD)"
                  value={dateOfBirth}
                  onChangeText={(t) => {
                    setDateOfBirth(t);
                    if (fieldErrors.dateOfBirth) setFieldError("dateOfBirth", null);
                  }}
                  error={fieldErrors.dateOfBirth}
                  keyboardType="numbers-and-punctuation"
                  placeholder="2000-06-15"
                />
                <GlassInput
                  label="Ciudad de destino"
                  value={destinationCity}
                  onChangeText={setDestinationCity}
                  autoCapitalize="words"
                  placeholder="Madrid, Barcelona..."
                />
                <GlassInput
                  label="País de destino"
                  value={destinationCountry}
                  onChangeText={setDestinationCountry}
                  autoCapitalize="words"
                  placeholder="España, Italia..."
                />

                <View style={styles.buttonRow}>
                  <GlassButton
                    title="Atrás"
                    variant="ghost"
                    size="md"
                    onPress={() => setStep(1)}
                    style={styles.backButton}
                  />
                  <GlassButton
                    title="Registrarse"
                    variant="primary"
                    size="lg"
                    onPress={handleRegister}
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.registerButton}
                  />
                </View>
              </>
            )}
          </View>

          {/* Link to login */}
          <Pressable
            onPress={() => navigation.navigate("Login")}
            style={styles.linkContainer}
          >
            <Text style={styles.secondaryText}>
              ¿Ya tienes cuenta?{" "}
              <Text style={styles.linkTextBold}>Inicia sesión</Text>
            </Text>
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
  decorCircle1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "rgba(255, 204, 0, 0.05)",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    color: colors.eu.star,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  stepActive: {
    backgroundColor: colors.eu.star,
    borderColor: colors.eu.star,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  stepLineActive: {
    backgroundColor: colors.eu.star,
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
  mainButton: {
    marginTop: spacing.sm,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  backButton: {
    flex: 0.4,
  },
  registerButton: {
    flex: 0.6,
  },
  linkContainer: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  secondaryText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  linkTextBold: {
    fontFamily: typography.families.subheading,
    color: colors.eu.star,
  },
  eyeIcon: {
    fontSize: 18,
  },
});
