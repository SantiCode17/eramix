/**
 * RegisterScreen — Carousel multi-paso completo
 * 14 pasos (0–13) con validación, APIs reales y upload de fotos
 */
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Linking,
  Alert,
} from "react-native";
import Animated, {
  FadeInDown,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

const isExpoGo = Constants.executionEnvironment === "storeClient";
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
import { useAuthStore } from "@/store/useAuthStore";
import { catalogApi, profileApi } from "@/api/profileService";
import type { AuthStackParamList } from "@/types";
import type { University, Language, Interest } from "@/types/user";

const { width } = Dimensions.get("window");
type Nav = StackNavigationProp<AuthStackParamList, "Register">;

const TOTAL_STEPS = 13;

// ── Constantes de opciones ─────────────────────────────────
const INTENTIONS = [
  { id: "MEET_PEOPLE", label: "Hacer amigos y salir", emoji: "🍻" },
  { id: "FIND_SPECIAL_SOMEONE", label: "Conocer a alguien especial", emoji: "❤️" },
  { id: "PRACTICE_LANGUAGES", label: "Practicar idiomas (tandem)", emoji: "🗣️" },
  { id: "FIND_ROOMMATE", label: "Buscar o compartir piso", emoji: "🏠" },
  { id: "ORGANIZE_PLANS", label: "Organizar planes y eventos", emoji: "🎉" },
  { id: "EXPLORE", label: "Simplemente explorar la comunidad", emoji: "🌍" },
];

const PROFICIENCY_LEVELS = [
  { value: "NATIVE", label: "Nativo" },
  { value: "ADVANCED", label: "Fluido" },
  { value: "INTERMEDIATE", label: "Conversacional" },
  { value: "BASIC", label: "Básico" },
  { value: "TO_PRACTICE", label: "Quiero practicar" },
];

const GENDERS = ["Hombre", "Mujer", "No binario", "Prefiero no decirlo"];
const LOOKING_FOR = ["Hombres", "Mujeres", "Todos", "Sin preferencia"];

const CUR_YEAR = new Date().getFullYear();
const DOB_MAX = new Date(CUR_YEAR - 17, 11, 31);
const DOB_MIN = new Date(CUR_YEAR - 80, 0, 1);
const MOBILITY_FALLBACK_DATE = new Date(CUR_YEAR, 8, 1); // 1-Sep stable fallback

// ── Formatter manual para español (Hermes no soporta Intl con locales) ──
const MESES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const formatDateES = (d: Date): string =>
  `${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;

// ── Countries with flags ──────────────────────────────────
const COUNTRIES = [
  { code: "AL", name: "Albania", flag: "🇦🇱" },
  { code: "DE", name: "Alemania", flag: "🇩🇪" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "BE", name: "Bélgica", flag: "🇧🇪" },
  { code: "BA", name: "Bosnia y Herzegovina", flag: "🇧🇦" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "CY", name: "Chipre", flag: "🇨🇾" },
  { code: "HR", name: "Croacia", flag: "🇭🇷" },
  { code: "DK", name: "Dinamarca", flag: "🇩🇰" },
  { code: "SK", name: "Eslovaquia", flag: "🇸🇰" },
  { code: "SI", name: "Eslovenia", flag: "🇸🇮" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "FI", name: "Finlandia", flag: "🇫🇮" },
  { code: "FR", name: "Francia", flag: "🇫🇷" },
  { code: "GR", name: "Grecia", flag: "🇬🇷" },
  { code: "HU", name: "Hungría", flag: "🇭🇺" },
  { code: "IE", name: "Irlanda", flag: "🇮🇪" },
  { code: "IS", name: "Islandia", flag: "🇮🇸" },
  { code: "IT", name: "Italia", flag: "🇮🇹" },
  { code: "XK", name: "Kosovo", flag: "🇽🇰" },
  { code: "LV", name: "Letonia", flag: "🇱🇻" },
  { code: "LT", name: "Lituania", flag: "🇱🇹" },
  { code: "LU", name: "Luxemburgo", flag: "🇱🇺" },
  { code: "MK", name: "Macedonia del Norte", flag: "🇲🇰" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "MD", name: "Moldavia", flag: "🇲🇩" },
  { code: "ME", name: "Montenegro", flag: "🇲🇪" },
  { code: "NO", name: "Noruega", flag: "🇳🇴" },
  { code: "NL", name: "Países Bajos", flag: "🇳🇱" },
  { code: "PL", name: "Polonia", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧" },
  { code: "CZ", name: "República Checa", flag: "🇨🇿" },
  { code: "RO", name: "Rumanía", flag: "🇷🇴" },
  { code: "RS", name: "Serbia", flag: "🇷🇸" },
  { code: "SE", name: "Suecia", flag: "🇸🇪" },
  { code: "CH", name: "Suiza", flag: "🇨🇭" },
  { code: "TR", name: "Turquía", flag: "🇹🇷" },
  { code: "UA", name: "Ucrania", flag: "🇺🇦" },
];

interface LangEntry {
  language: Language;
  proficiencyLevel: string;
}

// ── Componente principal ───────────────────────────────────
export default function RegisterScreen(): React.JSX.Element {
  const navigation = useNavigation<Nav>();
  const register = useAuthStore((s) => s.register);
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [parentScrollEnabled, setParentScrollEnabled] = useState(true);

  // Catálogos
  const [allUniversities, setAllUniversities] = useState<University[]>([]);
  const [allLanguages, setAllLanguages] = useState<Language[]>([]);
  const [allInterests, setAllInterests] = useState<Interest[]>([]);

  // Step 0
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Step 2 – Fecha de nacimiento
  const [dob, setDob] = useState(new Date(CUR_YEAR - 22, 5, 15));
  const [showDobPicker, setShowDobPicker] = useState(false);

  // Step 3 – Universidad de origen
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [homeUniSearch, setHomeUniSearch] = useState("");
  const [homeUniversity, setHomeUniversity] = useState<University | null>(null);
  const [homeUniResults, setHomeUniResults] = useState<University[]>([]);
  const [degree, setDegree] = useState("");

  // Step 4 – Erasmus actual
  const [destinationCity, setDestinationCity] = useState("");
  const [hostUniSearch, setHostUniSearch] = useState("");
  const [hostUniversity, setHostUniversity] = useState<University | null>(null);
  const [hostUniResults, setHostUniResults] = useState<University[]>([]);
  const [mobilityStartDate, setMobilityStartDate] = useState<Date | null>(null);
  const [mobilityEndDate, setMobilityEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Step 5 – Intenciones
  const [intentions, setIntentions] = useState<string[]>([]);

  // Step 6 – Idiomas
  const [langSearch, setLangSearch] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState<LangEntry[]>([]);
  const [showLangSearch, setShowLangSearch] = useState(false);
  const [pendingLang, setPendingLang] = useState<Language | null>(null);
  const [pendingLevel, setPendingLevel] = useState("NATIVE");

  // Step 7 – Género
  const [gender, setGender] = useState("");
  const [lookingForGender, setLookingForGender] = useState("");
  const [showGenderOnProfile, setShowGenderOnProfile] = useState(true);

  // Step 8 – Intereses
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);

  // Step 9 – Fotos
  const [photos, setPhotos] = useState<string[]>([]);

  // Step 11 – Ubicación
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationDeniedPermanently, setLocationDeniedPermanently] = useState(false);

  // Step 12 – Notificaciones
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifDeniedPermanently, setNotifDeniedPermanently] = useState(false);

  // ── Carga catálogos al iniciar ─────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [unis, langs, interests] = await Promise.all([
          catalogApi.getUniversities(),
          catalogApi.getLanguages(),
          catalogApi.getInterests(),
        ]);
        setAllUniversities(unis);
        setAllLanguages(langs);
        setAllInterests(interests);
      } catch {
        // seguir aunque falle
      }
    };
    load();
  }, []);

  // ── Búsqueda de universidades (origen) ────────────────
  useEffect(() => {
    if (homeUniSearch.length < 2) { setHomeUniResults([]); return; }
    const q = homeUniSearch.toLowerCase();
    setHomeUniResults(
      allUniversities
        .filter((u) =>
          u.name.toLowerCase().includes(q) ||
          u.city.toLowerCase().includes(q) ||
          u.country.toLowerCase().includes(q)
        )
        .slice(0, 6)
    );
  }, [homeUniSearch, allUniversities]);

  // ── Búsqueda de universidades (destino) ───────────────
  useEffect(() => {
    if (hostUniSearch.length < 2) { setHostUniResults([]); return; }
    const q = hostUniSearch.toLowerCase();
    setHostUniResults(
      allUniversities
        .filter((u) =>
          u.name.toLowerCase().includes(q) ||
          u.city.toLowerCase().includes(q) ||
          u.country.toLowerCase().includes(q)
        )
        .slice(0, 6)
    );
  }, [hostUniSearch, allUniversities]);

  // ── Filtro de idiomas ──────────────────────────────────
  const filteredLanguages = langSearch.length >= 1
    ? allLanguages.filter((l) => l.name.toLowerCase().includes(langSearch.toLowerCase())).slice(0, 8)
    : allLanguages.slice(0, 8);

  // ── Validación por paso ────────────────────────────────
  const validateStep = (): string | null => {
    switch (step) {
      case 0:
        if (!email.trim() || !email.includes("@")) return "Introduce un email válido.";
        if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
        return null;
      case 1:
        if (!firstName.trim()) return "El nombre es obligatorio.";
        return null;
      case 2: {
        const ageMs = new Date().getTime() - dob.getTime();
        if (ageMs / (1000 * 60 * 60 * 24 * 365) < 17) return "Debes tener al menos 17 años.";
        return null;
      }
      case 3:
        if (!homeUniversity) return "Selecciona tu universidad de origen.";
        if (!degree.trim()) return "Indica tu carrera o grado.";
        return null;
      case 4:
        if (!destinationCity.trim()) return "Indica tu ciudad de destino.";
        return null;
      case 9:
        if (photos.length === 0) return "Sube al menos una foto para continuar.";
        return null;
      default:
        return null;
    }
  };

  // ── Navegación entre pasos ─────────────────────────────
  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setErrorMessage(err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setErrorMessage("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrorMessage("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 0) setStep((s) => s - 1);
    else navigation.goBack();
  };

  // ── Registro final ────────────────────────────────────
  const handleRegister = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      const dobStr = dob.toISOString().split("T")[0];
      const mStart = mobilityStartDate ? mobilityStartDate.toISOString().split("T")[0] : undefined;
      const mEnd = mobilityEndDate ? mobilityEndDate.toISOString().split("T")[0] : undefined;
      await register({
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim() || ".",
        dateOfBirth: dobStr,
        homeUniversityId: homeUniversity?.id,
        hostUniversityId: hostUniversity?.id,
        destinationCity: destinationCity.trim() || undefined,
        destinationCountry: hostUniversity?.country || undefined,
        mobilityStartDate: mStart,
        mobilityEndDate: mEnd,
        degree: degree.trim() || undefined,
        gender: gender || undefined,
        lookingForGender: lookingForGender || undefined,
        showGenderOnProfile,
        notificationsEnabled,
        intentions: intentions.length > 0 ? intentions : undefined,
        languages: selectedLanguages.length > 0
          ? selectedLanguages.map((l) => ({ languageId: l.language.id, proficiencyLevel: l.proficiencyLevel }))
          : undefined,
        interestIds: selectedInterestIds.length > 0 ? selectedInterestIds : undefined,
      });

      for (const uri of photos) {
        try { await profileApi.addPhoto(uri, photos.indexOf(uri) + 1); } catch { /* no bloquear */ }
      }

      navigation.navigate("Main" as any);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(
        err?.response?.data?.message || err?.message || "Error al registrarse. Verifica los datos."
      );
      setStep(0);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────
  const toggleIntention = (id: string) =>
    setIntentions((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const toggleInterest = (id: number) =>
    setSelectedInterestIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 10) return prev;
      return [...prev, id];
    });

  const addLanguage = () => {
    if (!pendingLang) return;
    if (!selectedLanguages.find((l) => l.language.id === pendingLang.id)) {
      setSelectedLanguages((prev) => [...prev, { language: pendingLang, proficiencyLevel: pendingLevel }]);
    }
    setPendingLang(null); setPendingLevel("NATIVE"); setLangSearch(""); setShowLangSearch(false);
  };

  const removeLanguage = (id: number) =>
    setSelectedLanguages((prev) => prev.filter((l) => l.language.id !== id));

  const pickPhoto = async () => {
    if (photos.length >= 6) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { setErrorMessage("Necesitamos permiso para acceder a tu galería."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: true,
      aspect: [4, 5],
    });
    if (!result.canceled && result.assets[0]) setPhotos((prev) => [...prev, result.assets[0].uri]);
  };

  const removePhoto = (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx));

  const requestLocation = async () => {
    setLocationLoading(true);
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationGranted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (!canAskAgain) {
        setLocationDeniedPermanently(true);
        Alert.alert(
          "Permiso denegado",
          "Has denegado el permiso de ubicación anteriormente. Puedes activarlo desde los Ajustes de tu dispositivo.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Abrir Ajustes", onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (err) {
      console.warn("Location permission error:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLocationLoading(false);
    }
  };

  const requestNotifications = async () => {
    if (isExpoGo) {
      // En Expo Go SDK 53 no se pueden registrar notificaciones remotas
      setNotificationsEnabled(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    setNotifLoading(true);
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === "granted") {
        setNotificationsEnabled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // On Android 13+, if user denies twice, system won't show dialog again
        setNotifDeniedPermanently(true);
        Alert.alert(
          "Permiso denegado",
          "Para recibir notificaciones, actívalas desde los Ajustes de tu dispositivo.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Abrir Ajustes", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (err) {
      console.warn("Notification permission error:", err);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setNotifLoading(false);
    }
  };

  const interestsByCategory = allInterests.reduce<Record<string, Interest[]>>((acc, it) => {
    const cat = it.category || "Otros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(it);
    return acc;
  }, {});

  const CAT_LABELS: Record<string, string> = {
    SPORTS: "🏅 Deportes", MUSIC: "🎵 Música", ART: "🎨 Arte", FOOD: "🍴 Gastronomía",
    TRAVEL: "✈️ Viajes", TECH: "💻 Tecnología", LANGUAGES: "🗣️ Idiomas", SOCIAL: "👥 Social",
  };

  // ── Sub-componentes ────────────────────────────────────
  const StepHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <View style={{ marginBottom: errorMessage ? spacing.sm : spacing.lg }}>
      <Text style={st.stepTitle}>{title}</Text>
      {subtitle ? <Text style={st.stepSubtitle}>{subtitle}</Text> : null}
      {errorMessage ? (
        <Animated.View entering={FadeInDown} style={[st.errorBanner, { marginTop: spacing.md }]}>
          <Ionicons name="alert-circle" size={18} color={colors.status.error} />
          <Text style={st.errorText}>{errorMessage}</Text>
          <Pressable onPress={() => setErrorMessage("")}>
            <Ionicons name="close" size={16} color={colors.status.error} />
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );

  // Filtered countries for picker
  const filteredCountries = countrySearch.length > 0
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
    : COUNTRIES;

  // ── Render ─────────────────────────────────────────────
  return (
    <ScreenBackground>
      <View style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Barra de progreso */}
        <View style={[st.headerRow, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={handleBack} style={st.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </Pressable>
          <View style={st.progressContainer}>
            <View style={[st.progressBar, { width: `${(step / TOTAL_STEPS) * 100}%` as any }]} />
          </View>
          <Text style={st.stepCount}>{step}/{TOTAL_STEPS}</Text>
        </View>

        <ScrollView
          contentContainerStyle={st.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={parentScrollEnabled}
          nestedScrollEnabled
        >
          {/* ══ PASO 0: Email y contraseña ══ */}
          {step === 0 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="Crea tu cuenta" subtitle="Empieza tu aventura Erasmus" />
              <DSInput icon="mail" label="Email" value={email} onChangeText={setEmail}
                placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none" containerStyle={{ marginBottom: spacing.sm }} />
              <DSInput icon="lock-closed" label="Contraseña" value={password} onChangeText={setPassword}
                placeholder="Mínimo 8 caracteres" secureTextEntry={!showPassword}
                rightElement={
                  <Pressable onPress={() => setShowPassword((v) => !v)}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.text.tertiary} />
                  </Pressable>
                }
              />
              <View style={st.orContainer}>
                <View style={st.orLine} /><Text style={st.orText}>o regístrate con</Text><View style={st.orLine} />
              </View>
              <Pressable style={st.socialBtn}>
                <Ionicons name="logo-google" size={20} color={colors.text.primary} />
                <Text style={st.socialBtnText}>Continuar con Google</Text>
              </Pressable>
              <Pressable style={[st.socialBtn, { marginTop: spacing.sm, backgroundColor: "#000", borderColor: "#333" }]}>
                <Ionicons name="logo-apple" size={20} color="#fff" />
                <Text style={[st.socialBtnText, { color: "#fff" }]}>Continuar con Apple</Text>
              </Pressable>
              <Pressable style={[st.socialBtn, { marginTop: spacing.sm, backgroundColor: "#1877F2", borderColor: "#1877F2" }]}>
                <Ionicons name="logo-facebook" size={20} color="#fff" />
                <Text style={[st.socialBtnText, { color: "#fff" }]}>Continuar con Facebook</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* ══ PASO 1: Nombre ══ */}
          {step === 1 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="¿Cómo te llamas?" subtitle="Así te verán otros Erasmus" />
              <DSInput icon="person" label="Nombre (público)" value={firstName} onChangeText={setFirstName} placeholder="Ej. María" />
              <DSInput icon="person-outline" label="Apellido (opcional)" value={lastName} onChangeText={setLastName} placeholder="Ej. García" />
              <Text style={st.hint}>💡 Solo se mostrará la inicial del apellido en tu perfil.</Text>
            </Animated.View>
          )}

          {/* ══ PASO 2: Fecha de nacimiento — Selector nativo ══ */}
          {step === 2 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="¿Cuándo naciste?" subtitle="Selecciona tu fecha de nacimiento" />

              {Platform.OS === "ios" ? (
                /* iOS: spinner nativo siempre visible */
                <View
                  onTouchStart={() => setParentScrollEnabled(false)}
                  onTouchEnd={() => setParentScrollEnabled(true)}
                  onTouchCancel={() => setParentScrollEnabled(true)}
                >
                  <DateTimePicker
                    value={dob}
                    mode="date"
                    display="spinner"
                    locale="es-ES"
                    maximumDate={DOB_MAX}
                    minimumDate={DOB_MIN}
                    onChange={(_, date) => { if (date) setDob(date); }}
                    style={{ marginTop: spacing.sm }}
                  />
                </View>
              ) : (
                /* Android: botón que abre el diálogo nativo */
                <>
                  <Pressable style={st.dateBtn} onPress={() => setShowDobPicker(true)}>
                    <Ionicons name="calendar" size={22} color={DS.primary} />
                    <Text style={st.dateBtnText}>
                      {formatDateES(dob)}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={colors.text.tertiary} />
                  </Pressable>
                  {showDobPicker && (
                    <DateTimePicker
                      value={dob}
                      mode="date"
                      display="default"
                      maximumDate={DOB_MAX}
                      minimumDate={DOB_MIN}
                      onChange={(e: any, date?: Date) => {
                        setShowDobPicker(false);
                        if (e.type === "set") {
                          const selectedDate = e.nativeEvent?.timestamp ? new Date(e.nativeEvent.timestamp) : date;
                          if (selectedDate && !isNaN(selectedDate.getTime())) {
                            setDob(selectedDate);
                          }
                        }
                      }}
                    />
                  )}
                </>
              )}

              {/* Preview de fecha — solo en Android */}
              {Platform.OS === "android" && (
                <View style={st.dobPreview}>
                  <Ionicons name="calendar" size={16} color={DS.primary} />
                  <Text style={st.dobPreviewText}>
                    {formatDateES(dob)}
                  </Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* ══ PASO 3: Universidad de origen ══ */}
          {step === 3 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="Universidad de origen" subtitle="¿De dónde eres?" />

              {/* País de origen — desplegable con banderas */}
              <Text style={st.label}>País de origen</Text>
              {!showCountryPicker ? (
                <Pressable
                  style={[st.inputWrap, { marginBottom: spacing.md }]}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Ionicons name="flag" size={20} color={originCountry ? DS.primary : colors.text.tertiary} style={st.inputIcon} />
                  <Text style={[st.inputText, { color: originCountry ? colors.text.primary : colors.text.tertiary }]}>
                    {originCountry || "Selecciona tu país de origen"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.text.tertiary} />
                </Pressable>
              ) : (
                <View style={st.countryPickerBox}>
                  <View style={[st.inputWrap, { marginBottom: 0 }]}>
                    <Ionicons name="search" size={20} color={colors.text.tertiary} style={st.inputIcon} />
                    <TextInput
                      style={st.inputText}
                      value={countrySearch}
                      onChangeText={setCountrySearch}
                      placeholder="Busca un país..."
                      placeholderTextColor={colors.text.tertiary}
                      autoFocus
                    />
                    <Pressable onPress={() => { setShowCountryPicker(false); setCountrySearch(""); }}>
                      <Ionicons name="close" size={18} color={colors.text.tertiary} />
                    </Pressable>
                  </View>
                  <ScrollView style={st.countryList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                    {filteredCountries.map((c) => (
                      <Pressable
                        key={c.code}
                        style={st.countryItem}
                        onPress={() => {
                          setOriginCountry(`${c.flag} ${c.name}`);
                          setShowCountryPicker(false);
                          setCountrySearch("");
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Text style={st.countryFlag}>{c.flag}</Text>
                        <Text style={st.countryName}>{c.name}</Text>
                        {originCountry.includes(c.name) && (
                          <Ionicons name="checkmark" size={16} color={DS.primary} />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Universidad de origen */}
              <Text style={st.label}>Universidad de origen</Text>
              {homeUniversity ? (
                <View style={st.selectedUniBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.selectedUniName}>{homeUniversity.name}</Text>
                    <Text style={st.selectedUniSub}>{homeUniversity.city}, {homeUniversity.country}</Text>
                  </View>
                  <Pressable onPress={() => { setHomeUniversity(null); setHomeUniSearch(""); }}>
                    <Ionicons name="close-circle" size={22} color={colors.text.tertiary} />
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={[st.inputWrap, { marginBottom: 0 }]}>
                    <Ionicons name="school" size={20} color={colors.text.tertiary} style={st.inputIcon} />
                    <TextInput style={st.inputText} value={homeUniSearch} onChangeText={setHomeUniSearch}
                      placeholder="Busca tu universidad..." placeholderTextColor={colors.text.tertiary} />
                    {homeUniSearch.length > 0 && (
                      <Pressable onPress={() => setHomeUniSearch("")}>
                        <Ionicons name="close" size={18} color={colors.text.tertiary} />
                      </Pressable>
                    )}
                  </View>
                  {homeUniResults.length > 0 && (
                    <View style={st.dropdown}>
                      {homeUniResults.map((u) => (
                        <Pressable key={u.id} style={st.dropdownItem}
                          onPress={() => { setHomeUniversity(u); setHomeUniSearch(""); setHomeUniResults([]); if (!originCountry) setOriginCountry(u.country); }}>
                          <Text style={st.dropdownItemName}>{u.name}</Text>
                          <Text style={st.dropdownItemSub}>{u.city}, {u.country}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              )}
              <View style={{ marginTop: spacing.lg }}>
                <DSInput icon="book" label="Carrera / Grado" value={degree} onChangeText={setDegree} placeholder="Ej. Ingeniería Informática" />
              </View>
            </Animated.View>
          )}

          {/* ══ PASO 4: Destino Erasmus ══ */}
          {step === 4 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="Tu destino Erasmus" subtitle="¡Cuéntanos dónde vas!" />
              <DSInput icon="location" label="Ciudad de destino" value={destinationCity} onChangeText={setDestinationCity} placeholder="Ej. Varsovia" />
              <Text style={st.label}>Universidad de destino (opcional)</Text>
              {hostUniversity ? (
                <View style={st.selectedUniBox}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.selectedUniName}>{hostUniversity.name}</Text>
                    <Text style={st.selectedUniSub}>{hostUniversity.city}, {hostUniversity.country}</Text>
                  </View>
                  <Pressable onPress={() => { setHostUniversity(null); setHostUniSearch(""); }}>
                    <Ionicons name="close-circle" size={22} color={colors.text.tertiary} />
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={[st.inputWrap, { marginBottom: 0 }]}>
                    <Ionicons name="school-outline" size={20} color={colors.text.tertiary} style={st.inputIcon} />
                    <TextInput style={st.inputText} value={hostUniSearch} onChangeText={setHostUniSearch}
                      placeholder="Busca tu universidad destino..." placeholderTextColor={colors.text.tertiary} />
                    {hostUniSearch.length > 0 && (
                      <Pressable onPress={() => setHostUniSearch("")}>
                        <Ionicons name="close" size={18} color={colors.text.tertiary} />
                      </Pressable>
                    )}
                  </View>
                  {hostUniResults.length > 0 && (
                    <View style={st.dropdown}>
                      {hostUniResults.map((u) => (
                        <Pressable key={u.id} style={st.dropdownItem}
                          onPress={() => { setHostUniversity(u); setHostUniSearch(""); setHostUniResults([]); if (!destinationCity) setDestinationCity(u.city); }}>
                          <Text style={st.dropdownItemName}>{u.name}</Text>
                          <Text style={st.dropdownItemSub}>{u.city}, {u.country}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              )}
              <View style={{ marginTop: spacing.lg }}>
                <Text style={st.label}>Inicio de la movilidad</Text>
                {Platform.OS === "ios" ? (
                  <View onTouchStart={() => setParentScrollEnabled(false)} onTouchEnd={() => setParentScrollEnabled(true)} onTouchCancel={() => setParentScrollEnabled(true)}>
                    <DateTimePicker value={mobilityStartDate ?? MOBILITY_FALLBACK_DATE} mode="date" display="spinner" locale="es-ES" onChange={(_, date) => { if (date) setMobilityStartDate(date); }} style={{ marginTop: spacing.sm }} />
                  </View>
                ) : (
                  <>
                    <Pressable style={st.dateBtn} onPress={() => setShowStartPicker(true)}>
                      <Ionicons name="calendar-outline" size={20} color={mobilityStartDate ? DS.primary : colors.text.tertiary} />
                      <Text style={[st.dateBtnText, { color: mobilityStartDate ? colors.text.primary : colors.text.tertiary }]}>
                        {mobilityStartDate ? formatDateES(mobilityStartDate) : "Selecciona fecha de inicio"}
                      </Text>
                      <Ionicons name="chevron-down" size={18} color={colors.text.tertiary} />
                    </Pressable>
                    {showStartPicker && (
                      <DateTimePicker 
                        value={mobilityStartDate ?? MOBILITY_FALLBACK_DATE} 
                        mode="date" 
                        display="default" 
                        onChange={(e: any, date?: Date) => { 
                          setShowStartPicker(false); 
                          if (e.type === "set") {
                            const selectedDate = e.nativeEvent?.timestamp ? new Date(e.nativeEvent.timestamp) : date;
                            if (selectedDate && !isNaN(selectedDate.getTime())) {
                              setMobilityStartDate(selectedDate);
                            }
                          } 
                        }} 
                      />
                    )}
                  </>
                )}

                <Text style={[st.label, { marginTop: spacing.md }]}>Fin estimado</Text>
                {Platform.OS === "ios" ? (
                  <View onTouchStart={() => setParentScrollEnabled(false)} onTouchEnd={() => setParentScrollEnabled(true)} onTouchCancel={() => setParentScrollEnabled(true)}>
                    <DateTimePicker value={mobilityEndDate ?? MOBILITY_FALLBACK_DATE} mode="date" display="spinner" locale="es-ES" onChange={(_, date) => { if (date) setMobilityEndDate(date); }} style={{ marginTop: spacing.sm }} />
                  </View>
                ) : (
                  <>
                    <Pressable style={st.dateBtn} onPress={() => setShowEndPicker(true)}>
                      <Ionicons name="calendar-outline" size={20} color={mobilityEndDate ? DS.primary : colors.text.tertiary} />
                      <Text style={[st.dateBtnText, { color: mobilityEndDate ? colors.text.primary : colors.text.tertiary }]}>
                        {mobilityEndDate ? formatDateES(mobilityEndDate) : "Selecciona fecha de fin"}
                      </Text>
                      <Ionicons name="chevron-down" size={18} color={colors.text.tertiary} />
                    </Pressable>
                    {showEndPicker && (
                      <DateTimePicker 
                        value={mobilityEndDate ?? MOBILITY_FALLBACK_DATE} 
                        mode="date" 
                        display="default" 
                        onChange={(e: any, date?: Date) => { 
                          setShowEndPicker(false); 
                          if (e.type === "set") {
                            const selectedDate = e.nativeEvent?.timestamp ? new Date(e.nativeEvent.timestamp) : date;
                            if (selectedDate && !isNaN(selectedDate.getTime())) {
                              setMobilityEndDate(selectedDate);
                            }
                          } 
                        }} 
                      />
                    )}
                  </>
                )}
              </View>
            </Animated.View>
          )}

          {/* ══ PASO 5: Intenciones ══ */}
          {step === 5 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="¿Qué buscas en EraMix?" subtitle="Puedes elegir varias opciones" />
              {INTENTIONS.map((item) => {
                const active = intentions.includes(item.id);
                return (
                  <Pressable key={item.id} onPress={() => toggleIntention(item.id)}
                    style={[st.selectionItem, active && st.selectionItemActive]}>
                    <Text style={st.selectionEmoji}>{item.emoji}</Text>
                    <Text style={[st.selectionText, active && { color: DS.primary }]}>{item.label}</Text>
                    {active && <Ionicons name="checkmark-circle" size={20} color={DS.primary} />}
                  </Pressable>
                );
              })}
            </Animated.View>
          )}

          {/* ══ PASO 6: Idiomas ══ */}
          {step === 6 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="Idiomas" subtitle="¿Qué idiomas hablas y cuáles quieres practicar?" />
              {selectedLanguages.map((entry) => (
                <View key={entry.language.id} style={st.langEntry}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.langEntryName}>{entry.language.name}</Text>
                    <Text style={st.langEntryLevel}>
                      {PROFICIENCY_LEVELS.find((p) => p.value === entry.proficiencyLevel)?.label ?? entry.proficiencyLevel}
                    </Text>
                  </View>
                  <Pressable onPress={() => removeLanguage(entry.language.id)}>
                    <Ionicons name="close-circle" size={22} color={colors.text.tertiary} />
                  </Pressable>
                </View>
              ))}
              {pendingLang ? (
                <View style={st.pendingLangBox}>
                  <Text style={st.pendingLangName}>{pendingLang.name}</Text>
                  <Text style={st.label}>Nivel:</Text>
                  <View style={st.levelRow}>
                    {PROFICIENCY_LEVELS.map((lv) => (
                      <Pressable key={lv.value} onPress={() => setPendingLevel(lv.value)}
                        style={[st.levelChip, pendingLevel === lv.value && st.levelChipActive]}>
                        <Text style={[st.levelChipText, pendingLevel === lv.value && { color: DS.primary }]}>{lv.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={st.pendingBtns}>
                    <Pressable style={st.cancelBtn} onPress={() => setPendingLang(null)}>
                      <Text style={st.cancelBtnText}>Cancelar</Text>
                    </Pressable>
                    <Pressable style={st.addBtn} onPress={addLanguage}>
                      <Text style={st.addBtnText}>Añadir</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  {showLangSearch && (
                    <>
                      <View style={st.inputWrap}>
                        <Ionicons name="search" size={20} color={colors.text.tertiary} style={st.inputIcon} />
                        <TextInput style={st.inputText} value={langSearch} onChangeText={setLangSearch}
                          placeholder="Busca un idioma..." placeholderTextColor={colors.text.tertiary} autoFocus />
                      </View>
                      <View style={st.dropdown}>
                        {filteredLanguages
                          .filter((l) => !selectedLanguages.find((s) => s.language.id === l.id))
                          .map((lang) => (
                            <Pressable key={lang.id} style={st.dropdownItem}
                              onPress={() => { setPendingLang(lang); setShowLangSearch(false); }}>
                              <Text style={st.dropdownItemName}>{lang.name}</Text>
                            </Pressable>
                          ))}
                      </View>
                    </>
                  )}
                  <Pressable style={st.addLangBtn} onPress={() => setShowLangSearch(true)}>
                    <Ionicons name="add" size={20} color={DS.primary} />
                    <Text style={st.addLangBtnText}>Añadir idioma</Text>
                  </Pressable>
                </>
              )}
            </Animated.View>
          )}

          {/* ══ PASO 7: Género ══ */}
          {step === 7 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="Género y preferencias" />
              <Text style={st.label}>Soy:</Text>
              <View style={st.chipRow}>
                {GENDERS.map((g) => (
                  <Pressable key={g} onPress={() => setGender(g)} style={[st.chip, gender === g && st.chipActive]}>
                    <Text style={[st.chipText, gender === g && st.chipTextActive]}>{g}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={[st.label, { marginTop: spacing.lg }]}>Quiero conocer:</Text>
              <View style={st.chipRow}>
                {LOOKING_FOR.map((g) => (
                  <Pressable key={g} onPress={() => setLookingForGender(g)} style={[st.chip, lookingForGender === g && st.chipActive]}>
                    <Text style={[st.chipText, lookingForGender === g && st.chipTextActive]}>{g}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable style={st.toggleRow} onPress={() => setShowGenderOnProfile((v) => !v)}>
                <Ionicons name={showGenderOnProfile ? "checkbox" : "square-outline"} size={24} color={DS.primary} />
                <Text style={st.toggleText}>Mostrar mi género en el perfil</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* ══ PASO 8: Intereses ══ */}
          {step === 8 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="Tus intereses" subtitle={`Elige hasta 10 (${selectedInterestIds.length}/10)`} />
              {Object.entries(interestsByCategory).map(([cat, items]) => (
                <View key={cat} style={{ marginBottom: spacing.lg }}>
                  <Text style={st.catLabel}>{CAT_LABELS[cat] ?? cat}</Text>
                  <View style={st.pillsWrap}>
                    {items.map((interest) => {
                      const active = selectedInterestIds.includes(interest.id);
                      return (
                        <Pressable key={interest.id} onPress={() => toggleInterest(interest.id)}
                          style={[st.pill, active && st.pillActive]}>
                          {interest.emoji ? <Text style={st.pillEmoji}>{interest.emoji}</Text> : null}
                          <Text style={[st.pillText, active && { color: DS.primary }]}>{interest.name}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </Animated.View>
          )}

          {/* ══ PASO 9: Fotos ══ */}
          {step === 9 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="Tus fotos" subtitle="Mínimo 1, máximo 6" />
              <View style={st.photoGrid}>
                {Array.from({ length: 6 }).map((_, i) => {
                  const uri = photos[i];
                  return (
                    <View key={i} style={st.photoCell}>
                      {uri ? (
                        <Pressable style={st.photoFilled} onPress={() => removePhoto(i)}>
                          <Animated.Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                          <View style={st.photoRemoveBtn}>
                            <Ionicons name="close" size={14} color="#fff" />
                          </View>
                          {i === 0 && (
                            <View style={st.coverBadge}>
                              <Text style={st.coverBadgeText}>Portada</Text>
                            </View>
                          )}
                        </Pressable>
                      ) : (
                        <Pressable style={st.photoEmpty} onPress={pickPhoto}>
                          <Ionicons name="add" size={28} color={colors.text.tertiary} />
                        </Pressable>
                      )}
                    </View>
                  );
                })}
              </View>
              <Text style={st.hint}>📸 La primera foto es tu portada.</Text>
            </Animated.View>
          )}

          {/* ══ PASO 10: Verificación ══ */}
          {step === 10 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="Verificación de identidad" subtitle="Opcional — puedes saltarlo" />
              <View style={st.bigIconBox}>
                <Ionicons name="shield-checkmark" size={72} color={DS.primary} />
                <Text style={st.permissionTitle}>Selfie de verificación</Text>
                <Text style={st.permissionDesc}>
                  Una foto en tiempo real garantiza que EraMix está lleno de personas reales. No se publicará.
                </Text>
              </View>
              <Pressable style={st.outlineBtn}>
                <Ionicons name="camera" size={20} color={DS.primary} />
                <Text style={st.outlineBtnText}>Hacer selfie de verificación</Text>
              </Pressable>
            </Animated.View>
          )}

          {/* ══ PASO 11: Ubicación ══ */}
          {step === 11 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="Descubre tu entorno" subtitle="Encuentra Erasmus cerca de ti" />
              <View style={st.bigIconBox}>
                <View style={[st.permIconCircle, locationGranted && st.permIconCircleGranted]}>
                  <Ionicons name="location" size={48} color={locationGranted ? "#fff" : DS.primary} />
                </View>
                <Text style={st.permissionTitle}>{locationGranted ? "¡Ubicación activada! 🎉" : "Activar ubicación"}</Text>
                <Text style={st.permissionDesc}>
                  Usamos tu ubicación para mostrarte Erasmus cerca en{" "}
                  <Text style={{ color: DS.primary, fontFamily: typography.families.bodyMedium }}>{destinationCity || "tu ciudad de destino"}</Text>.
                </Text>
              </View>
              {!locationGranted && (
                <Pressable
                  style={({ pressed }) => [st.permBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
                  onPress={requestLocation}
                  disabled={locationLoading}
                >
                  <LinearGradient
                    colors={[DS.primary, DS.primary + "CC"]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={st.permBtnInner}
                  >
                    {locationLoading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <>
                        <Ionicons name="location" size={22} color="#000" />
                        <Text style={st.permBtnText}>
                          {locationDeniedPermanently ? "Abrir Ajustes" : "Permitir ubicación"}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              )}
              {locationGranted && (
                <View style={st.permGrantedBanner}>
                  <Ionicons name="checkmark-circle" size={22} color="#00D4AA" />
                  <Text style={st.permGrantedText}>Ubicación activada correctamente</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* ══ PASO 12: Notificaciones ══ */}
          {step === 12 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <StepHeader title="Mantente al día" subtitle="No te pierdas nada importante" />
              <View style={st.bigIconBox}>
                <View style={[st.permIconCircle, { borderColor: DS.secondary + "40" }, notificationsEnabled && { backgroundColor: "#00D4AA", borderColor: "#00D4AA" }]}>
                  <Ionicons name="notifications" size={48} color={notificationsEnabled ? "#fff" : DS.secondary} />
                </View>
                <Text style={st.permissionTitle}>{notificationsEnabled ? "¡Notificaciones activadas! 🎉" : "Activar notificaciones"}</Text>
                <Text style={st.permissionDesc}>
                  Recibe avisos sobre matches, mensajes, eventos y nuevos Erasmus en tu ciudad.
                </Text>
              </View>

              {!notificationsEnabled && (
                <View style={{ gap: spacing.sm }}>
                  <Pressable
                    style={({ pressed }) => [st.permBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
                    onPress={requestNotifications}
                    disabled={notifLoading}
                  >
                    <LinearGradient
                      colors={colors.gradient.accent}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={st.permBtnInner}
                    >
                      {notifLoading ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <>
                          <Ionicons name="notifications" size={22} color="#000" />
                          <Text style={st.permBtnText}>
                            {notifDeniedPermanently ? "Abrir Ajustes" : "Activar notificaciones"}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </Pressable>
                  {notifDeniedPermanently && (
                    <Pressable style={st.settingsLink} onPress={() => Linking.openSettings()}>
                      <Ionicons name="settings-outline" size={16} color={colors.text.tertiary} />
                      <Text style={st.settingsLinkText}>Ir a Ajustes del dispositivo</Text>
                    </Pressable>
                  )}
                </View>
              )}
              {notificationsEnabled && (
                <View style={st.permGrantedBanner}>
                  <Ionicons name="checkmark-circle" size={22} color="#00D4AA" />
                  <Text style={st.permGrantedText}>Notificaciones activadas correctamente</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* ══ PASO 13: ¡Todo listo! ══ */}
          {step === 13 && (
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
              <View style={st.readyBox}>
                <Text style={st.readyEmoji}>🚀</Text>
                <Text style={st.readyTitle}>¡Todo listo, {firstName || "Erasmus"}!</Text>
                <Text style={st.readySub}>
                  Bienvenido/a a EraMix.{"\n"}
                  {destinationCity ? `Hay Erasmus esperándote en ${destinationCity}.` : "Tu aventura Erasmus empieza ahora."}
                </Text>
                <View style={st.summaryBox}>
                  {homeUniversity && <SummaryRow icon="school" text={`Origen: ${homeUniversity.name}`} />}
                  {hostUniversity && <SummaryRow icon="school-outline" text={`Destino: ${hostUniversity.name}`} />}
                  {selectedLanguages.length > 0 && (
                    <SummaryRow icon="language" text={`Idiomas: ${selectedLanguages.map((l) => l.language.name).join(", ")}`} />
                  )}
                  {selectedInterestIds.length > 0 && (
                    <SummaryRow icon="heart" text={`${selectedInterestIds.length} intereses seleccionados`} />
                  )}
                  {photos.length > 0 && (
                    <SummaryRow icon="images" text={`${photos.length} foto${photos.length > 1 ? "s" : ""}`} />
                  )}
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

        {/* ── Footer con error + botón ── */}
        <View style={[st.footer, { paddingBottom: insets.bottom + spacing.md }]}>

          <Pressable
            onPress={step === TOTAL_STEPS ? handleRegister : handleNext}
            disabled={isLoading}
            style={({ pressed }) => [st.primaryBtn, pressed && { opacity: 0.85 }]}
          >
            <LinearGradient
              colors={colors.gradient.accent}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={st.primaryBtnInner}
            >
              {isLoading ? (
                <ActivityIndicator color={DS.secondary} />
              ) : (
                <>
                  <Text style={st.primaryBtnText}>
                    {step === TOTAL_STEPS ? "Empezar a explorar 🚀" : "Continuar"}
                  </Text>
                  {step !== TOTAL_STEPS && <Ionicons name="arrow-forward" size={18} color={DS.secondary} />}
                </>
              )}
            </LinearGradient>
          </Pressable>

          {(step === 5 || step === 6 || step === 7 || step === 8 || step === 10 || step === 11 || step === 12) && (
            <Pressable style={st.skipBtn} onPress={handleNext}>
              <Text style={st.skipBtnText}>Saltar por ahora</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScreenBackground>
  );
}

// ── Subcomponentes auxiliares ──────────────────────────────
function SummaryRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={st.summaryRow}>
      <Ionicons name={icon as any} size={16} color={colors.text.tertiary} style={{ marginRight: 8 }} />
      <Text style={st.summaryText} numberOfLines={1}>{text}</Text>
    </View>
  );
}

function DSInput({
  icon, label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType, autoCapitalize, rightElement, containerStyle
}: {
  icon: string; label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; secureTextEntry?: boolean; keyboardType?: any;
  autoCapitalize?: any; rightElement?: React.ReactNode; containerStyle?: any;
}) {
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

// ── StyleSheet ─────────────────────────────────────────────
const st = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: colors.glass.white, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.glass.border, alignItems: "center", justifyContent: "center" },
  progressContainer: { flex: 1, height: 6, backgroundColor: colors.background.input, borderRadius: 3, marginHorizontal: spacing.md, overflow: "hidden" },
  progressBar: { height: "100%", backgroundColor: DS.primary, borderRadius: 3 },
  stepCount: { fontFamily: typography.families.body, fontSize: 12, color: colors.text.tertiary, minWidth: 32, textAlign: "right" },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: 140 },
  stepTitle: { fontFamily: typography.families.heading, fontSize: 30, color: colors.text.primary, marginBottom: 8 },
  stepSubtitle: { fontFamily: typography.families.body, fontSize: 15, color: colors.text.secondary, lineHeight: 22 },
  errorBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.status.errorBg, padding: spacing.sm, borderRadius: radii.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.status.error + "40" },
  errorText: { color: colors.status.error, flex: 1, fontSize: 14, fontFamily: typography.families.body },
  label: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.text.secondary, marginBottom: 6 },
  inputWrap: { height: 54, backgroundColor: colors.background.input, borderRadius: radii.md, borderWidth: 1, borderColor: colors.glass.border, flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, marginBottom: spacing.md },
  inputFocused: { borderColor: DS.primary },
  inputIcon: { marginRight: 12 },
  inputText: { flex: 1, fontFamily: typography.families.body, fontSize: 16, color: colors.text.primary },
  hint: { color: colors.text.tertiary, fontSize: 13, lineHeight: 20, marginTop: spacing.sm },
  // Social buttons (step 0)
  orContainer: { flexDirection: "row", alignItems: "center", marginVertical: spacing.lg, gap: spacing.sm },
  orLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.glass.border },
  orText: { color: colors.text.tertiary, fontSize: 13 },
  socialBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.glass.white, borderWidth: 1, borderColor: colors.glass.border, borderRadius: radii.md, height: 54, gap: 10 },
  socialBtnText: { fontFamily: typography.families.bodyMedium, fontSize: 16, color: colors.text.primary },
  // Date picker (step 2 & 4)
  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 54,
    backgroundColor: colors.background.input,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  dateBtnText: { flex: 1, fontFamily: typography.families.bodyMedium, fontSize: 15, color: colors.text.primary },
  dobPreview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.sm,
    backgroundColor: DS.primary + "12",
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: DS.primary + "30",
  },
  dobPreviewText: { fontFamily: typography.families.bodyMedium, fontSize: 15, color: colors.text.primary },
  dateConfirmBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: DS.primary,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  dateConfirmBtnText: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: "#000" },
  // Country picker (step 3)
  countryPickerBox: {
    backgroundColor: colors.background.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: DS.primary,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  countryList: { maxHeight: 220 },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glass.border,
    gap: 10,
  },
  countryFlag: { fontSize: 22 },
  countryName: { flex: 1, fontFamily: typography.families.body, fontSize: 15, color: colors.text.primary },
  // Universidad
  selectedUniBox: { flexDirection: "row", alignItems: "center", backgroundColor: DS.primary + "15", borderWidth: 1, borderColor: DS.primary, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.md },
  selectedUniName: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.text.primary },
  selectedUniSub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  dropdown: { backgroundColor: colors.background.card, borderRadius: radii.md, borderWidth: 1, borderColor: colors.glass.border, marginBottom: spacing.md, overflow: "hidden" },
  dropdownItem: { padding: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.glass.border },
  dropdownItemName: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.text.primary },
  dropdownItemSub: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  // Intenciones
  selectionItem: { flexDirection: "row", alignItems: "center", padding: spacing.md, backgroundColor: colors.background.card, borderRadius: radii.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.glass.border },
  selectionItemActive: { borderColor: DS.primary, backgroundColor: DS.primary + "12" },
  selectionEmoji: { fontSize: 22, marginRight: spacing.md },
  selectionText: { flex: 1, fontFamily: typography.families.bodyMedium, fontSize: 15, color: colors.text.primary },
  // Idiomas
  langEntry: { flexDirection: "row", alignItems: "center", backgroundColor: colors.background.card, borderRadius: radii.md, padding: spacing.md, borderWidth: 1, borderColor: DS.primary + "40", marginBottom: spacing.sm },
  langEntryName: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.text.primary },
  langEntryLevel: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  pendingLangBox: { backgroundColor: colors.background.card, borderRadius: radii.md, borderWidth: 1, borderColor: DS.primary, padding: spacing.md, marginBottom: spacing.md },
  pendingLangName: { fontFamily: typography.families.subheading, fontSize: 16, color: colors.text.primary, marginBottom: spacing.md },
  levelRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.md },
  levelChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii.full, backgroundColor: colors.background.input, borderWidth: 1, borderColor: colors.glass.border },
  levelChipActive: { borderColor: DS.primary, backgroundColor: DS.primary + "15" },
  levelChipText: { fontSize: 13, color: colors.text.secondary },
  pendingBtns: { flexDirection: "row", gap: spacing.sm },
  cancelBtn: { flex: 1, height: 44, borderRadius: radii.md, borderWidth: 1, borderColor: colors.glass.border, alignItems: "center", justifyContent: "center" },
  cancelBtnText: { color: colors.text.secondary, fontFamily: typography.families.bodyMedium },
  addBtn: { flex: 1, height: 44, borderRadius: radii.md, backgroundColor: DS.primary, alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#000", fontFamily: typography.families.bodyMedium },
  addLangBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: DS.primary, borderRadius: radii.md, borderStyle: "dashed", height: 48, gap: 8, marginTop: spacing.sm },
  addLangBtnText: { color: DS.primary, fontFamily: typography.families.bodyMedium },
  // Género
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.sm },
  chip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: radii.full, backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.glass.border },
  chipActive: { backgroundColor: DS.primary, borderColor: DS.primary },
  chipText: { fontFamily: typography.families.bodyMedium, color: colors.text.primary },
  chipTextActive: { color: colors.background.main },
  toggleRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.lg, gap: spacing.sm },
  toggleText: { fontFamily: typography.families.body, fontSize: 15, color: colors.text.primary },
  // Intereses
  catLabel: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.text.secondary, marginBottom: spacing.sm },
  pillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: radii.full, backgroundColor: colors.background.input, borderWidth: 1, borderColor: colors.glass.border, gap: 4 },
  pillActive: { backgroundColor: DS.primary + "20", borderColor: DS.primary },
  pillEmoji: { fontSize: 14 },
  pillText: { color: colors.text.secondary, fontSize: 13 },
  // Fotos
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photoCell: { width: (width - spacing.xl * 2 - 16) / 3, aspectRatio: 0.8 },
  photoEmpty: { flex: 1, backgroundColor: colors.background.input, borderRadius: radii.md, borderWidth: 1, borderColor: colors.glass.border, borderStyle: "dashed", alignItems: "center", justifyContent: "center" },
  photoFilled: { flex: 1, borderRadius: radii.md, overflow: "hidden", backgroundColor: colors.background.input },
  photoRemoveBtn: { position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  coverBadge: { position: "absolute", bottom: 4, left: 4, backgroundColor: DS.primary, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  coverBadgeText: { fontSize: 10, fontFamily: typography.families.bodyMedium, color: "#000" },
  // Permisos
  bigIconBox: { alignItems: "center", paddingVertical: spacing.xl },
  permIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: DS.primary + "15", borderWidth: 2, borderColor: DS.primary + "40",
    alignItems: "center", justifyContent: "center", marginBottom: spacing.sm,
  },
  permIconCircleGranted: { backgroundColor: "#00D4AA", borderColor: "#00D4AA" },
  permissionTitle: { fontFamily: typography.families.subheading, fontSize: 22, color: colors.text.primary, marginTop: spacing.md, textAlign: "center" },
  permissionDesc: { fontFamily: typography.families.body, fontSize: 15, color: colors.text.secondary, textAlign: "center", lineHeight: 22, marginTop: spacing.sm, marginHorizontal: spacing.md, marginBottom: spacing.md },
  permBtn: { borderRadius: radii.md, overflow: "hidden" },
  permBtnInner: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: radii.md },
  permBtnText: { fontFamily: typography.families.bodyMedium, fontSize: 17, color: "#000", fontWeight: "600" },
  permGrantedBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    backgroundColor: "#00D4AA" + "15", borderRadius: radii.md,
    borderWidth: 1, borderColor: "#00D4AA" + "40", marginTop: spacing.md,
  },
  permGrantedText: { fontFamily: typography.families.bodyMedium, fontSize: 15, color: "#00D4AA" },
  settingsLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: spacing.sm },
  settingsLinkText: { fontFamily: typography.families.body, fontSize: 14, color: colors.text.tertiary, textDecorationLine: "underline" },
  outlineBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 52, borderRadius: radii.md, borderWidth: 1, borderColor: DS.primary, gap: 8 },
  outlineBtnText: { fontFamily: typography.families.bodyMedium, fontSize: 16, color: DS.primary },
  // Ready
  readyBox: { alignItems: "center", paddingTop: spacing.lg },
  readyEmoji: { fontSize: 80 },
  readyTitle: { fontFamily: typography.families.heading, fontSize: 28, color: colors.text.primary, textAlign: "center", marginTop: spacing.lg },
  readySub: { fontFamily: typography.families.body, fontSize: 16, color: colors.text.secondary, textAlign: "center", lineHeight: 24, marginTop: spacing.sm },
  summaryBox: { width: "100%", marginTop: spacing.xl, backgroundColor: colors.background.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.glass.border, overflow: "hidden" },
  summaryRow: { flexDirection: "row", alignItems: "center", padding: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.glass.border },
  summaryText: { flex: 1, fontFamily: typography.families.body, fontSize: 14, color: colors.text.secondary },
  // Footer
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.glass.border, backgroundColor: colors.background.main },
  primaryBtn: { borderRadius: radii.md, overflow: "hidden" },
  primaryBtnInner: { height: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  primaryBtnText: { fontFamily: typography.families.bodyMedium, fontSize: 17, color: DS.secondary, fontWeight: "600" },
  skipBtn: { alignItems: "center", paddingVertical: spacing.md },
  skipBtnText: { fontFamily: typography.families.body, fontSize: 14, color: colors.text.tertiary },
});
