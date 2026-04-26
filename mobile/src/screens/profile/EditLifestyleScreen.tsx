/**
 * ════════════════════════════════════════════════════════════════
 *  EditLifestyleScreen — Galactic Premium Lifestyle Editor
 *  Animated category cards · Glowing chip selections ·
 *  EU Gold accents · Premium section headers
 * ════════════════════════════════════════════════════════════════
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
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

/* ── Category config ── */
interface CategoryConfig {
  key: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  options: string[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: "exercise",
    icon: "barbell-outline",
    iconColor: "#FF8C35",
    iconBg: "rgba(255,140,53,0.12)",
    title: "Ejercicio",
    subtitle: "¿Con qué frecuencia entrenas?",
    options: ["Todos los días", "A menudo", "A veces", "Casi nunca"],
  },
  {
    key: "alcohol",
    icon: "beer-outline",
    iconColor: "#8B5CF6",
    iconBg: "rgba(139,92,246,0.12)",
    title: "Alcohol",
    subtitle: "¿Tu relación con el alcohol?",
    options: ["Frecuentemente", "Socialmente", "Rara vez", "Abstemio"],
  },
  {
    key: "smoking",
    icon: "flame-outline",
    iconColor: "#FF4F6F",
    iconBg: "rgba(255,79,111,0.12)",
    title: "Fumar",
    subtitle: "¿Fumas?",
    options: ["Sí", "A veces", "Al salir", "Nunca"],
  },
  {
    key: "diet",
    icon: "leaf-outline",
    iconColor: "#00D68F",
    iconBg: "rgba(0,214,143,0.12)",
    title: "Dieta",
    subtitle: "¿Cómo te alimentas?",
    options: ["Omnívoro", "Vegetariano", "Vegano", "Pescetariano"],
  },
  {
    key: "pets",
    icon: "paw-outline",
    iconColor: "#FFD700",
    iconBg: "rgba(255,215,0,0.12)",
    title: "Mascotas",
    subtitle: "¿Tienes mascota?",
    options: ["Perro 🐕", "Gato 🐱", "Otros 🐾", "Sin mascotas"],
  },
  {
    key: "sleep",
    icon: "moon-outline",
    iconColor: "#3B82F6",
    iconBg: "rgba(59,130,246,0.12)",
    title: "Sueño",
    subtitle: "¿Madrugador o nocturno?",
    options: ["Madrugador", "Nocturno", "Depende del día"],
  },
  {
    key: "party",
    icon: "musical-notes-outline",
    iconColor: "#E1306C",
    iconBg: "rgba(225,48,108,0.12)",
    title: "Fiesta",
    subtitle: "¿Cómo son tus noches?",
    options: ["Locura total", "De tranqui", "Solo findes", "Prefiero Netflix"],
  },
  {
    key: "social",
    icon: "people-outline",
    iconColor: "#1DB954",
    iconBg: "rgba(29,185,84,0.12)",
    title: "Batería Social",
    subtitle: "¿Cómo te consideras?",
    options: ["Extrovertido", "Introvertido", "Ambivertido"],
  },
  {
    key: "roommate",
    icon: "home-outline",
    iconColor: "#8B5CF6",
    iconBg: "rgba(139,92,246,0.12)",
    title: "En casa",
    subtitle: "¿Cómo eres conviviendo?",
    options: ["Marie Kondo", "Flexible", "Un poco desastre"],
  },
  {
    key: "travel",
    icon: "airplane-outline",
    iconColor: "#00D68F",
    iconBg: "rgba(0,214,143,0.12)",
    title: "Viajes",
    subtitle: "¿Qué tipo de viajero eres?",
    options: ["Mochilero", "Roadtrips", "Resorts", "Improvisador"],
  },
];

export default function EditLifestyleScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [selections, setSelections] = useState<Record<string, string>>({
    exercise: "A veces",
    alcohol: "Socialmente",
    diet: "Omnívoro",
    pets: "Gato 🐱",
    party: "Solo findes",
    social: "Ambivertido",
  });

  const toggleSelection = useCallback((categoryKey: string, option: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelections((prev) => ({
      ...prev,
      [categoryKey]: prev[categoryKey] === option ? "" : option,
    }));
  }, []);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      // Store lifestyle preferences as customPrompts JSON
      const lifestyle = Object.entries(selections)
        .filter(([_, val]) => val)
        .map(([key, val]) => {
          const cat = CATEGORIES.find((c) => c.key === key);
          return { question: cat?.title || key, answer: val };
        });
      const updated = await profileApi.updateProfile({
        customPrompts: JSON.stringify(lifestyle),
      });
      useAuthStore.getState().updateUser(updated);
      navigation.goBack();
    } catch {
      Alert.alert("Error", "No se pudo guardar");
    } finally {
      setSaving(false);
    }
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
        <Text style={s.headerTitle}>Estilo de vida</Text>
        <View style={s.headerBtn} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ── Description ── */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={s.descCard}>
          <LinearGradient
            colors={["rgba(255,140,53,0.08)", "rgba(255,140,53,0.02)"]}
            style={s.descGrad}
          >
            <Ionicons name="sparkles" size={18} color="#FF8C35" />
            <Text style={s.descText}>
              Comparte tu estilo de vida para conectar con personas afines
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* ── Categories ── */}
        {CATEGORIES.map((cat, idx) => (
          <Animated.View
            key={cat.key}
            entering={FadeInDown.delay(120 + idx * 60).springify()}
            style={s.categoryCard}
          >
            {/* Category header */}
            <View style={s.catHeader}>
              <View style={[s.catIcon, { backgroundColor: cat.iconBg }]}>
                <Ionicons name={cat.icon} size={20} color={cat.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.catTitle}>{cat.title}</Text>
                <Text style={s.catSub}>{cat.subtitle}</Text>
              </View>
            </View>

            {/* Chips */}
            <View style={s.chipsRow}>
              {cat.options.map((opt) => {
                const isSelected = selections[cat.key] === opt;
                return (
                  <Pressable
                    key={opt}
                    style={({ pressed }) => [
                      s.chip,
                      isSelected && s.chipSelected,
                      pressed && !isSelected && { borderColor: "rgba(255,215,0,0.3)" },
                    ]}
                    onPress={() => toggleSelection(cat.key, opt)}
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={["#FFD700", "#FFBA08"]}
                        style={s.chipGrad}
                      >
                        <Text style={s.chipTextSelected}>{opt}</Text>
                        <Ionicons name="checkmark" size={14} color="#0A1628" />
                      </LinearGradient>
                    ) : (
                      <Text style={s.chipText}>{opt}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* ── Save button ── */}
      <Animated.View
        entering={FadeInDown.delay(500).springify()}
        style={[s.saveWrap, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <Pressable
          style={({ pressed }) => [
            s.saveBtn,
            pressed && { transform: [{ scale: 0.97 }] },
            saving && { opacity: 0.6 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <LinearGradient
            colors={["#FFD700", "#FFBA08"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.saveBtnGrad}
          >
            <Ionicons name="checkmark" size={20} color="#0A1628" />
            <Text style={s.saveBtnText}>{saving ? "Guardando..." : "Guardar"}</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
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
  scrollContent: { padding: spacing.lg, paddingBottom: 120 },

  /* Desc card */
  descCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,140,53,0.12)",
  },
  descGrad: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  descText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 18,
  },

  /* Category card */
  categoryCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  catTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.text.primary,
  },
  catSub: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 1,
  },

  /* Chips */
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipSelected: {
    borderColor: colors.eu.star,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  chipGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  chipTextSelected: {
    fontFamily: typography.families.bodyBold,
    fontSize: 14,
    color: "#0A1628",
  },

  /* Save */
  saveWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: DS.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  saveBtn: {
    borderRadius: radii.full,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveBtnText: {
    fontFamily: typography.families.heading,
    fontSize: 16,
    color: "#0A1628",
  },
});
