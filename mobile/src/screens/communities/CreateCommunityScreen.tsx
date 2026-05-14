/**
 * CreateCommunityScreen — Eramix
 * Diseño European Glass. Hero portada, categorías full-width, floating submit.
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
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";

import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { apiClient } from "@/api/client";
import * as communitiesApi from "@/api/communities";
import type { CommunityCategory } from "@/types/communities";

const { width: SCREEN_W } = Dimensions.get("window");

const CATEGORIES: {
  id: CommunityCategory;
  label: string;
  icon: string;
  desc: string;
  color: string;
  gradientColors: [string, string];
}[] = [
  {
    id: "UNIVERSITY",
    label: "Universidad",
    icon: "🎓",
    desc: "Compañeros de carrera o campus",
    color: "#4A9EFF",
    gradientColors: ["rgba(74,158,255,0.22)", "rgba(74,158,255,0.06)"],
  },
  {
    id: "CITY",
    label: "Ciudad",
    icon: "🏙️",
    desc: "Personas de la misma ciudad",
    color: "#2EC4A9",
    gradientColors: ["rgba(46,196,169,0.22)", "rgba(46,196,169,0.06)"],
  },
  {
    id: "INTEREST",
    label: "Interés",
    icon: "✨",
    desc: "Aficiones o temáticas comunes",
    color: "#B388FF",
    gradientColors: ["rgba(179,136,255,0.22)", "rgba(179,136,255,0.06)"],
  },
  {
    id: "GENERAL",
    label: "General",
    icon: "🌍",
    desc: "Para todos los erasmus",
    color: "#FFD700",
    gradientColors: ["rgba(255,215,0,0.22)", "rgba(255,215,0,0.06)"],
  },
];

async function uploadMedia(uri: string): Promise<string> {
  const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
  const form = new FormData();
  form.append("file", { uri, name: `cover.${ext}`, type: ext === "png" ? "image/png" : "image/jpeg" } as any);
  const res = await apiClient.post<{ data: string }>("/v1/media/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export default function CreateCommunityScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CommunityCategory>("GENERAL");
  const [isPublic, setIsPublic] = useState(true);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [nameFocused, setNameFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length >= 3 && !submitting;

  const activeCat = CATEGORIES.find((c) => c.id === category);

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

  const handleCreate = async () => {
    if (!canSubmit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    try {
      let coverImageUrl: string | undefined;
      if (coverUri) {
        try { coverImageUrl = await uploadMedia(coverUri); } catch {}
      }
      const newCom = await communitiesApi.createCommunity({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        isPublic,
        coverImageUrl,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
      setTimeout(() => navigation.navigate("CommunityDetail", { communityId: newCom.id }), 100);
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
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
          <BlurView intensity={20} tint="dark" style={s.headerBtnBlur}>
            <Ionicons name="close" size={20} color={colors.text.primary} />
          </BlurView>
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Nueva Comunidad</Text>
          {activeCat && (
            <View style={[s.headerCatBadge, { borderColor: `${activeCat.color}40`, backgroundColor: `${activeCat.color}18` }]}>
              <Text style={[s.headerCatText, { color: activeCat.color }]}>
                {activeCat.icon} {activeCat.label}
              </Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 180 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero portada */}
          <Pressable onPress={handlePickCover} style={s.heroWrap}>
            {coverUri ? (
              <>
                <Image source={{ uri: coverUri }} style={s.heroImage} />
                <LinearGradient colors={["transparent", "rgba(10,10,30,0.85)"]} style={s.heroOverlay} />
                <View style={s.heroEditChip}>
                  <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
                  <Ionicons name="camera" size={13} color={colors.eu.star} />
                  <Text style={s.heroEditText}>Cambiar portada</Text>
                </View>
              </>
            ) : (
              <LinearGradient
                colors={["rgba(0,51,153,0.22)", "rgba(255,107,43,0.12)", "rgba(10,10,30,0.8)"]}
                style={s.heroPlaceholder}
              >
                <View style={s.heroCamCircle}>
                  <LinearGradient colors={["rgba(74,158,255,0.25)", "rgba(0,51,153,0.12)"]} style={StyleSheet.absoluteFill} />
                  <Ionicons name="people-outline" size={30} color="#4A9EFF" />
                </View>
                <Text style={s.heroPlaceholderTitle}>Añadir portada</Text>
                <Text style={s.heroPlaceholderSub}>16:9 · JPG / PNG · Hasta 10 MB</Text>
              </LinearGradient>
            )}
          </Pressable>

          {/* Info básica */}
          <View style={s.section}>
            <View style={s.sectionLabelRow}>
              <View style={s.sectionLabelIcon}>
                <Ionicons name="information-circle-outline" size={13} color={colors.eu.star} />
              </View>
              <Text style={s.sectionTitle}>INFORMACIÓN BÁSICA</Text>
            </View>
            <View style={s.card}>
              <View style={[s.inputRow, nameFocused && s.inputRowFocused]}>
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={nameFocused ? colors.eu.star : "rgba(255,255,255,0.3)"}
                  style={s.inputIcon}
                />
                <TextInput
                  style={s.input}
                  placeholder="Nombre de la comunidad *"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={name}
                  onChangeText={setName}
                  maxLength={80}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  returnKeyType="next"
                />
                {name.length > 0 && <Text style={s.charCount}>{name.length}/80</Text>}
              </View>
              <View style={s.cardDivider} />
              <View style={[s.inputRow, descFocused && s.inputRowFocused, { alignItems: "flex-start", paddingVertical: spacing.md }]}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={descFocused ? colors.eu.star : "rgba(255,255,255,0.3)"}
                  style={[s.inputIcon, { marginTop: 2 }]}
                />
                <TextInput
                  style={[s.input, { minHeight: 72, textAlignVertical: "top" }]}
                  placeholder="Descripción (opcional)"
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  maxLength={500}
                  onFocus={() => setDescFocused(true)}
                  onBlur={() => setDescFocused(false)}
                />
              </View>
            </View>
          </View>

          {/* Categoría — tarjetas full-width horizontales */}
          <View style={s.section}>
            <View style={s.sectionLabelRow}>
              <View style={s.sectionLabelIcon}>
                <Ionicons name="grid-outline" size={13} color={colors.eu.star} />
              </View>
              <Text style={s.sectionTitle}>TIPO DE COMUNIDAD</Text>
            </View>
            <View style={s.catList}>
              {CATEGORIES.map((cat) => {
                const active = category === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => { Haptics.selectionAsync(); setCategory(cat.id); }}
                    style={({ pressed }) => [s.catCard, active && { borderColor: cat.color }, pressed && { opacity: 0.8 }]}
                  >
                    {active && (
                      <LinearGradient
                        colors={cat.gradientColors}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      />
                    )}
                    <View style={[s.catIconBox, { backgroundColor: `${cat.color}22` }]}>
                      <Text style={s.catEmoji}>{cat.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.catLabel, active && { color: cat.color }]}>{cat.label}</Text>
                      <Text style={s.catDesc}>{cat.desc}</Text>
                    </View>
                    {active ? (
                      <View style={[s.catCheck, { backgroundColor: cat.color }]}>
                        <Ionicons name="checkmark" size={12} color="#000" />
                      </View>
                    ) : (
                      <View style={s.catUncheck} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Visibilidad */}
          <View style={s.section}>
            <View style={s.sectionLabelRow}>
              <View style={s.sectionLabelIcon}>
                <Ionicons name="eye-outline" size={13} color={colors.eu.star} />
              </View>
              <Text style={s.sectionTitle}>VISIBILIDAD</Text>
            </View>
            <View style={s.card}>
              <View style={s.optionRow}>
                <View style={[s.optionIconBox, isPublic && { backgroundColor: "rgba(255,215,0,0.1)" }]}>
                  <Ionicons
                    name={isPublic ? "globe-outline" : "lock-closed-outline"}
                    size={16}
                    color={isPublic ? colors.eu.star : "rgba(255,255,255,0.4)"}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.optionLabel}>{isPublic ? "Comunidad pública" : "Comunidad privada"}</Text>
                  <Text style={s.optionSub}>{isPublic ? "Cualquiera puede buscarla y unirse" : "Solo por invitación del admin"}</Text>
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

      {/* Floating submit */}
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
                colors={canSubmit ? ["#FFE566", "#D4AF37"] : ["rgba(255,215,0,0.3)", "rgba(255,215,0,0.12)"]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons name="planet-outline" size={18} color={canSubmit ? "#000" : "rgba(255,255,255,0.35)"} />
              <Text style={[s.submitBtnText, !canSubmit && { color: "rgba(255,255,255,0.35)" }]}>
                Crear comunidad
              </Text>
            </>
          )}
        </Pressable>
        {!canSubmit && !submitting && (
          <Text style={s.submitHint}>El nombre debe tener al menos 3 caracteres</Text>
        )}
      </View>
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
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerCatText: { fontFamily: typography.families.body, fontSize: 11 },

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
    borderColor: "rgba(74,158,255,0.25)",
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
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.06)", marginLeft: 52 },
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
  },
  charCount: { fontFamily: typography.families.body, fontSize: 11, color: "rgba(255,255,255,0.28)" },

  // ─── Categorías ───
  catList: { gap: spacing.sm },
  catCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  catIconBox: {
    width: 46, height: 46, borderRadius: radii.lg,
    alignItems: "center", justifyContent: "center",
  },
  catEmoji: { fontSize: 22 },
  catLabel: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 2,
  },
  catDesc: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.4)" },
  catCheck: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  catUncheck: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.18)",
    flexShrink: 0,
  },

  // ─── Visibilidad ───
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  optionIconBox: {
    width: 36, height: 36, borderRadius: radii.md,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  optionLabel: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.text.primary },
  optionSub: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 },

  // ─── Floating footer ───
  floatFooter: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
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
  submitHint: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.32)" },
});
