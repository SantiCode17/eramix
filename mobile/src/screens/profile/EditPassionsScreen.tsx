/**
 * ════════════════════════════════════════════════════════════════
 *  EditPassionsScreen — Galactic Premium Passions Picker
 *  Vibrant emoji grid · Animated selections · Glowing chips
 *  Search with auto-filter · EU Gold accents
 * ════════════════════════════════════════════════════════════════
 */
import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn, FadeInUp } from "react-native-reanimated";

import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
import { catalogApi, profileApi } from "@/api/profileService";
import type { Interest } from "@/types";

const MAX_PASSIONS = 8;

/* ── Category config with colors ── */
const CATEGORY_CONFIG: Record<string, { color: string; bg: string }> = {
  Creative: { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)" },
  Social: { color: "#FF8C35", bg: "rgba(255,140,53,0.12)" },
  Sports: { color: "#00D68F", bg: "rgba(0,214,143,0.12)" },
  Entertainment: { color: "#FF4F6F", bg: "rgba(255,79,111,0.12)" },
  Travel: { color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  Food: { color: "#FFD700", bg: "rgba(255,215,0,0.12)" },
  Music: { color: "#1DB954", bg: "rgba(29,185,84,0.12)" },
  default: { color: "#8FA3BC", bg: "rgba(143,163,188,0.12)" },
};

/* ── Fallback passions ── */
const FALLBACK_PASSIONS: Interest[] = [
  { id: 1, name: "Viajar", category: "Travel", emoji: "✈️" },
  { id: 2, name: "Fotografía", category: "Creative", emoji: "📸" },
  { id: 3, name: "Cine", category: "Entertainment", emoji: "🎬" },
  { id: 4, name: "Música", category: "Music", emoji: "🎵" },
  { id: 5, name: "Deporte", category: "Sports", emoji: "⚽" },
  { id: 6, name: "Arte", category: "Creative", emoji: "🎨" },
  { id: 7, name: "Comida", category: "Food", emoji: "🍕" },
  { id: 8, name: "Café", category: "Food", emoji: "☕" },
  { id: 9, name: "Fiesta", category: "Social", emoji: "🎉" },
  { id: 10, name: "Lectura", category: "Entertainment", emoji: "📚" },
  { id: 11, name: "Yoga", category: "Sports", emoji: "🧘" },
  { id: 12, name: "Cocinar", category: "Food", emoji: "👨‍🍳" },
  { id: 13, name: "Gaming", category: "Entertainment", emoji: "🎮" },
  { id: 14, name: "Senderismo", category: "Travel", emoji: "🥾" },
  { id: 15, name: "Bailar", category: "Social", emoji: "💃" },
  { id: 16, name: "Naturaleza", category: "Travel", emoji: "🌿" },
  { id: 17, name: "Cócteles", category: "Social", emoji: "🍹" },
  { id: 18, name: "Surf", category: "Sports", emoji: "🏄" },
  { id: 19, name: "Escribir", category: "Creative", emoji: "✍️" },
  { id: 20, name: "Moda", category: "Creative", emoji: "👗" },
  { id: 21, name: "Escalada", category: "Sports", emoji: "🧗" },
  { id: 22, name: "Gatos", category: "Entertainment", emoji: "🐱" },
  { id: 23, name: "Perros", category: "Entertainment", emoji: "🐶" },
  { id: 24, name: "Emprendimiento", category: "Creative", emoji: "💼" },
  { id: 25, name: "Idiomas", category: "Social", emoji: "🌍" },
  { id: 26, name: "Astrología", category: "Entertainment", emoji: "✨" },
  { id: 27, name: "Tatuajes", category: "Creative", emoji: "🖋️" },
  { id: 28, name: "Teatro", category: "Entertainment", emoji: "🎭" },
  { id: 29, name: "Pintar", category: "Creative", emoji: "🖌️" },
  { id: 30, name: "Ciclismo", category: "Sports", emoji: "🚴" },
  { id: 31, name: "Vino", category: "Food", emoji: "🍷" },
  { id: 32, name: "Cerveza", category: "Social", emoji: "🍻" },
];

export default function EditPassionsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [search, setSearch] = useState("");
  const [allPassions, setAllPassions] = useState<Interest[]>(FALLBACK_PASSIONS);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    new Set(user?.interests?.map((i) => i.id) || [])
  );

  /* ── Load from API ── */
  useEffect(() => {
    catalogApi
      .getInterests()
      .then((data) => {
        if (data.length > 0) setAllPassions(data);
      })
      .catch(() => {});
  }, []);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    if (!search.trim()) return allPassions;
    const q = search.toLowerCase();
    return allPassions.filter((p) => p.name.toLowerCase().includes(q));
  }, [allPassions, search]);

  /* ── Group by category ── */
  const grouped = useMemo(() => {
    const map = new Map<string, Interest[]>();
    for (const p of filtered) {
      const cat = p.category || "default";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const toggle = useCallback(
    (id: number) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (next.size < MAX_PASSIONS) {
          next.add(id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        return next;
      });
    },
    []
  );

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      const updated = await profileApi.updateProfile({
        interestIds: Array.from(selectedIds),
      });
      updateUser(updated);
      navigation.goBack();
    } catch {
      Alert.alert("Error", "No se pudieron guardar tus pasiones");
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
        <Text style={s.headerTitle}>Mis pasiones</Text>
        <View style={s.headerBtn}>
          <View style={s.countBadge}>
            <Text style={s.countText}>
              {selectedIds.size}/{MAX_PASSIONS}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ── Search bar ── */}
      <Animated.View entering={FadeInDown.delay(80).springify()} style={s.searchWrap}>
        <View style={s.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" />
          <TextInput
            style={s.searchInput}
            placeholder="Buscar pasiones..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.3)" />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* ── Selected preview ── */}
      {selectedIds.size > 0 && (
        <Animated.View entering={FadeInDown.delay(100).springify()} style={s.selectedPreview}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6, paddingHorizontal: spacing.lg }}
          >
            {Array.from(selectedIds).map((id) => {
              const p = allPassions.find((x) => x.id === id);
              if (!p) return null;
              return (
                <Pressable
                  key={id}
                  style={s.selectedChip}
                  onPress={() => toggle(id)}
                >
                  <Text style={s.selectedChipEmoji}>{p.emoji || "✨"}</Text>
                  <Text style={s.selectedChipText}>{p.name}</Text>
                  <Ionicons name="close" size={12} color="rgba(10,22,40,0.5)" />
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}

      {/* ── Passions grid ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {grouped.map(([category, passions], gIdx) => {
          const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;
          return (
            <Animated.View
              key={category}
              entering={FadeInDown.delay(150 + gIdx * 60).springify()}
              style={s.categorySection}
            >
              <View style={s.catHeader}>
                <View style={[s.catDot, { backgroundColor: cfg.color }]} />
                <Text style={[s.catTitle, { color: cfg.color }]}>
                  {category}
                </Text>
              </View>
              <View style={s.chipsRow}>
                {passions.map((p) => {
                  const isSelected = selectedIds.has(p.id);
                  return (
                    <Pressable
                      key={p.id}
                      style={({ pressed }) => [
                        s.chip,
                        isSelected && [s.chipSelected, { borderColor: cfg.color }],
                        pressed && { transform: [{ scale: 0.95 }] },
                      ]}
                      onPress={() => toggle(p.id)}
                    >
                      {isSelected ? (
                        <LinearGradient
                          colors={[cfg.color, cfg.color]}
                          style={s.chipGrad}
                        >
                          <Text style={s.chipEmoji}>{p.emoji || "✨"}</Text>
                          <Text style={s.chipTextSelected}>{p.name}</Text>
                        </LinearGradient>
                      ) : (
                        <View style={s.chipInner}>
                          <Text style={s.chipEmoji}>{p.emoji || "✨"}</Text>
                          <Text style={s.chipText}>{p.name}</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* ── Save button ── */}
      <Animated.View
        entering={FadeInUp.delay(400).springify()}
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
            <Text style={s.saveBtnText}>
              {saving ? "Guardando..." : `Guardar${selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}`}
            </Text>
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
  countBadge: {
    backgroundColor: "rgba(255,215,0,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
  },
  countText: {
    fontFamily: typography.families.bodyBold,
    fontSize: 12,
    color: colors.eu.star,
  },

  /* Search */
  searchWrap: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 15,
    color: "#FFF",
  },

  /* Selected preview */
  selectedPreview: {
    paddingVertical: spacing.sm,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.eu.star,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    gap: 4,
  },
  selectedChipEmoji: { fontSize: 14 },
  selectedChipText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: "#0A1628",
  },

  /* Categories */
  scrollContent: { padding: spacing.lg, paddingBottom: 120 },
  categorySection: { marginBottom: spacing.lg },
  catHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.sm,
  },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
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
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.03)",
    overflow: "hidden",
  },
  chipSelected: {
    backgroundColor: "transparent",
  },
  chipGrad: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
  },
  chipInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
  },
  chipEmoji: { fontSize: 16 },
  chipText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
  },
  chipTextSelected: {
    fontFamily: typography.families.bodyBold,
    fontSize: 14,
    color: "#FFF",
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
