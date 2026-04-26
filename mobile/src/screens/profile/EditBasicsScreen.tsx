/**
 * ════════════════════════════════════════════════════════════════
 *  EditBasicsScreen — Premium Interactive Fields
 *  Glass cards · Interactive Modals · Instant Save
 * ════════════════════════════════════════════════════════════════
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";

import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
import { profileApi } from "@/api/profileService";
import type { UserUpdateRequest } from "@/types";

export default function EditBasicsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, updateUser } = useAuthStore();

  const [saving, setSaving] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Local states for inputs
  const [tempVal, setTempVal] = useState("");

  const handleOpenModal = (key: string, currentValue: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempVal(currentValue || "");
    setActiveModal(key);
  };

  const handleSave = async (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      const updateReq: UserUpdateRequest = {};
      if (key === "height") updateReq.height = parseInt(tempVal) || undefined;
      if (key === "zodiac") updateReq.zodiac = tempVal;
      if (key === "profession") updateReq.profession = tempVal;
      if (key === "destinationCity") updateReq.destinationCity = tempVal;
      if (key === "socialInstagram") updateReq.socialInstagram = tempVal;
      if (key === "socialTiktok") updateReq.socialTiktok = tempVal;

      if (key === "favoriteFood") updateReq.favoriteFood = tempVal;
      if (key === "specialHobby") updateReq.specialHobby = tempVal;
      if (key === "whyAmIHere") updateReq.whyAmIHere = tempVal;

      const updated = await profileApi.updateProfile(updateReq);
      updateUser(updated);
      setActiveModal(null);
    } catch (error) {
      console.warn("Failed to save", error);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (
    key: string,
    label: string,
    value: string | undefined | null,
    icon: any,
    iconColor: string,
    bg: string
  ) => {
    const hasValue = value && String(value).trim().length > 0;
    const displayValue = hasValue ? value : "Sin especificar";

    return (
      <Pressable
        style={({ pressed }) => [
          s.fieldRow,
          pressed && { backgroundColor: "rgba(255,255,255,0.04)" }
        ]}
        onPress={() => handleOpenModal(key, hasValue ? String(value) : "")}
      >
        <View style={[s.fieldIcon, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={s.fieldContent}>
          <Text style={s.fieldLabel}>{label}</Text>
          <Text style={[s.fieldValue, !hasValue && s.fieldEmpty]}>
            {displayValue}
          </Text>
        </View>
        <View style={s.chevronWrap}>
          {hasValue ? (
            <Ionicons name="checkmark-circle" size={20} color={colors.eu.star} />
          ) : (
            <Ionicons name="add-circle-outline" size={20} color="rgba(255,255,255,0.3)" />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <Animated.View entering={FadeIn.duration(300)} style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.headerBtn} hitSlop={12}>
          <View style={s.headerBtnCircle}>
            <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
          </View>
        </Pressable>
        <Text style={s.headerTitle}>Información Básica</Text>
        <View style={s.headerBtn} />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        
        <Animated.View entering={FadeInDown.delay(100).springify()} style={s.sectionCard}>
          <Text style={s.sectionHeader}>SOBRE TI</Text>
          {renderField("height", "Altura (cm)", user?.height?.toString(), "resize-outline", "#8B5CF6", "rgba(139,92,246,0.12)")}
          <View style={s.divider} />
          {renderField("zodiac", "Zodíaco", user?.zodiac, "moon-outline", "#FF8C35", "rgba(255,140,53,0.12)")}
          <View style={s.divider} />
          {renderField("profession", "Profesión", user?.profession, "briefcase-outline", "#1DB954", "rgba(29,185,84,0.12)")}
          <View style={s.divider} />
          {renderField("whyAmIHere", "¿Qué busco?", user?.whyAmIHere, "search-outline", "#00D68F", "rgba(0,214,143,0.12)")}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(125).springify()} style={s.sectionCard}>
          <Text style={s.sectionHeader}>FAVORITOS</Text>
          {renderField("favoriteFood", "Comida favorita", user?.favoriteFood, "pizza-outline", "#FFD700", "rgba(255,215,0,0.12)")}
          <View style={s.divider} />
          {renderField("specialHobby", "Talento / Hobby", user?.specialHobby, "star-outline", "#E1306C", "rgba(225,48,108,0.12)")}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()} style={s.sectionCard}>
          <Text style={s.sectionHeader}>ERASMUS</Text>
          {renderField("destinationCity", "Ciudad Destino", user?.destinationCity, "location-outline", "#FF4F6F", "rgba(255,79,111,0.12)")}
          <View style={s.divider} />
          {/* Universities and Dates handled via dedicated screens or complex modals normally, but keeping it simple to read for now */}
          <View style={s.fieldRow}>
             <View style={[s.fieldIcon, { backgroundColor: "rgba(0,214,143,0.12)" }]}>
                <Ionicons name="school-outline" size={20} color="#00D68F" />
             </View>
             <View style={s.fieldContent}>
                <Text style={s.fieldLabel}>Universidad</Text>
                <Text style={s.fieldValue}>{user?.homeUniversity?.name || "Sin especificar"}</Text>
             </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={s.sectionCard}>
          <Text style={s.sectionHeader}>REDES SOCIALES</Text>
          {renderField("socialInstagram", "Instagram (Usuario)", user?.socialInstagram, "logo-instagram", "#E1306C", "rgba(225,48,108,0.12)")}
          <View style={s.divider} />
          {renderField("socialTiktok", "TikTok (Usuario)", user?.socialTiktok, "logo-tiktok", "#FFF", "rgba(255,255,255,0.05)")}
        </Animated.View>
      </ScrollView>

      {/* ── Editor Modal — arriba del teclado ── */}
      <Modal
        visible={!!activeModal}
        transparent
        animationType="fade"
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          keyboardVerticalOffset={0}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setActiveModal(null)}
          />
          <View style={s.modalContent}>
            <LinearGradient colors={["#131B2A", "#0B101A"]} style={s.modalGradient}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>
                  {activeModal === "favoriteFood" ? "Comida Favorita" :
                   activeModal === "specialHobby" ? "Hobby Especial" :
                   activeModal === "whyAmIHere" ? "Qué busco" :
                   `Editar ${activeModal}`}
                </Text>
                <Pressable onPress={() => setActiveModal(null)} style={s.modalClose}>
                  <Ionicons name="close" size={24} color="#FFF" />
                </Pressable>
              </View>

              {(activeModal === "zodiac" || activeModal === "whyAmIHere") ? (
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }} contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 4 }}>
                  {(activeModal === "zodiac"
                    ? ["♈ Aries", "♉ Tauro", "♊ Géminis", "♋ Cáncer", "♌ Leo", "♍ Virgo", "♎ Libra", "♏ Escorpio", "♐ Sagitario", "♑ Capricornio", "♒ Acuario", "♓ Piscis"]
                    : ["Amigos nuevos", "Relaciones sentimentales", "Networking profesional", "Compañero/a de piso", "Explorar la ciudad", "Practicar idiomas", "Compañeros de aventura", "Conocer gente"]
                  ).map((opt) => {
                    const active = tempVal === opt;
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => setTempVal(opt)}
                        style={[s.optChip, active && s.optChipActive]}
                      >
                        <Text style={[s.optChipText, active && s.optChipTextActive]}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ) : (
                <TextInput
                  style={s.modalInput}
                  value={tempVal}
                  onChangeText={setTempVal}
                  placeholder="Escribe aquí..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoFocus
                  keyboardType={activeModal === "height" ? "numeric" : "default"}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onSubmitEditing={() => activeModal && handleSave(activeModal)}
                />
              )}

              <Pressable
                style={({ pressed }) => [s.saveBtn, pressed && { opacity: 0.8 }]}
                onPress={() => activeModal && handleSave(activeModal)}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={s.saveBtnText}>Guardar</Text>
                )}
              </Pressable>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerBtn: { width: 44, alignItems: "center" },
  headerBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    color: colors.text.primary,
  },
  scrollContent: { padding: spacing.lg, paddingBottom: 100, gap: spacing.xl },

  sectionCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  sectionHeader: {
    fontFamily: typography.families.subheading,
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1.5,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  fieldIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldContent: { flex: 1 },
  fieldLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
  },
  fieldValue: {
    fontFamily: typography.families.body,
    fontSize: 16,
    color: "#FFF",
  },
  fieldEmpty: {
    fontStyle: "italic",
    color: "rgba(255,255,255,0.3)",
  },
  chevronWrap: {
    width: 30,
    alignItems: "flex-end",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginLeft: 74,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: radii["2xl"],
    borderTopRightRadius: radii["2xl"],
    overflow: "hidden",
  },
  modalGradient: {
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: "#FFF",
    textTransform: "capitalize",
  },
  modalClose: {
    padding: spacing.xs,
  },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: radii.lg,
    padding: spacing.md,
    color: "#FFF",
    fontFamily: typography.families.body,
    fontSize: 16,
    marginBottom: spacing.xl,
  },
  saveBtn: {
    backgroundColor: colors.eu.star,
    padding: spacing.md,
    borderRadius: radii.full,
    alignItems: "center",
  },
  saveBtnText: {
    fontFamily: typography.families.heading,
    fontSize: 16,
    color: "#0A1628",
  },
  optChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  optChipActive: {
    borderColor: colors.eu.star,
    backgroundColor: "rgba(255,215,0,0.12)",
  },
  optChipText: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
  },
  optChipTextActive: {
    color: colors.eu.star,
    fontFamily: typography.families.bodyMedium,
  },
});
