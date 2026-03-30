import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { GlassModal, GlassButton, Chip } from "@/design-system";
import { catalogApi } from "@/api";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { DiscoverFilters, Interest, Language } from "@/types";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: DiscoverFilters;
  onApply: (filters: DiscoverFilters) => void;
}

const RADIUS_OPTIONS = [10, 25, 50, 100, 250, 500];

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
    } catch {
      // Silently fail — catalogs are optional enhancement
    } finally {
      setLoadingCatalogs(false);
    }
  }, [interests.length, languages.length]);

  const toggleInterest = (id: number) => {
    setLocalFilters((prev) => {
      const ids = prev.interestIds.includes(id)
        ? prev.interestIds.filter((i) => i !== id)
        : [...prev.interestIds, id];
      return { ...prev, interestIds: ids };
    });
  };

  const toggleLanguage = (id: number) => {
    setLocalFilters((prev) => {
      const ids = prev.languageIds.includes(id)
        ? prev.languageIds.filter((i) => i !== id)
        : [...prev.languageIds, id];
      return { ...prev, languageIds: ids };
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const reset: DiscoverFilters = {
      radiusKm: 50,
      interestIds: [],
      languageIds: [],
    };
    setLocalFilters(reset);
  };

  return (
    <GlassModal visible={visible} onClose={onClose}>
      <Text style={styles.modalTitle}>Filtros de búsqueda</Text>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* City filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ciudad de destino</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Barcelona, Roma…"
            placeholderTextColor={colors.text.disabled}
            value={localFilters.destinationCity ?? ""}
            onChangeText={(text) =>
              setLocalFilters((p) => ({
                ...p,
                destinationCity: text || undefined,
              }))
            }
          />
        </View>

        {/* Country filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>País de destino</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: España, Italia…"
            placeholderTextColor={colors.text.disabled}
            value={localFilters.destinationCountry ?? ""}
            onChangeText={(text) =>
              setLocalFilters((p) => ({
                ...p,
                destinationCountry: text || undefined,
              }))
            }
          />
        </View>

        {/* Radius slider (simplified as chips) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Radio de búsqueda</Text>
          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map((km) => (
              <Pressable
                key={km}
                onPress={() =>
                  setLocalFilters((p) => ({ ...p, radiusKm: km }))
                }
                style={[
                  styles.radiusChip,
                  localFilters.radiusKm === km && styles.radiusChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.radiusText,
                    localFilters.radiusKm === km && styles.radiusTextActive,
                  ]}
                >
                  {km} km
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intereses</Text>
          {loadingCatalogs ? (
            <Text style={styles.loadingText}>Cargando…</Text>
          ) : (
            <View style={styles.chipsGrid}>
              {interests.map((interest) => (
                <Chip
                  key={interest.id}
                  label={`${interest.emoji ?? "✨"} ${interest.name}`}
                  selected={localFilters.interestIds.includes(interest.id)}
                  onPress={() => toggleInterest(interest.id)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idiomas</Text>
          {loadingCatalogs ? (
            <Text style={styles.loadingText}>Cargando…</Text>
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
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        <GlassButton
          title="Resetear"
          variant="ghost"
          size="sm"
          onPress={handleReset}
          style={styles.resetBtn}
        />
        <GlassButton
          title="Aplicar filtros"
          variant="primary"
          size="md"
          onPress={handleApply}
          style={styles.applyBtn}
        />
      </View>
    </GlassModal>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 420,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  radiusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  radiusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  radiusChipActive: {
    backgroundColor: "rgba(255, 204, 0, 0.15)",
    borderColor: colors.eu.star,
  },
  radiusText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.secondary,
  },
  radiusTextActive: {
    color: colors.eu.star,
  },
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  loadingText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    gap: spacing.md,
  },
  resetBtn: {
    flex: 0.4,
  },
  applyBtn: {
    flex: 0.6,
  },
  modalTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
});
