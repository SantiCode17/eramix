/**
 * ════════════════════════════════════════════════════
 *  LanguagesScreen — European Glass · Proficiency
 *  Search · GlassCard per language · Level pills
 * ════════════════════════════════════════════════════
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import {
  GlassCard,
  Header,
  LoadingSpinner,
} from "@/design-system/components";
import {
  colors,
  typography,
  spacing,
  radii,
  DS,
  TAB_BAR_HEIGHT,
} from "@/design-system/tokens";
import { useProfileStore } from "@/store";
import type { Language, UserLanguageRequest } from "@/types";
import { handleError } from "@/utils/errorHandler";

/* ─── Proficiency catalogue ─── */
const PROFICIENCY_LEVELS: {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "BASIC", label: "Básico", icon: "leaf-outline" },
  { key: "INTERMEDIATE", label: "Intermedio", icon: "library-outline" },
  { key: "ADVANCED", label: "Avanzado", icon: "ribbon-outline" },
  { key: "NATIVE", label: "Nativo", icon: "star-outline" },
];

/* ─── Language flag mapping ─── */
const LANGUAGE_FLAGS: Record<string, string> = {
  // By name (lowercase)
  english: "🇬🇧", spanish: "🇪🇸", french: "🇫🇷", german: "🇩🇪",
  italian: "🇮🇹", portuguese: "🇵🇹", dutch: "🇳🇱", romanian: "🇷🇴",
  polish: "🇵🇱", swedish: "🇸🇪", norwegian: "🇳🇴", danish: "🇩🇰",
  finnish: "🇫🇮", czech: "🇨🇿", hungarian: "🇭🇺", greek: "🇬🇷",
  turkish: "🇹🇷", russian: "🇷🇺", arabic: "🇸🇦", chinese: "🇨🇳",
  japanese: "🇯🇵", korean: "🇰🇷", hindi: "🇮🇳", bulgarian: "🇧🇬",
  croatian: "🇭🇷", serbian: "🇷🇸", slovenian: "🇸🇮", slovak: "🇸🇰",
  lithuanian: "🇱🇹", latvian: "🇱🇻", estonian: "🇪🇪", irish: "🇮🇪",
  catalan: "🇪🇸", basque: "🇪🇸", galician: "🇪🇸",
  // Spanish names
  inglés: "🇬🇧", español: "🇪🇸", francés: "🇫🇷", alemán: "🇩🇪",
  italiano: "🇮🇹", portugués: "🇵🇹", holandés: "🇳🇱", rumano: "🇷🇴",
  polaco: "🇵🇱", sueco: "🇸🇪", noruego: "🇳🇴", danés: "🇩🇰",
  finlandés: "🇫🇮", checo: "🇨🇿", húngaro: "🇭🇺", griego: "🇬🇷",
  turco: "🇹🇷", ruso: "🇷🇺", árabe: "🇸🇦", chino: "🇨🇳",
  japonés: "🇯🇵", coreano: "🇰🇷",
  // By code
  en: "🇬🇧", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", it: "🇮🇹",
  pt: "🇵🇹", nl: "🇳🇱", ro: "🇷🇴", pl: "🇵🇱", sv: "🇸🇪",
  no: "🇳🇴", da: "🇩🇰", fi: "🇫🇮", cs: "🇨🇿", hu: "🇭🇺",
  el: "🇬🇷", tr: "🇹🇷", ru: "🇷🇺", ar: "🇸🇦", zh: "🇨🇳",
  ja: "🇯🇵", ko: "🇰🇷", hi: "🇮🇳", bg: "🇧🇬", hr: "🇭🇷",
  sr: "🇷🇸", sl: "🇸🇮", sk: "🇸🇰", lt: "🇱🇹", lv: "🇱🇻",
  et: "🇪🇪", ga: "🇮🇪", ca: "🇪🇸",
};

const getFlag = (name: string, code?: string): string => {
  if (code) {
    const byCode = LANGUAGE_FLAGS[code.toLowerCase()];
    if (byCode) return byCode;
  }
  const byName = LANGUAGE_FLAGS[name.toLowerCase()];
  return byName ?? "🌐";
};

interface SelectedLanguage {
  languageId: number;
  proficiencyLevel: string;
}

export default function LanguagesScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    profile,
    languages: allLanguages,
    isLoadingCatalogs,
    fetchLanguages,
    updateProfile,
  } = useProfileStore();

  const [selected, setSelected] = useState<SelectedLanguage[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  /* Seed from profile */
  useEffect(() => {
    if (profile?.languages) {
      setSelected(
        profile.languages.map((l) => ({
          languageId: (l as any).language?.id ?? l.id,
          proficiencyLevel: l.proficiencyLevel ?? "BASIC",
        }))
      );
    }
  }, [profile?.languages]);

  /* Helpers */
  const selectedIds = useMemo(
    () => new Set(selected.map((s) => s.languageId)),
    [selected]
  );

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return allLanguages;
    const q = searchQuery.toLowerCase();
    return allLanguages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.code && l.code.toLowerCase().includes(q))
    );
  }, [allLanguages, searchQuery]);

  const toggleLanguage = useCallback((id: number) => {
    setSelected((prev) => {
      if (prev.some((s) => s.languageId === id)) {
        return prev.filter((s) => s.languageId !== id);
      }
      return [...prev, { languageId: id, proficiencyLevel: "BASIC" }];
    });
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const setLevel = useCallback((langId: number, level: string) => {
    setSelected((prev) =>
      prev.map((s) =>
        s.languageId === langId ? { ...s, proficiencyLevel: level } : s
      )
    );
  }, []);

  const getLevel = useCallback(
    (langId: number) =>
      selected.find((s) => s.languageId === langId)?.proficiencyLevel ?? null,
    [selected]
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const languages: UserLanguageRequest[] = selected.map((s) => ({
        languageId: s.languageId,
        proficiencyLevel: s.proficiencyLevel,
      }));
      await updateProfile({ languages });
      navigation.goBack();
    } catch (error: unknown) {
      Alert.alert("Error al guardar idiomas", handleError(error, "Languages.save"));
    } finally {
      setIsSaving(false);
    }
  }, [selected, updateProfile, navigation]);

  /* ═══ Render ═══ */
  return (
    <View style={st.container}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0F1535"]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Idiomas" onBack={() => navigation.goBack()} />

      {isLoadingCatalogs && allLanguages.length === 0 ? (
        <View style={st.loadingWrap}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <>
          {/* Search bar */}
          <View style={st.searchRow}>
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.text.tertiary}
              style={st.searchIcon}
            />
            <TextInput
              style={st.searchInput}
              placeholder="Buscar idioma..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <ScrollView contentContainerStyle={st.scrollContent}>
            {filtered.map((lang, idx) => {
              const isActive = selectedIds.has(lang.id);
              const isExpanded = expandedId === lang.id;
              const currentLevel = getLevel(lang.id);

              return (
                <Animated.View
                  key={lang.id}
                  entering={FadeInDown.delay(80 + idx * 40).springify()}
                >
                  <Pressable onPress={() => toggleLanguage(lang.id)}>
                    <GlassCard
                      variant={isActive ? "elevated" : "surface"}
                      style={[
                        st.langCard,
                        isActive && st.langCardActive,
                      ]}
                    >
                      <View style={st.langHeader}>
                        <View style={st.langInfo}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Text style={{ fontSize: 24 }}>{getFlag(lang.name, lang.code)}</Text>
                            <View>
                              <Text style={st.langName}>{lang.name}</Text>
                              {lang.code ? (
                                <Text style={st.langCode}>{lang.code.toUpperCase()}</Text>
                              ) : null}
                            </View>
                          </View>
                        </View>

                        <Ionicons
                          name={isActive ? "checkmark-circle" : "ellipse-outline"}
                          size={24}
                          color={isActive ? colors.eu.star : colors.text.tertiary}
                        />
                      </View>

                      {/* Level pills — visible when expanded or active */}
                      {isActive && isExpanded ? (
                        <View style={st.levelsRow}>
                          {PROFICIENCY_LEVELS.map((lvl) => {
                            const active = currentLevel === lvl.key;
                            return (
                              <Pressable
                                key={lvl.key}
                                onPress={() => setLevel(lang.id, lvl.key)}
                                style={[
                                  st.levelPill,
                                  active && st.levelPillActive,
                                ]}
                              >
                                <Ionicons
                                  name={lvl.icon}
                                  size={14}
                                  color={active ? DS.background : colors.text.secondary}
                                />
                                <Text
                                  style={[
                                    st.levelLabel,
                                    active && st.levelLabelActive,
                                  ]}
                                >
                                  {lvl.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      ) : isActive && currentLevel ? (
                        <Text style={st.levelHint}>
                          {PROFICIENCY_LEVELS.find((l) => l.key === currentLevel)?.label ??
                            currentLevel}
                        </Text>
                      ) : null}
                    </GlassCard>
                  </Pressable>
                </Animated.View>
              );
            })}

            <View style={{ height: spacing.xxxl }} />
          </ScrollView>

          {/* Footer */}
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
                {isSaving ? (
                  <View style={{ height: 20 }}>
                    <Text style={st.saveBtnText}>Guardando...</Text>
                  </View>
                ) : (
                  <Text style={st.saveBtnText}>Guardar ({selected.length} idiomas)</Text>
                )}
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

  /* Search */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: spacing.sm,
  },
  searchIcon: { marginRight: spacing.xs },
  searchInput: {
    flex: 1,
    height: 44,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },

  /* Content */
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 180,
  },
  langCard: { marginBottom: spacing.sm },
  langCardActive: {
    borderColor: "rgba(255,215,0,0.25)",
  },
  langHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  langInfo: { flex: 1 },
  langName: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  langCode: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },

  /* Level pills */
  levelsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  levelPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  levelPillActive: {
    backgroundColor: colors.eu.star,
    borderColor: colors.eu.star,
  },
  levelLabel: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  levelLabelActive: { color: DS.background, fontFamily: typography.families.subheading },
  levelHint: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.eu.star,
    marginTop: spacing.xs,
    opacity: 0.8,
  },

  /* Footer */
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
