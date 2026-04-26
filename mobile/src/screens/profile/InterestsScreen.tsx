/**
 * ════════════════════════════════════════════════════
 *  InterestsScreen — European Glass · Chip Selector
 *  Grouped by category · GlassCard · Chip toggle
 * ════════════════════════════════════════════════════
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import {
  GlassCard,
  Chip,
  Header,
  LoadingSpinner,
} from "@/design-system/components";
import {
  colors,
  typography,
  spacing,
  radii,
  DS,
} from "@/design-system/tokens";
import { useProfileStore } from "@/store";
import type { Interest } from "@/types";
import { handleError } from "@/utils/errorHandler";

export default function InterestsScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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

  /* Group by category */
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
    <View style={st.container}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0F1535"]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Mis intereses" onBack={() => navigation.goBack()} />

      {isLoadingCatalogs && allInterests.length === 0 ? (
        <View style={st.loadingWrap}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={st.scrollContent}>
            <Text style={st.subtitle}>
              Selecciona tus intereses para conectar con gente afín
            </Text>

            {grouped.map(([category, items], idx) => (
              <Animated.View
                key={category}
                entering={FadeInDown.delay(100 + idx * 60).springify()}
              >
                <GlassCard variant="surface" style={st.categoryCard}>
                  <Text style={st.categoryTitle}>{category}</Text>
                  <View style={st.chipGrid}>
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
              </Animated.View>
            ))}

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>

          <View
            style={[
              st.footer,
              { paddingBottom: Math.max(insets.bottom, 16) + spacing.md },
            ]}
          >
            <Pressable
              onPress={handleSave}
              disabled={isSaving}
              style={({ pressed }) => [st.saveBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
            >
              <LinearGradient
                colors={["#FFD700", "#FF8C00"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={st.saveBtnGrad}
              >
                <Text style={st.saveBtnText}>
                  {isSaving ? "Guardando..." : `Guardar (${selectedIds.size} seleccionados)`}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

/* ═══ Styles — European Glass ═══ */
const st = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 180,
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
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: "rgba(4,6,26,0.95)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  saveBtn: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  saveBtnGrad: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontFamily: typography.families.heading,
    fontSize: 16,
    color: "#0A1628",
  },
});
