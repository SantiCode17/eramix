/**
 * CreateEventScreen — Eramix
 * Diseño European Glass con hero visual, floaty submit y categorías premium.
 */
import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Switch,
  Dimensions,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { apiClient } from "@/api/client";
import * as eventsApi from "@/api/events";

const { width: SCREEN_W } = Dimensions.get("window");

const CATEGORIES = [
  { id: "PARTY",    label: "Fiesta",      icon: "🎉", color: "#FF6B6B" },
  { id: "CULTURE",  label: "Cultura",     icon: "🎭", color: "#9B59B6" },
  { id: "SPORTS",   label: "Deporte",     icon: "⚽", color: "#27AE60" },
  { id: "ACADEMIC", label: "Académico",   icon: "📚", color: "#2980B9" },
  { id: "TRIP",     label: "Viaje",       icon: "✈️", color: "#16A085" },
  { id: "FOOD",     label: "Gastronomía", icon: "🍽️", color: "#E67E22" },
];

function fmtDate(d: Date): string {
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}
function fmtTime(d: Date): string {
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

async function uploadMedia(uri: string): Promise<string> {
  const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
  const form = new FormData();
  form.append("file", { uri, name: `cover.${ext}`, type: ext === "png" ? "image/png" : "image/jpeg" } as any);
  const res = await apiClient.post<{ data: string }>("/v1/media/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

function SectionLabel({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={s.sectionLabelRow}>
      <View style={s.sectionLabelIcon}>
        <Ionicons name={icon} size={13} color={colors.eu.star} />
      </View>
      <Text style={s.sectionTitle}>{label}</Text>
    </View>
  );
}

function InputField({
  icon, placeholder, value, onChangeText, multiline, keyboardType, maxLength, charCount,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  keyboardType?: any;
  maxLength?: number;
  charCount?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[s.inputRow, focused && s.inputRowFocused]}>
      <View style={[s.inputIconBox, focused && s.inputIconBoxFocused]}>
        <Ionicons name={icon} size={16} color={focused ? colors.eu.star : "rgba(255,255,255,0.35)"} />
      </View>
      <TextInput
        style={[s.input, multiline && { minHeight: 80 }]}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.25)"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType={multiline ? "default" : "next"}
      />
      {charCount && maxLength && value.length > 0 && (
        <Text style={s.charCount}>{value.length}/{maxLength}</Text>
      )}
    </View>
  );
}

export default function CreateEventScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // Hide bottom tab bar while in this screen
  useLayoutEffect(() => {
    const parent = navigation.getParent?.();
    parent?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      parent?.setOptions({
        tabBarStyle: {
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "rgba(4,6,26,0.92)",
          borderTopWidth: 0,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 0, shadowOpacity: 0,
        },
      });
    };
  }, [navigation, insets.bottom]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [maxParticipants, setMaxParticipants] = useState("");

  const [startDate, setStartDate] = useState<Date>(() => {
    const d = new Date(); d.setHours(d.getHours() + 2, 0, 0, 0); return d;
  });
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [pickerMode, setPickerMode] = useState<"startDate" | "startTime" | "endDate" | "endTime" | null>(null);
  const [iosTempDate, setIosTempDate] = useState<Date>(new Date());

  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim().length >= 3 && location.trim().length >= 2 && !submitting;

  const handlePickCover = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });
      if (!res.canceled && res.assets[0]?.uri) setCoverUri(res.assets[0].uri);
    } catch {}
  };

  const openPicker = (mode: typeof pickerMode) => {
    Haptics.selectionAsync();
    const base = (mode === "endDate" || mode === "endTime")
      ? (endDate ?? new Date(startDate.getTime() + 3600000))
      : startDate;
    setIosTempDate(base);
    setPickerMode(mode);
  };

  const handlePickerChange = (_: any, date?: Date) => {
    if (!date) { if (Platform.OS === "android") setPickerMode(null); return; }
    if (Platform.OS === "android") { applyDate(date); }
    else { setIosTempDate(date); }
  };

  const applyDate = (date: Date) => {
    if (pickerMode === "startDate" || pickerMode === "startTime") {
      const next = new Date(startDate);
      if (pickerMode === "startDate") { next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate()); }
      else { next.setHours(date.getHours(), date.getMinutes()); }
      setStartDate(next);
    } else if (pickerMode === "endDate" || pickerMode === "endTime") {
      const base = endDate ?? new Date(startDate.getTime() + 3600000);
      const next = new Date(base);
      if (pickerMode === "endDate") { next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate()); }
      else { next.setHours(date.getHours(), date.getMinutes()); }
      setEndDate(next);
    }
    if (Platform.OS === "android") setPickerMode(null);
  };

  const confirmIos = () => { applyDate(iosTempDate); setPickerMode(null); };

  const handleCreate = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    try {
      let coverImageUrl: string | undefined;
      if (coverUri) {
        try { coverImageUrl = await uploadMedia(coverUri); } catch {}
      }
      const payload: Parameters<typeof eventsApi.createEvent>[0] = {
        title: title.trim(),
        description: description.trim() || undefined,
        location: location.trim(),
        category: category ?? undefined,
        startDatetime: startDate.toISOString(),
        endDatetime: endDate?.toISOString(),
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        isPublic,
        coverImageUrl,
      };
      const newEv = await eventsApi.createEvent(payload);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
      setTimeout(() => navigation.navigate("EventDetail", { eventId: newEv.id }), 100);
    } catch (e: any) {
      Alert.alert("Error al crear", e?.response?.data?.message ?? "Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={s.root}>
      <LinearGradient colors={[DS.background, "#0E1A35", "#0A0A1E"]} style={StyleSheet.absoluteFill} />

      {/* Header glass */}
      <View style={[s.header, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={({ pressed }) => [s.headerBtn, pressed && { opacity: 0.6 }]}>
          <BlurView intensity={20} tint="dark" style={s.headerBtnBlur}>
            <Ionicons name="close" size={20} color={colors.text.primary} />
          </BlurView>
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Nuevo Evento</Text>
          {category && (
            <View style={s.headerCatBadge}>
              <Text style={s.headerCatText}>
                {CATEGORIES.find(c => c.id === category)?.icon} {CATEGORIES.find(c => c.id === category)?.label}
              </Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 120 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* HERO portada */}
          <Pressable onPress={handlePickCover} style={s.heroWrap}>
            {coverUri ? (
              <>
                <Image source={{ uri: coverUri }} style={s.heroImage} />
                <LinearGradient
                  colors={["transparent", "rgba(10,10,30,0.85)"]}
                  style={s.heroOverlay}
                />
                <View style={s.heroEditChip}>
                  <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
                  <Ionicons name="camera" size={13} color={colors.eu.star} />
                  <Text style={s.heroEditText}>Cambiar portada</Text>
                </View>
              </>
            ) : (
              <LinearGradient
                colors={["rgba(255,107,43,0.15)", "rgba(0,51,153,0.25)", "rgba(10,10,30,0.8)"]}
                style={s.heroPlaceholder}
              >
                <View style={s.heroCamCircle}>
                  <LinearGradient colors={["rgba(255,215,0,0.2)", "rgba(255,107,43,0.15)"]} style={StyleSheet.absoluteFill} />
                  <Ionicons name="camera-outline" size={30} color={colors.eu.star} />
                </View>
                <Text style={s.heroPlaceholderTitle}>Añadir portada</Text>
                <Text style={s.heroPlaceholderSub}>16:9 · JPG / PNG · Hasta 10 MB</Text>
              </LinearGradient>
            )}
          </Pressable>

          {/* Ficha de info */}
          <View style={s.section}>
            <SectionLabel icon="information-circle-outline" label="INFORMACIÓN BÁSICA" />
            <View style={s.card}>
              <InputField
                icon="text-outline"
                placeholder="Título del evento *"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                charCount
              />
              <View style={s.cardDivider} />
              <InputField
                icon="document-text-outline"
                placeholder="Descripción (opcional)"
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={1000}
              />
              <View style={s.cardDivider} />
              <InputField
                icon="location-outline"
                placeholder="Lugar del evento *"
                value={location}
                onChangeText={setLocation}
                maxLength={200}
              />
            </View>
          </View>

          {/* Categoría — tarjetas visuales */}
          <View style={s.section}>
            <SectionLabel icon="grid-outline" label="CATEGORÍA" />
            <View style={s.catGrid}>
              {CATEGORIES.map((cat) => {
                const active = category === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => { Haptics.selectionAsync(); setCategory(active ? null : cat.id); }}
                    style={[s.catCard, active && { borderColor: cat.color, borderWidth: 2, backgroundColor: `${cat.color}18` }]}
                  >
                    {active && (
                      <LinearGradient
                        colors={[`${cat.color}22`, `${cat.color}08`]}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text style={s.catEmoji}>{cat.icon}</Text>
                    <Text style={[s.catLabel, active && { color: cat.color }]}>{cat.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Fechas */}
          <View style={s.section}>
            <SectionLabel icon="calendar-outline" label="FECHA Y HORA" />
            <View style={s.card}>
              {/* Inicio — fecha */}
              <Pressable onPress={() => openPicker("startDate")} style={s.dateRow}>
                <View style={s.dateIconBox}>
                  <LinearGradient colors={["rgba(255,215,0,0.2)", "rgba(255,215,0,0.05)"]} style={StyleSheet.absoluteFill} />
                  <Ionicons name="calendar" size={16} color={colors.eu.star} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.dateLabel}>Fecha de inicio *</Text>
                  <Text style={s.dateValue}>{fmtDate(startDate)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.25)" />
              </Pressable>
              <View style={s.cardDivider} />
              {/* Inicio — hora */}
              <Pressable onPress={() => openPicker("startTime")} style={s.dateRow}>
                <View style={s.dateIconBox}>
                  <LinearGradient colors={["rgba(255,215,0,0.12)", "rgba(255,215,0,0.03)"]} style={StyleSheet.absoluteFill} />
                  <Ionicons name="time-outline" size={16} color={colors.eu.star} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.dateLabel}>Hora de inicio *</Text>
                  <Text style={s.dateValue}>{fmtTime(startDate)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.25)" />
              </Pressable>
              <View style={s.cardDivider} />
              {/* Fin — fecha */}
              <Pressable onPress={() => openPicker("endDate")} style={s.dateRow}>
                <View style={[s.dateIconBox, { opacity: 0.6 }]}>
                  <Ionicons name="flag" size={16} color="rgba(255,255,255,0.5)" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.dateLabel}>Fecha de fin (opcional)</Text>
                  <Text style={[s.dateValue, !endDate && { color: "rgba(255,255,255,0.28)" }]}>
                    {endDate ? fmtDate(endDate) : "Sin fecha de fin"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.25)" />
              </Pressable>
              <View style={s.cardDivider} />
              {/* Fin — hora */}
              <Pressable onPress={() => openPicker("endTime")} style={s.dateRow}>
                <View style={[s.dateIconBox, { opacity: 0.6 }]}>
                  <Ionicons name="time-outline" size={16} color="rgba(255,255,255,0.5)" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.dateLabel}>Hora de fin (opcional)</Text>
                  <Text style={[s.dateValue, !endDate && { color: "rgba(255,255,255,0.28)" }]}>
                    {endDate ? fmtTime(endDate) : "Sin hora de fin"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.25)" />
              </Pressable>
            </View>
          </View>

          {/* Opciones */}
          <View style={s.section}>
            <SectionLabel icon="options-outline" label="OPCIONES" />
            <View style={s.card}>
              <View style={s.optionRow}>
                <View style={s.optionIconBox}>
                  <Ionicons name="people-outline" size={16} color="rgba(255,255,255,0.5)" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.optionLabel}>Máx. participantes</Text>
                  <TextInput
                    style={s.optionInput}
                    placeholder="Sin límite"
                    placeholderTextColor="rgba(255,255,255,0.22)"
                    value={maxParticipants}
                    onChangeText={(v) => setMaxParticipants(v.replace(/[^0-9]/g, ""))}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
              <View style={s.cardDivider} />
              <View style={s.optionRow}>
                <View style={[s.optionIconBox, isPublic && { backgroundColor: "rgba(255,215,0,0.1)" }]}>
                  <Ionicons
                    name={isPublic ? "globe-outline" : "lock-closed-outline"}
                    size={16}
                    color={isPublic ? colors.eu.star : "rgba(255,255,255,0.5)"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.optionLabel}>{isPublic ? "Evento público" : "Evento privado"}</Text>
                  <Text style={s.optionSub}>{isPublic ? "Cualquiera puede verlo y unirse" : "Solo por invitación"}</Text>
                </View>
                <Switch
                  value={isPublic}
                  onValueChange={(v) => { Haptics.selectionAsync(); setIsPublic(v); }}
                  trackColor={{ true: colors.eu.star, false: "rgba(255,255,255,0.1)" }}
                  thumbColor="#FFF"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating submit button */}
      <View style={[s.floatFooter, { paddingBottom: insets.bottom + spacing.md }]}>
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={s.floatFooterBorder} />
        <Pressable
          onPress={handleCreate}
          disabled={!canSubmit}
          style={({ pressed }) => [s.submitBtn, !canSubmit && s.submitBtnDisabled, pressed && { opacity: 0.85 }]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <>
              <LinearGradient
                colors={canSubmit ? ["#FFE566", "#D4AF37"] : ["rgba(255,215,0,0.3)", "rgba(255,215,0,0.15)"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="sparkles" size={18} color={canSubmit ? "#000" : "rgba(255,255,255,0.4)"} />
              <Text style={[s.submitBtnText, !canSubmit && { color: "rgba(255,255,255,0.4)" }]}>
                Crear evento
              </Text>
            </>
          )}
        </Pressable>
        {!canSubmit && (
          <Text style={s.submitHint}>
            {!title.trim() ? "Añade un título" : !location.trim() ? "Añade el lugar" : ""}
          </Text>
        )}
      </View>

      {/* Date Picker — Modal dropdown inline */}
      {pickerMode !== null && (
        <Modal
          transparent
          animationType="fade"
          visible={pickerMode !== null}
          onRequestClose={() => setPickerMode(null)}
        >
          <Pressable style={s.iosPickerOverlay} onPress={() => setPickerMode(null)}>
            <Pressable style={s.iosPickerSheet} onPress={(e) => e.stopPropagation()}>
              <LinearGradient colors={["#1A253D", "#0D1525"]} style={StyleSheet.absoluteFill} borderRadius={radii.xl} />
              <View style={s.iosPickerHandle} />
              <View style={s.iosPickerHeader}>
                <Pressable onPress={() => setPickerMode(null)} hitSlop={8}>
                  <Text style={s.iosPickerCancel}>Cancelar</Text>
                </Pressable>
                <Text style={s.iosPickerTitle}>
                  {pickerMode === "startDate" ? "Fecha de inicio" : pickerMode === "startTime" ? "Hora de inicio" : pickerMode === "endDate" ? "Fecha de fin" : "Hora de fin"}
                </Text>
                <Pressable onPress={confirmIos} hitSlop={8}>
                  <Text style={s.iosPickerConfirm}>Listo</Text>
                </Pressable>
              </View>
              {/* Calendar centered / spinner for time — no toggle tabs */}
              <View style={pickerMode?.includes("Date") ? s.iosPickerCalendarWrap : s.iosPickerSpinnerWrap}>
                <DateTimePicker
                  value={iosTempDate}
                  mode={pickerMode?.includes("Date") ? "date" : "time"}
                  display={
                    Platform.OS === "ios"
                      ? (pickerMode?.includes("Date") ? "inline" : "spinner")
                      : "spinner"
                  }
                  onChange={handlePickerChange}
                  textColor="#FFF"
                  locale="es-ES"
                  accentColor={colors.eu.star}
                  style={{ backgroundColor: "transparent" }}
                  minimumDate={
                    pickerMode === "startDate" || pickerMode === "startTime"
                      ? new Date()
                      : undefined
                  }
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.background },

  // ─── Header ───
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerBtnBlur: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  headerCenter: { flex: 1, alignItems: "center", gap: 4 },
  headerTitle: { fontFamily: typography.families.heading, fontSize: 17, color: colors.text.primary },
  headerCatBadge: {
    backgroundColor: "rgba(255,215,0,0.12)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.25)",
  },
  headerCatText: { fontFamily: typography.families.body, fontSize: 11, color: colors.eu.star },

  // ─── Hero portada ───
  heroWrap: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    height: 210,
    borderRadius: radii.xl + 4,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.09)",
  },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroEditChip: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.3)",
  },
  heroEditText: { fontFamily: typography.families.bodyMedium, fontSize: 12, color: colors.eu.star },
  heroPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  heroCamCircle: {
    width: 70, height: 70, borderRadius: 35,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.25)",
    marginBottom: spacing.xs,
  },
  heroPlaceholderTitle: { fontFamily: typography.families.subheading, fontSize: 16, color: colors.text.primary },
  heroPlaceholderSub: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.35)" },

  // ─── Sections ───
  scroll: { gap: 0 },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionLabelRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm },
  sectionLabelIcon: {
    width: 22, height: 22, borderRadius: 7,
    backgroundColor: "rgba(255,215,0,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1.4,
  },

  // ─── Card / Inputs ───
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.08)", marginLeft: 52 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
    minHeight: 56,
  },
  inputRowFocused: {
    backgroundColor: "rgba(255,215,0,0.04)",
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255,215,0,0.4)",
  },
  inputIconBox: {
    width: 34,
    height: 34,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  inputIconBoxFocused: {
    backgroundColor: "rgba(255,215,0,0.1)",
  },
  input: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
    textAlignVertical: "top",
  },
  charCount: { fontFamily: typography.families.body, fontSize: 11, color: "rgba(255,255,255,0.25)" },

  // ─── Categorías visuales ───
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  catCard: {
    width: (SCREEN_W - spacing.lg * 2 - spacing.sm * 2) / 3,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    gap: 5,
    overflow: "hidden",
    position: "relative",
  },
  catEmoji: { fontSize: 22 },
  catLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  catCheckDot: {
    position: "absolute", top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },

  // ─── Fechas ───
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  dateIconBox: {
    width: 36, height: 36, borderRadius: radii.md,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  dateLabel: { fontFamily: typography.families.body, fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 3 },
  dateValue: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.text.primary },

  // ─── Opciones ───
  optionRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.md },
  optionIconBox: {
    width: 36, height: 36, borderRadius: radii.md,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  optionLabel: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.text.primary },
  optionSub: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 },
  optionInput: { fontFamily: typography.families.body, fontSize: 14, color: colors.text.primary, marginTop: 2 },

  // ─── Floating footer ───
  floatFooter: {
    position: "absolute",
    bottom: 0,
    left: 0, right: 0,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    overflow: "hidden",
    alignItems: "center",
    gap: spacing.xs,
  },
  floatFooterBorder: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  submitBtn: {
    width: "100%",
    height: 52,
    borderRadius: radii.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.3)",
  },
  submitBtnDisabled: { borderColor: "rgba(255,255,255,0.08)" },
  submitBtnText: { fontFamily: typography.families.subheading, fontSize: 16, color: "#000" },
  submitHint: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.35)" },

  // ─── iOS picker ───
  iosPickerOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" },
  iosPickerSheet: { borderTopLeftRadius: radii.xl + 4, borderTopRightRadius: radii.xl + 4, overflow: "hidden", paddingBottom: 24 },
  iosPickerHandle: { width: 36, height: 4, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 4 },
  iosPickerHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.08)",
  },
  iosPickerTitle: { fontFamily: typography.families.subheading, fontSize: 15, color: colors.text.primary },
  iosPickerCancel: { fontFamily: typography.families.body, fontSize: 15, color: "rgba(255,255,255,0.5)" },
  iosPickerConfirm: { fontFamily: typography.families.subheading, fontSize: 15, color: colors.eu.star },
  iosToggleRow: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, paddingBottom: spacing.md, paddingTop: spacing.sm },
  iosToggle: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radii.full, backgroundColor: "rgba(255,255,255,0.06)" },
  iosToggleActive: { backgroundColor: "rgba(255,215,0,0.15)", borderWidth: 1, borderColor: colors.eu.star },
  iosToggleText: { fontFamily: typography.families.body, fontSize: 13, color: "rgba(255,255,255,0.5)" },
  iosToggleTextActive: { color: colors.eu.star, fontFamily: typography.families.bodyMedium },
  // ─── Picker wrappers ───
  iosPickerCalendarWrap: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
  },
  iosPickerSpinnerWrap: {
    alignItems: "center",
    width: "100%",
    paddingBottom: spacing.md,
  },
});
