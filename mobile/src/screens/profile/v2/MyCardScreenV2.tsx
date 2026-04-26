import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ScreenBackground } from "@/design-system";
import { colors, radii, spacing, typography } from "@/design-system/tokens";
import { FlipUserCard, FLIP_CARD_HEIGHT } from "@/screens/discover/components";
import { useMyProfile } from "@/hooks/useProfileQuery";
import { toProfileCardUser } from "../utils/profileCardUser";
import {
  DEFAULT_CARD_SETTINGS,
  getProfileCardSettings,
  saveProfileCardSettings,
  CARD_THEMES,
  ACCENT_COLORS,
  FRAME_OPTIONS,
  BADGE_OPTIONS,
  FONT_STYLES,
  type ProfileCardSettings,
} from "../data/cardSettings";

/* ── Section wrapper ── */
function Section({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={s.section}>
      <View style={s.sectionHeader}>
        <Ionicons name={icon} size={14} color={colors.eu.star} />
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </Animated.View>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function MyCardScreenV2(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const profileQuery = useMyProfile();

  const settingsQuery = useQuery({ queryKey: ["profileCardSettings"], queryFn: getProfileCardSettings });
  const [draft, setDraft] = useState<ProfileCardSettings | null>(null);

  const settings = draft ?? settingsQuery.data ?? DEFAULT_CARD_SETTINGS;
  const cardUser = useMemo(() => toProfileCardUser(profileQuery.data), [profileQuery.data]);

  const selectedFrame = useMemo(
    () => FRAME_OPTIONS.find((f) => f.id === settings.frameId) ?? FRAME_OPTIONS[0],
    [settings.frameId],
  );

  const setField = <K extends keyof ProfileCardSettings>(field: K, value: ProfileCardSettings[K]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft((prev) => ({ ...(prev ?? settings), [field]: value }));
  };

  const onSave = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await saveProfileCardSettings(settings);
      await queryClient.invalidateQueries({ queryKey: ["profileCardSettings"] });
      navigation.goBack();
    } catch {
      Alert.alert("Error", "No se pudieron guardar los cambios de la tarjeta.");
    }
  };

  if (settingsQuery.isLoading && !settingsQuery.data) {
    return (
      <ScreenBackground>
        <View style={s.centered}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      </ScreenBackground>
    );
  }

  const accent = settings.accentColor;

  return (
    <ScreenBackground>
      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={s.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerEyebrow}>PERSONALIZAR</Text>
          <Text style={s.headerTitle}>Mi tarjeta</Text>
        </View>
        <Pressable style={s.headerBtn} onPress={onSave}>
          <Ionicons name="checkmark" size={20} color={colors.eu.star} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: Math.max(insets.bottom, 18) + 90 }]} showsVerticalScrollIndicator={false}>
        {/* ── Info pill ── */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={s.infoPill}>
          <Ionicons name="sparkles-outline" size={13} color={colors.eu.star} />
          <Text style={s.infoPillText}>Lo que diseñes aquí es exactamente lo que aparece en Inicio y Discover.</Text>
        </Animated.View>

        {/* ── Live Card Preview ── */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[s.previewFrame, { borderColor: selectedFrame.border, shadowColor: selectedFrame.glow }]}
        >
          <View style={s.cardWrap}>
            <FlipUserCard user={cardUser} />
          </View>
          <View style={s.previewLegend}>
            <Ionicons name="sync-outline" size={13} color={colors.text.tertiary} />
            <Text style={s.previewLegendText}>Toca la tarjeta para ver ambos lados</Text>
          </View>
        </Animated.View>

        {/* ── Live headline & badge preview ── */}
        {(!!settings.headline.trim() || !!settings.badge) && (
          <Animated.View entering={FadeInDown.delay(140).springify()} style={s.liveInfo}>
            {!!settings.headline.trim() && (
              <Text style={[s.liveHeadline, { color: accent }]}>"{settings.headline}"</Text>
            )}
            {!!settings.badge && (
              <View style={[s.liveBadge, { borderColor: `${accent}40` }]}>
                <Ionicons name="ribbon-outline" size={12} color={accent} />
                <Text style={[s.liveBadgeText, { color: accent }]}>{settings.badge}</Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* ═══ CUSTOMIZATION SECTIONS ═══ */}

        {/* 1. Titular */}
        <Section title="Titular de presentación" icon="text-outline" delay={180}>
          <TextInput
            value={settings.headline}
            onChangeText={(v) => setField("headline", v)}
            maxLength={80}
            placeholder="Escribe tu frase de presentación"
            placeholderTextColor={colors.text.tertiary}
            style={s.input}
          />
          <Text style={s.inputHint}>{settings.headline.length}/80 — Visible debajo de tu tarjeta</Text>
        </Section>

        {/* 2. Tema (gradiente de fondo) */}
        <Section title="Tema de fondo" icon="color-filter-outline" delay={220}>
          <View style={s.themeGrid}>
            {CARD_THEMES.map((theme) => {
              const active = theme.id === settings.themeId;
              return (
                <Pressable key={theme.id} onPress={() => setField("themeId", theme.id)} style={s.themeItem}>
                  <LinearGradient
                    colors={theme.gradient}
                    style={[s.themePreview, active && { borderColor: accent, borderWidth: 2 }]}
                  >
                    <Ionicons name={theme.icon as any} size={18} color={active ? accent : colors.text.tertiary} />
                  </LinearGradient>
                  <Text style={[s.themeName, active && { color: accent }]}>{theme.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* 3. Color de acento */}
        <Section title="Color de acento" icon="color-palette-outline" delay={260}>
          <View style={s.accentGrid}>
            {ACCENT_COLORS.map((a) => {
              const active = a.color === settings.accentColor;
              return (
                <Pressable key={a.color} onPress={() => setField("accentColor", a.color)} style={s.accentItem}>
                  <View style={[s.accentCircle, { backgroundColor: a.color }, active && s.accentCircleActive]}>
                    {active && <Ionicons name="checkmark" size={14} color="#0A1628" />}
                  </View>
                  <Text style={[s.accentName, active && { color: accent }]}>{a.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* 4. Marco visual */}
        <Section title="Marco visual" icon="scan-outline" delay={300}>
          <View style={s.frameGrid}>
            {FRAME_OPTIONS.map((frame) => {
              const active = frame.id === settings.frameId;
              return (
                <Pressable key={frame.id} onPress={() => setField("frameId", frame.id)} style={[s.frameChip, active && s.frameChipActive]}>
                  <View style={[s.frameDot, { backgroundColor: frame.border }]} />
                  <Text style={[s.frameLabel, active && s.frameLabelActive]}>{frame.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* 5. Badge de perfil */}
        <Section title="Badge de perfil" icon="ribbon-outline" delay={340}>
          <View style={s.badgeGrid}>
            {BADGE_OPTIONS.map((label) => {
              const active = label === settings.badge;
              return (
                <Pressable key={label} onPress={() => setField("badge", label)} style={[s.badgeChip, active && s.badgeChipActive]}>
                  <Text style={[s.badgeText, active && s.badgeTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* 6. Estilo de fuente */}
        <Section title="Estilo de texto" icon="text-outline" delay={380}>
          <View style={s.fontGrid}>
            {FONT_STYLES.map((fs) => {
              const active = fs === settings.fontStyle;
              const labels: Record<string, string> = { default: "Normal", elegant: "Elegante", bold: "Bold", mono: "Mono" };
              return (
                <Pressable key={fs} onPress={() => setField("fontStyle", fs)} style={[s.fontChip, active && s.fontChipActive]}>
                  <Text style={[s.fontChipText, active && s.fontChipTextActive]}>{labels[fs]}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        {/* 7. Visibilidad */}
        <Section title="Contenido visible" icon="eye-outline" delay={420}>
          <View style={s.switchRow}>
            <Text style={s.switchLabel}>Mostrar estadísticas</Text>
            <Switch value={settings.showStats} onValueChange={(v) => setField("showStats", v)} trackColor={{ true: accent, false: "rgba(255,255,255,0.1)" }} />
          </View>
          <View style={s.divider} />
          <View style={s.switchRow}>
            <Text style={s.switchLabel}>Mostrar destino</Text>
            <Switch value={settings.showDestination} onValueChange={(v) => setField("showDestination", v)} trackColor={{ true: accent, false: "rgba(255,255,255,0.1)" }} />
          </View>
        </Section>

        {/* ── Tips ── */}
        <Animated.View entering={FadeInDown.delay(460).springify()} style={s.tipsCard}>
          <Text style={s.tipsTitle}>💡 Tips para destacar</Text>
          <Text style={s.tipsText}>• Usa un titular breve (8-10 palabras máx.).</Text>
          <Text style={s.tipsText}>• Combina tema y color según tu personalidad.</Text>
          <Text style={s.tipsText}>• Revisa la cara trasera para validar bio e idiomas.</Text>
        </Animated.View>
      </ScrollView>

      {/* ── Footer save ── */}
      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable onPress={onSave} style={s.saveBtn}>
          <LinearGradient colors={["#FFD700", "#FF8C35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveGradient}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#0A1628" />
            <Text style={s.saveBtnText}>Guardar tarjeta</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  headerCenter: { alignItems: "center" },
  headerEyebrow: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1.2,
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    color: colors.text.primary,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,215,0,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.15)",
  },
  infoPillText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  previewFrame: {
    padding: spacing.xs,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    backgroundColor: "rgba(255,255,255,0.02)",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  cardWrap: {
    width: "100%",
    height: FLIP_CARD_HEIGHT,
  },
  previewLegend: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
  },
  previewLegendText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  liveInfo: {
    alignItems: "center",
    gap: 6,
  },
  liveHeadline: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  liveBadgeText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
  },
  section: {
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 13,
    color: colors.text.primary,
  },
  input: {
    marginHorizontal: spacing.sm,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.primary,
  },
  inputHint: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  themeItem: { alignItems: "center", width: "22%" },
  themePreview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radii.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  themeName: {
    marginTop: 4,
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
    textAlign: "center",
  },
  accentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  accentItem: { alignItems: "center", gap: 4 },
  accentCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  accentCircleActive: {
    borderWidth: 3,
    borderColor: "#FFF",
  },
  accentName: {
    fontFamily: typography.families.body,
    fontSize: 9,
    color: colors.text.tertiary,
  },
  frameGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  frameChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  frameChipActive: {
    borderColor: "rgba(255,215,0,0.4)",
    backgroundColor: "rgba(255,215,0,0.1)",
  },
  frameDot: { width: 10, height: 10, borderRadius: 5 },
  frameLabel: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  frameLabelActive: {
    color: colors.eu.star,
    fontFamily: typography.families.bodyMedium,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  badgeChip: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  badgeChipActive: {
    borderColor: "rgba(255,215,0,0.35)",
    backgroundColor: "rgba(255,215,0,0.08)",
  },
  badgeText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  badgeTextActive: {
    color: colors.eu.star,
    fontFamily: typography.families.bodyMedium,
  },
  fontGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
  },
  fontChip: {
    flex: 1,
    minWidth: "22%",
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 9,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  fontChipActive: {
    borderColor: "rgba(255,215,0,0.35)",
    backgroundColor: "rgba(255,215,0,0.08)",
  },
  fontChipText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  fontChipTextActive: {
    fontFamily: typography.families.bodyMedium,
    color: colors.eu.star,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  switchLabel: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: spacing.sm,
  },
  tipsCard: {
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    gap: 5,
  },
  tipsTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: colors.text.primary,
  },
  tipsText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text.secondary,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: "rgba(4,6,26,0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  saveBtn: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  saveGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.lg,
  },
  saveBtnText: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: "#0A1628",
  },
});
