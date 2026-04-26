/**
 * CreateCommunityScreen — Eramix
 * Diseño profesional. 2-step upload → JSON submit.
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

import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { apiClient } from "@/api/client";
import * as communitiesApi from "@/api/communities";
import type { CommunityCategory } from "@/types/communities";

const CATEGORIES: { id: CommunityCategory; label: string; icon: string; desc: string }[] = [
  { id: "UNIVERSITY", label: "Universidad",  icon: "🎓", desc: "Compañeros de carrera o campus" },
  { id: "CITY",       label: "Ciudad",       icon: "🏙️", desc: "Personas de la misma ciudad" },
  { id: "INTEREST",   label: "Interés",      icon: "✨", desc: "Aficiones o temáticas comunes" },
  { id: "GENERAL",    label: "General",      icon: "🌍", desc: "Para todos los erasmus" },
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

function SectionTitle({ label }: { label: string }) {
  return <Text style={s.sectionTitle}>{label}</Text>;
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

      {/* Cabecera */}
      <View style={[s.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={({ pressed }) => [s.headerBtn, pressed && { opacity: 0.6 }]}>
          <Ionicons name="close" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>Nueva Comunidad</Text>
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
              <LinearGradient colors={["rgba(59,107,255,0.1)", "rgba(255,215,0,0.07)", "rgba(10,10,30,0.6)"]} style={s.coverPlaceholder}>
                <View style={s.coverIconCircle}>
                  <Ionicons name="people-outline" size={28} color={colors.eu.star} />
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
              <View style={[s.inputRow, nameFocused && s.inputRowFocused]}>
                <Ionicons name="people-outline" size={18} color={nameFocused ? colors.eu.star : "rgba(255,255,255,0.3)"} style={s.inputIcon} />
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
                <Text style={s.charCount}>{name.length}/80</Text>
              </View>
              <View style={s.cardDivider} />
              <View style={[s.inputRow, descFocused && s.inputRowFocused, { alignItems: "flex-start", paddingVertical: spacing.md }]}>
                <Ionicons name="document-text-outline" size={18} color={descFocused ? colors.eu.star : "rgba(255,255,255,0.3)"} style={[s.inputIcon, { marginTop: 2 }]} />
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

          {/* Categoría */}
          <View style={s.section}>
            <SectionTitle label="CATEGORÍA" />
            <View style={s.catGrid}>
              {CATEGORIES.map((cat) => {
                const active = category === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => { Haptics.selectionAsync(); setCategory(cat.id); }}
                    style={[s.catCard, active && s.catCardActive]}
                  >
                    <Text style={s.catEmoji}>{cat.icon}</Text>
                    <Text style={[s.catLabel, active && s.catLabelActive]}>{cat.label}</Text>
                    <Text style={s.catDesc} numberOfLines={2}>{cat.desc}</Text>
                    {active && (
                      <View style={s.catCheck}>
                        <Ionicons name="checkmark" size={11} color="#000" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Visibilidad */}
          <View style={s.section}>
            <SectionTitle label="VISIBILIDAD" />
            <View style={s.card}>
              <View style={s.optionRow}>
                <Ionicons name={isPublic ? "globe-outline" : "lock-closed-outline"} size={18} color="rgba(255,255,255,0.4)" style={s.inputIcon} />
                <View style={{ flex: 1 }}>
                  <Text style={s.optionLabel}>{isPublic ? "Comunidad pública" : "Comunidad privada"}</Text>
                  <Text style={s.optionSub}>{isPublic ? "Cualquiera puede unirse" : "Solo por invitación"}</Text>
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
  },
  charCount: { fontFamily: typography.families.body, fontSize: 11, color: "rgba(255,255,255,0.3)" },

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

  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  catCard: {
    width: "47.5%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.07)",
    padding: spacing.md,
    gap: spacing.xs,
    position: "relative",
  },
  catCardActive: { backgroundColor: "rgba(255,215,0,0.08)", borderColor: colors.eu.star },
  catEmoji: { fontSize: 22 },
  catLabel: { fontFamily: typography.families.subheading, fontSize: 14, color: colors.text.primary },
  catLabelActive: { color: colors.eu.star },
  catDesc: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 17 },
  catCheck: {
    position: "absolute", top: spacing.sm, right: spacing.sm,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.eu.star,
    alignItems: "center", justifyContent: "center",
  },

  optionRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm },
  optionLabel: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.text.primary },
  optionSub: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 },
});
