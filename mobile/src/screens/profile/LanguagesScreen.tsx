import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  GlassButton,
  GlassCard,
  Header,
  LoadingSpinner,
} from "@/design-system/components";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { useProfileStore } from "@/store";
import type { Language, UserLanguageRequest } from "@/types";
import { handleError } from "@/utils/errorHandler";

type IoniconsName = ComponentProps<typeof Ionicons>["name"];

const PROFICIENCY_LEVELS = [
  { key: "BEGINNER", label: "Principiante", icon: "leaf-outline" as IoniconsName },
  { key: "ELEMENTARY", label: "Elemental", icon: "book-outline" as IoniconsName },
  { key: "INTERMEDIATE", label: "Intermedio", icon: "library-outline" as IoniconsName },
  { key: "UPPER_INTERMEDIATE", label: "Intermedio Alto", icon: "school-outline" as IoniconsName },
  { key: "ADVANCED", label: "Avanzado", icon: "ribbon-outline" as IoniconsName },
  { key: "NATIVE", label: "Nativo", icon: "home-outline" as IoniconsName },
] as const;

interface SelectedLanguage {
  languageId: number;
  proficiencyLevel: string;
}

export default function LanguagesScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const {
    profile,
    languages: allLanguages,
    isLoadingCatalogs,
    fetchLanguages,
    updateProfile,
  } = useProfileStore();

  const [selected, setSelected] = useState<SelectedLanguage[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    if (profile?.languages) {
      setSelected(
        profile.languages.map((l) => ({
          languageId: l.id,
          proficiencyLevel: l.proficiencyLevel,
        })),
      );
    }
  }, [profile?.languages]);

  const isSelected = useCallback(
    (langId: number) => selected.some((s) => s.languageId === langId),
    [selected],
  );

  const getLevel = useCallback(
    (langId: number) =>
      selected.find((s) => s.languageId === langId)?.proficiencyLevel ?? "",
    [selected],
  );

  const toggleLanguage = useCallback((langId: number) => {
    setSelected((prev) => {
      if (prev.some((s) => s.languageId === langId)) {
        return prev.filter((s) => s.languageId !== langId);
      }
      return [...prev, { languageId: langId, proficiencyLevel: "BEGINNER" }];
    });
    setExpandedId((prev) => (prev === langId ? null : langId));
  }, []);

  const setLevel = useCallback(
    (langId: number, level: string) => {
      setSelected((prev) =>
        prev.map((s) =>
          s.languageId === langId ? { ...s, proficiencyLevel: level } : s,
        ),
      );
    },
    [],
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Mis idiomas" onBack={() => navigation.goBack()} />

      {isLoadingCatalogs && allLanguages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.subtitle}>
              Selecciona los idiomas que hablas y tu nivel
            </Text>

            {allLanguages.map((lang) => {
              const active = isSelected(lang.id);
              const level = getLevel(lang.id);
              const expanded = expandedId === lang.id;

              return (
                <GlassCard
                  key={lang.id}
                  variant={active ? "elevated" : "surface"}
                  style={styles.langCard}
                >
                  <Pressable
                    style={styles.langHeader}
                    onPress={() => toggleLanguage(lang.id)}
                  >
                    <View style={styles.langInfo}>
                      <Text style={styles.langName}>{lang.name}</Text>
                      <Text style={styles.langCode}>({lang.code})</Text>
                    </View>
                    {active && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkIcon}>✓</Text>
                      </View>
                    )}
                  </Pressable>

                  {active && (expanded || true) && (
                    <View style={styles.levelContainer}>
                      {PROFICIENCY_LEVELS.map((pl) => (
                        <Pressable
                          key={pl.key}
                          style={[
                            styles.levelPill,
                            level === pl.key && styles.levelPillActive,
                          ]}
                          onPress={() => setLevel(lang.id, pl.key)}
                        >
                          <Ionicons name={pl.icon} size={16} color={level === pl.key ? colors.eu.star : colors.text.secondary} />
                          <Text
                            style={[
                              styles.levelText,
                              level === pl.key && styles.levelTextActive,
                            ]}
                          >
                            {pl.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </GlassCard>
              );
            })}

            <View style={{ height: spacing.xxxl + spacing.xl }} />
          </ScrollView>

          <View style={styles.footer}>
            <GlassButton
              title={`Guardar (${selected.length} idiomas)`}
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
    paddingBottom: spacing.xxxl,
  },
  subtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  langCard: { marginBottom: spacing.sm },
  langHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  langInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  langName: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  langCode: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.status.success,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  levelContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  levelPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.06)",
    gap: spacing.xxs,
  },
  levelPillActive: {
    backgroundColor: colors.eu.deep,
    borderColor: colors.eu.star,
  },
  levelEmoji: { fontSize: 14 },
  levelText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  levelTextActive: {
    color: colors.eu.star,
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
