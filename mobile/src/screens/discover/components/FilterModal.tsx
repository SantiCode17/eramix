import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Dimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { GlassModal, GlassButton, Chip } from "@/design-system";
import { Ionicons } from "@expo/vector-icons";
import { catalogApi } from "@/api";
import { handleError } from "@/utils/errorHandler";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { DiscoverFilters, Interest, Language } from "@/types";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: DiscoverFilters;
  onApply: (filters: DiscoverFilters) => void;
}

const RADIUS_OPTIONS = [10, 25, 50, 100, 250, 500];

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const RADIUS_META: Record<number, { label: string; icon: IoniconsName; color: string }> = {
  10: { label: "Cerca", icon: "walk-outline", color: "#00D68F" },
  25: { label: "Barrio", icon: "bicycle-outline", color: "#4FC3F7" },
  50: { label: "Ciudad", icon: "bus-outline", color: colors.eu.star },
  100: { label: "Región", icon: "car-outline", color: colors.eu.orange },
  250: { label: "País", icon: "train-outline", color: "#FF6B9D" },
  500: { label: "Europa", icon: "airplane-outline", color: "#B388FF" },
};

export default function FilterModal({
  visible,
  onClose,
  filters,
  onApply,
}: FilterModalProps): React.JSX.Element {
  const [localFilters, setLocalFilters] = useState<DiscoverFilters>(filters);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);

  const activeCount =
    (localFilters.destinationCity ? 1 : 0) +
    (localFilters.destinationCountry ? 1 : 0) +
    (localFilters.radiusKm !== 50 ? 1 : 0) +
    localFilters.interestIds.length +
    localFilters.languageIds.length;

  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
      loadCatalogs();
    }
  }, [visible]);

  const loadCatalogs = useCallback(async () => {
    if (interests.length > 0 && languages.length > 0) return;
    setLoadingCatalogs(true);
    try {
      const [interestsData, languagesData] = await Promise.all([
        catalogApi.getInterests(),
        catalogApi.getLanguages(),
      ]);
      setInterests(interestsData);
      setLanguages(languagesData);
    } catch (e) {
      handleError(e, "FilterModal.loadCatalogs");
      if (interests.length === 0) {
        setInterests([
          { id: 1, name: "Viajes", emoji: "✈️" },
          { id: 2, name: "Deportes", emoji: "⚽" },
          { id: 3, name: "Música", emoji: "🎵" },
          { id: 4, name: "Fotografía", emoji: "📸" },
          { id: 5, name: "Cocina", emoji: "🍳" },
          { id: 6, name: "Idiomas", emoji: "🗣️" },
          { id: 7, name: "Arte", emoji: "🎨" },
          { id: 8, name: "Tecnología", emoji: "💻" },
          { id: 9, name: "Lectura", emoji: "📚" },
          { id: 10, name: "Cine", emoji: "🎬" },
        ] as any[]);
      }
      if (languages.length === 0) {
        setLanguages([
          { id: 1, name: "Español" },
          { id: 2, name: "English" },
          { id: 3, name: "Français" },
          { id: 4, name: "Deutsch" },
          { id: 5, name: "Italiano" },
          { id: 6, name: "Português" },
          { id: 7, name: "Nederlands" },
          { id: 8, name: "Polski" },
        ] as any[]);
      }
    } finally {
      setLoadingCatalogs(false);
    }
  }, [interests.length, languages.length]);

  const toggleInterest = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalFilters((prev) => {
      const ids = prev.interestIds.includes(id)
        ? prev.interestIds.filter((i) => i !== id)
        : [...prev.interestIds, id];
      return { ...prev, interestIds: ids };
    });
  };

  const toggleLanguage = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalFilters((prev) => {
      const ids = prev.languageIds.includes(id)
        ? prev.languageIds.filter((i) => i !== id)
        : [...prev.languageIds, id];
      return { ...prev, languageIds: ids };
    });
  };

  const handleApply = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLocalFilters({
      radiusKm: 50,
      interestIds: [],
      languageIds: [],
    });
  };

  return (
    <GlassModal visible={visible} onClose={onClose}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="options-outline" size={20} color={colors.eu.star} />
          </View>
          <View>
            <Text style={styles.modalTitle}>Filtros</Text>
            <Text style={styles.modalSubtitle}>
              {activeCount > 0
                ? `${activeCount} filtro${activeCount > 1 ? "s" : ""} activo${activeCount > 1 ? "s" : ""}`
                : "Personaliza tu búsqueda"}
            </Text>
          </View>
        </View>
        <Pressable onPress={handleReset} hitSlop={12} style={styles.resetPill}>
          <Ionicons name="refresh-outline" size={14} color={colors.eu.star} />
          <Text style={styles.resetPillText}>Reset</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Location ── */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={16} color={colors.eu.orange} />
            <Text style={styles.sectionTitle}>Ubicación</Text>
          </View>
          <View style={styles.locationRow}>
            <View style={styles.locationInputWrap}>
              <Ionicons name="business-outline" size={14} color={colors.text.disabled} />
              <TextInput
                style={styles.locationInput}
                placeholder="Ciudad..."
                placeholderTextColor={colors.text.disabled}
                value={localFilters.destinationCity ?? ""}
                onChangeText={(t) =>
                  setLocalFilters((p) => ({ ...p, destinationCity: t || undefined }))
                }
              />
              {localFilters.destinationCity ? (
                <Pressable
                  onPress={() => setLocalFilters((p) => ({ ...p, destinationCity: undefined }))}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={16} color={colors.text.tertiary} />
                </Pressable>
              ) : null}
            </View>
            <View style={styles.locationInputWrap}>
              <Ionicons name="flag-outline" size={14} color={colors.text.disabled} />
              <TextInput
                style={styles.locationInput}
                placeholder="País..."
                placeholderTextColor={colors.text.disabled}
                value={localFilters.destinationCountry ?? ""}
                onChangeText={(t) =>
                  setLocalFilters((p) => ({ ...p, destinationCountry: t || undefined }))
                }
              />
              {localFilters.destinationCountry ? (
                <Pressable
                  onPress={() => setLocalFilters((p) => ({ ...p, destinationCountry: undefined }))}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={16} color={colors.text.tertiary} />
                </Pressable>
              ) : null}
            </View>
          </View>
        </Animated.View>

        {/* ── Radius ── */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.sectionHeader}>
            <Ionicons name="radio-outline" size={16} color="#4FC3F7" />
            <Text style={styles.sectionTitle}>Radio de búsqueda</Text>
            <View style={styles.radiusValuePill}>
              <Text style={styles.radiusValueText}>{localFilters.radiusKm} km</Text>
            </View>
          </View>
          <View style={styles.radiusGrid}>
            {RADIUS_OPTIONS.map((km) => {
              const meta = RADIUS_META[km];
              const active = localFilters.radiusKm === km;
              return (
                <Pressable
                  key={km}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLocalFilters((p) => ({ ...p, radiusKm: km }));
                  }}
                  style={[
                    styles.radiusCard,
                    active && {
                      backgroundColor: meta.color + "15",
                      borderColor: meta.color + "40",
                    },
                  ]}
                >
                  <Ionicons
                    name={meta.icon}
                    size={18}
                    color={active ? meta.color : colors.text.disabled}
                  />
                  <Text style={[styles.radiusKm, active && { color: meta.color }]}>
                    {km} km
                  </Text>
                  <Text
                    style={[styles.radiusLabel, active && { color: meta.color, opacity: 0.8 }]}
                  >
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* ── Interests ── */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={16} color="#FF6B9D" />
            <Text style={styles.sectionTitle}>Intereses</Text>
            {localFilters.interestIds.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{localFilters.interestIds.length}</Text>
              </View>
            )}
          </View>
          {loadingCatalogs ? (
            <View style={styles.loadingRow}>
              <Text style={styles.loadingText}>Cargando intereses…</Text>
            </View>
          ) : (
            <View style={styles.chipsGrid}>
              {interests.map((interest) => (
                <Chip
                  key={interest.id}
                  label={interest.name}
                  selected={localFilters.interestIds.includes(interest.id)}
                  onPress={() => toggleInterest(interest.id)}
                />
              ))}
            </View>
          )}
        </Animated.View>

        {/* ── Languages ── */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#B388FF" />
            <Text style={styles.sectionTitle}>Idiomas</Text>
            {localFilters.languageIds.length > 0 && (
              <View style={[styles.countBadge, { backgroundColor: "rgba(179,136,255,0.15)" }]}>
                <Text style={[styles.countBadgeText, { color: "#B388FF" }]}>
                  {localFilters.languageIds.length}
                </Text>
              </View>
            )}
          </View>
          {loadingCatalogs ? (
            <View style={styles.loadingRow}>
              <Text style={styles.loadingText}>Cargando idiomas…</Text>
            </View>
          ) : (
            <View style={styles.chipsGrid}>
              {languages.map((lang) => (
                <Chip
                  key={lang.id}
                  label={lang.name}
                  selected={localFilters.languageIds.includes(lang.id)}
                  onPress={() => toggleLanguage(lang.id)}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        <Pressable onPress={onClose} style={styles.cancelBtn}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </Pressable>
        <Pressable onPress={handleApply} style={styles.applyBtn}>
          <View style={styles.applyGradient}>
            <Ionicons name="search-outline" size={16} color="#FFF" />
            <Text style={styles.applyBtnText}>
              Aplicar{activeCount > 0 ? ` (${activeCount})` : ""}
            </Text>
          </View>
        </Pressable>
      </View>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,215,0,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  resetPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,215,0,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.12)",
  },
  resetPillText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.eu.star,
  },
  scroll: { maxHeight: Dimensions.get("window").height * 0.52 },
  scrollContent: { paddingBottom: spacing.md, gap: spacing.lg + spacing.sm },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  locationRow: { gap: spacing.sm },
  locationInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: spacing.md,
    height: 44,
  },
  locationInput: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.primary,
    padding: 0,
    height: 44,
  },
  radiusValuePill: {
    backgroundColor: "rgba(79,195,247,0.10)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(79,195,247,0.20)",
  },
  radiusValueText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: "#4FC3F7",
  },
  radiusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  radiusCard: {
    width: (Dimensions.get("window").width - 120) / 3,
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  radiusKm: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: colors.text.secondary,
  },
  radiusLabel: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.disabled,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  countBadge: {
    backgroundColor: "rgba(255,107,157,0.15)",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countBadgeText: {
    fontFamily: typography.families.bodyBold,
    fontSize: 11,
    color: "#FF6B9D",
  },
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  loadingRow: { paddingVertical: spacing.md, alignItems: "center" },
  loadingText: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 0.35,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cancelBtnText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: colors.text.secondary,
  },
  applyBtn: { flex: 0.65, borderRadius: radii.xl, overflow: "hidden" },
  applyGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    backgroundColor: colors.eu.orange,
    borderRadius: radii.xl,
  },
  applyBtnText: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: "#FFF",
  },
});
