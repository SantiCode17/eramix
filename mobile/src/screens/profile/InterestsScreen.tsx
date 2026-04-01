import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  GlassButton,
  GlassCard,
  Chip,
  Header,
  LoadingSpinner,
} from "@/design-system/components";
import { colors, typography, spacing } from "@/design-system/tokens";
import { useProfileStore } from "@/store";
import type { Interest } from "@/types";
import { handleError } from "@/utils/errorHandler";

export default function InterestsScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const {
    profile,
    interests: allInterests,
    isLoadingCatalogs,
    fetchInterests,
    updateProfile,
  } = useProfileStore();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

  useEffect(() => {
    if (profile?.interests) {
      setSelectedIds(new Set(profile.interests.map((i) => i.id)));
    }
  }, [profile?.interests]);

  // Group interests by category
  const grouped = useMemo(() => {
    const map = new Map<string, Interest[]>();
    for (const interest of allInterests) {
      const list = map.get(interest.category) ?? [];
      list.push(interest);
      map.set(interest.category, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [allInterests]);

  const toggleInterest = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateProfile({ interestIds: Array.from(selectedIds) });
      navigation.goBack();
    } catch (error: unknown) {
      Alert.alert("Error al guardar intereses", handleError(error, "Interests.save"));
    } finally {
      setIsSaving(false);
    }
  }, [selectedIds, updateProfile, navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Mis intereses" onBack={() => navigation.goBack()} />

      {isLoadingCatalogs && allInterests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.subtitle}>
              Selecciona tus intereses para conectar con gente afín
            </Text>

            {grouped.map(([category, items]) => (
              <GlassCard
                key={category}
                variant="surface"
                style={styles.categoryCard}
              >
                <Text style={styles.categoryTitle}>{category}</Text>
                <View style={styles.chipGrid}>
                  {items.map((interest) => (
                    <Chip
                      key={interest.id}
                      label={`${interest.emoji ?? ""} ${interest.name}`.trim()}
                      selected={selectedIds.has(interest.id)}
                      onPress={() => toggleInterest(interest.id)}
                    />
                  ))}
                </View>
              </GlassCard>
            ))}

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>

          <View style={styles.footer}>
            <GlassButton
              title={`Guardar (${selectedIds.size} seleccionados)`}
              onPress={handleSave}
              loading={isSaving}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl + spacing.xl,
  },
  subtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  categoryCard: { marginBottom: spacing.md },
  categoryTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.eu.star,
    marginBottom: spacing.sm,
    textTransform: "capitalize",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: "rgba(26,26,46,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
});
