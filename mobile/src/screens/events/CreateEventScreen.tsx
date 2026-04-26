/**
 * CreateEventScreen — Eramix
 * Diseño profesional, sin animaciones artificiales.
 * Imagen de portada 2-step upload → JSON submit.
 */
import React, { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { colors, typography, spacing, radii, DS, borders } from "@/design-system/tokens";
import { apiClient } from "@/api/client";
import * as eventsApi from "@/api/events";

const CATEGORIES = [
  { id: "PARTY",    label: "Fiesta",      icon: "🎉" },
  { id: "CULTURE",  label: "Cultura",     icon: "🎭" },
  { id: "SPORTS",   label: "Deporte",     icon: "⚽" },
  { id: "ACADEMIC", label: "Académico",   icon: "📚" },
  { id: "TRIP",     label: "Viaje",       icon: "✈️" },
  { id: "FOOD",     label: "Gastronomía", icon: "🍽️" },
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

function SectionTitle({ label }: { label: string }) {
  return <Text style={s.sectionTitle}>{label}</Text>;
}

function InputField({
  icon, placeholder, value, onChangeText, multiline, keyboardType, maxLength,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
  keyboardType?: any;
  maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[s.inputRow, focused && s.inputRowFocused]}>
      <Ionicons name={icon} size={18} color={focused ? colors.eu.star : "rgba(255,255,255,0.3)"} style={s.inputIcon} />
      <TextInput
        style={[s.input, multiline && { minHeight: 72 }]}
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
    </View>
  );
}

export default function CreateEventScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

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

      <View style={[s.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={({ pressed }) => [s.headerBtn, pressed && { opacity: 0.6 }]}>
          <Ionicons name="close" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>Nuevo Evento</Text>
        <Pressable
          onPress={handleCreate}
          disabled={!canSubmit}
          style={({ pressed }) => [s.createBtn, !canSubmit && s.createBtnDisabled, pressed && { opacity: 0.8 }]}
        >
          {submitting
            ? <ActivityIndicator size="small" color="#000" />
            : <Text style={s.createBtnText}>Crear</Text>
          }
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 60 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Portada */}
          <Pressable onPress={handlePickCover} style={s.coverWrap}>
            {coverUri ? (
              <Image source={{ uri: coverUri }} style={s.coverImage} />
            ) : (
              <LinearGradient colors={["rgba(255,215,0,0.08)", "rgba(59,107,255,0.12)", "rgba(10,10,30,0.6)"]} style={s.coverPlaceholder}>
                <View style={s.coverIconCircle}>
                  <Ionicons name="image-outline" size={28} color={colors.eu.star} />
                </View>
                <Text style={s.coverPlaceholderText}>Añadir imagen de portada</Text>
                <Text style={s.coverPlaceholderSub}>Recomendado 16:9 · Hasta 10 MB</Text>
              </LinearGradient>
            )}
            {coverUri && (
              <View style={s.coverEditBadge}>
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
                <Ionicons name="pencil" size={14} color="#FFF" />
              </View>
            )}
          </Pressable>

          {/* Info básica */}
          <View style={s.section}>
            <SectionTitle label="INFORMACIÓN BÁSICA" />
            <View style={s.card}>
              <InputField icon="text-outline" placeholder="Título del evento *" value={title} onChangeText={setTitle} maxLength={100} />
              <View style={s.cardDivider} />
              <InputField icon="document-text-outline" placeholder="Descripción (opcional)" value={description} onChangeText={setDescription} multiline maxLength={1000} />
              <View style={s.cardDivider} />
              <InputField icon="location-outline" placeholder="Lugar del evento *" value={location} onChangeText={setLocation} maxLength={200} />
            </View>
          </View>

          {/* Categoría */}
          <View style={s.section}>
            <SectionTitle label="CATEGORÍA" />
            <View style={s.chipGrid}>
              {CATEGORIES.map((cat) => {
                const active = category === cat.id;
                return (
                  <Pressable key={cat.id} onPress={() => { Haptics.selectionAsync(); setCategory(active ? null : cat.id); }} style={[s.chip, active && s.chipActive]}>
                    <Text style={s.chipEmoji}>{cat.icon}</Text>
                    <Text style={[s.chipLabel, active && s.chipLabelActive]}>{cat.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Fechas */}
          <View style={s.section}>
            <SectionTitle label="FECHAS Y HORA" />
            <View style={s.card}>
              <Pressable onPress={() => openPicker("startDate")} style={s.dateRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.eu.star} style={s.inputIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={s.dateLabel}>Inicio *</Text>
                  <Text style={s.dateValue}>{fmtDate(startDate)} · {fmtTime(startDate)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
              </Pressable>
              <View style={s.cardDivider} />
              <Pressable onPress={() => openPicker("endDate")} style={s.dateRow}>
                <Ionicons name="flag-outline" size={18} color="rgba(255,255,255,0.4)" style={s.inputIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={s.dateLabel}>Fin (opcional)</Text>
                  <Text style={[s.dateValue, !endDate && { color: "rgba(255,255,255,0.3)" }]}>
                    {endDate ? `${fmtDate(endDate)} · ${fmtTime(endDate)}` : "Sin hora de fin"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
              </Pressable>
            </View>
          </View>

          {/* Opciones */}
          <View style={s.section}>
            <SectionTitle label="OPCIONES" />
            <View style={s.card}>
              <View style={s.optionRow}>
                <Ionicons name="people-outline" size={18} color="rgba(255,255,255,0.4)" style={s.inputIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={s.optionLabel}>Máx. participantes</Text>
                  <TextInput
                    style={s.optionInput}
                    placeholder="Sin límite"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    value={maxParticipants}
                    onChangeText={(v) => setMaxParticipants(v.replace(/[^0-9]/g, ""))}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              </View>
              <View style={s.cardDivider} />
              <View style={s.optionRow}>
                <Ionicons name={isPublic ? "globe-outline" : "lock-closed-outline"} size={18} color="rgba(255,255,255,0.4)" style={s.inputIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={s.optionLabel}>{isPublic ? "Evento público" : "Evento privado"}</Text>
                  <Text style={s.optionSub}>{isPublic ? "Cualquier usuario puede verlo" : "Solo por invitación"}</Text>
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

      {/* Date Picker */}
      {pickerMode !== null && (
        Platform.OS === "ios" ? (
          <View style={s.iosPickerOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setPickerMode(null)} />
            <View style={s.iosPickerSheet}>
              <LinearGradient colors={["#131B2A", "#0B101A"]} style={StyleSheet.absoluteFill} />
              <View style={s.iosPickerHeader}>
                <Pressable onPress={() => setPickerMode(null)}>
                  <Text style={s.iosPickerCancel}>Cancelar</Text>
                </Pressable>
                <Text style={s.iosPickerTitle}>
                  {pickerMode === "startDate" ? "Fecha de inicio" : pickerMode === "startTime" ? "Hora de inicio" : pickerMode === "endDate" ? "Fecha de fin" : "Hora de fin"}
                </Text>
                <Pressable onPress={confirmIos}>
                  <Text style={s.iosPickerConfirm}>Listo</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={iosTempDate}
                mode={pickerMode.includes("Date") ? "date" : "time"}
                display="spinner"
                onChange={handlePickerChange}
                textColor="#FFF"
                locale="es-ES"
                style={{ backgroundColor: "transparent" }}
              />
              <View style={s.iosToggleRow}>
                {(pickerMode === "startDate" || pickerMode === "startTime") && (
                  <>
                    <Pressable onPress={() => { applyDate(iosTempDate); setIosTempDate(startDate); setPickerMode("startDate"); }} style={[s.iosToggle, pickerMode === "startDate" && s.iosToggleActive]}>
                      <Text style={[s.iosToggleText, pickerMode === "startDate" && s.iosToggleTextActive]}>Fecha</Text>
                    </Pressable>
                    <Pressable onPress={() => { applyDate(iosTempDate); setIosTempDate(startDate); setPickerMode("startTime"); }} style={[s.iosToggle, pickerMode === "startTime" && s.iosToggleActive]}>
                      <Text style={[s.iosToggleText, pickerMode === "startTime" && s.iosToggleTextActive]}>Hora</Text>
                    </Pressable>
                  </>
                )}
                {(pickerMode === "endDate" || pickerMode === "endTime") && (
                  <>
                    <Pressable onPress={() => { applyDate(iosTempDate); const b = endDate ?? new Date(startDate.getTime() + 3600000); setIosTempDate(b); setPickerMode("endDate"); }} style={[s.iosToggle, pickerMode === "endDate" && s.iosToggleActive]}>
                      <Text style={[s.iosToggleText, pickerMode === "endDate" && s.iosToggleTextActive]}>Fecha</Text>
                    </Pressable>
                    <Pressable onPress={() => { applyDate(iosTempDate); const b = endDate ?? new Date(startDate.getTime() + 3600000); setIosTempDate(b); setPickerMode("endTime"); }} style={[s.iosToggle, pickerMode === "endTime" && s.iosToggleActive]}>
                      <Text style={[s.iosToggleText, pickerMode === "endTime" && s.iosToggleTextActive]}>Hora</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          </View>
        ) : (
          <DateTimePicker
            value={iosTempDate}
            mode={pickerMode.includes("Date") ? "date" : "time"}
            display="default"
            onChange={handlePickerChange}
          />
        )
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerBtn: { width: 40, alignItems: "center" },
  headerTitle: { fontFamily: typography.families.heading, fontSize: 18, color: colors.text.primary },
  createBtn: {
    backgroundColor: colors.eu.star,
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    minWidth: 72,
    alignItems: "center",
  },
  createBtnDisabled: { backgroundColor: "rgba(255,215,0,0.25)" },
  createBtnText: { fontFamily: typography.families.subheading, fontSize: 14, color: "#000" },

  scroll: { gap: 0 },
  section: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.06)", marginLeft: 50 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  inputRowFocused: { backgroundColor: "rgba(255,215,0,0.03)" },
  inputIcon: { width: 22, textAlign: "center" },
  input: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: spacing.xs,
    textAlignVertical: "top",
  },

  coverWrap: {
    margin: spacing.lg,
    borderRadius: radii.xl,
    overflow: "hidden",
    height: 180,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  coverImage: { width: "100%", height: "100%", resizeMode: "cover" },
  coverPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.xs },
  coverIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(255,215,0,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.2)",
    alignItems: "center", justifyContent: "center",
    marginBottom: spacing.xs,
  },
  coverPlaceholderText: { fontFamily: typography.families.bodyMedium, fontSize: 15, color: colors.text.primary },
  coverPlaceholderSub: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.35)" },
  coverEditBadge: {
    position: "absolute", bottom: spacing.sm, right: spacing.sm,
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.2)",
  },

  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipActive: { backgroundColor: "rgba(255,215,0,0.12)", borderColor: colors.eu.star },
  chipEmoji: { fontSize: 15 },
  chipLabel: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: "rgba(255,255,255,0.6)" },
  chipLabelActive: { color: colors.eu.star },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  dateLabel: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 2 },
  dateValue: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.text.primary },

  optionRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm },
  optionLabel: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.text.primary },
  optionSub: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 },
  optionInput: { fontFamily: typography.families.body, fontSize: 14, color: colors.text.primary, marginTop: 2 },

  iosPickerOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  iosPickerSheet: { borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, overflow: "hidden" },
  iosPickerHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.08)",
  },
  iosPickerTitle: { fontFamily: typography.families.subheading, fontSize: 15, color: colors.text.primary },
  iosPickerCancel: { fontFamily: typography.families.body, fontSize: 15, color: "rgba(255,255,255,0.5)" },
  iosPickerConfirm: { fontFamily: typography.families.subheading, fontSize: 15, color: colors.eu.star },
  iosToggleRow: { flexDirection: "row", justifyContent: "center", gap: spacing.sm, paddingBottom: spacing.md },
  iosToggle: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radii.full, backgroundColor: "rgba(255,255,255,0.06)" },
  iosToggleActive: { backgroundColor: "rgba(255,215,0,0.15)", borderWidth: 1, borderColor: colors.eu.star },
  iosToggleText: { fontFamily: typography.families.body, fontSize: 13, color: "rgba(255,255,255,0.5)" },
  iosToggleTextActive: { color: colors.eu.star, fontFamily: typography.families.bodyMedium },
});
