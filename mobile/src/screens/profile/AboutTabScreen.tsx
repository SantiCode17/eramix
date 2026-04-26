import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors, typography, spacing, radii } from "@/design-system/tokens";

type Props = { profile: any };

function formatMonthYear(date?: string): string {
  if (!date) return "Pendiente";
  return new Date(date).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
}

function calcMobilityMonths(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const a = new Date(start);
  const b = new Date(end);
  return Math.max(0, (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth());
}

function Section({ title, icon, children, delay }: { title: string; icon: keyof typeof Ionicons.glyphMap; children: React.ReactNode; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={st.section}>
      <View style={st.sectionHeader}>
        <Ionicons name={icon} size={16} color={colors.eu.star} />
        <Text style={st.sectionTitle}>{title}</Text>
      </View>
      <View style={st.sectionBody}>{children}</View>
    </Animated.View>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={st.dataRow}>
      <Text style={st.dataLabel}>{label}</Text>
      <Text style={st.dataValue}>{value}</Text>
    </View>
  );
}

export function AboutTabScreen({ profile }: Props): React.JSX.Element {
  const mobilityMonths = useMemo(
    () => calcMobilityMonths(profile?.mobilityStartDate, profile?.mobilityEndDate),
    [profile?.mobilityStartDate, profile?.mobilityEndDate],
  );

  const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "Tu Perfil";
  const location = [profile?.destinationCity, profile?.destinationCountry].filter(Boolean).join(", ") || "No definida";
  const homeUni = profile?.homeUniversity?.name ?? "No indicada";
  const hostUni = profile?.hostUniversity?.name ?? "No indicada";

  return (
    <View style={st.container}>
      <Section title="Resumen" icon="person-outline" delay={80}>
        <DataRow label="Nombre" value={fullName} />
        <DataRow label="Ubicación Erasmus" value={location} />
        <DataRow label="Bio" value={profile?.bio?.trim() || "Añade una bio en Editar Perfil para presentarte mejor."} />
      </Section>

      <Section title="Universidades" icon="school-outline" delay={140}>
        <DataRow label="Origen" value={homeUni} />
        <DataRow label="Destino" value={hostUni} />
      </Section>

      <Section title="Movilidad" icon="calendar-outline" delay={200}>
        <View style={st.timelineWrap}>
          <View style={st.timelineRail}>
            <View style={st.timelineDot} />
            <View style={st.timelineLine} />
            <View style={st.timelineDot} />
          </View>
          <View style={{ flex: 1, gap: spacing.sm }}>
            <View>
              <Text style={st.timelineLabel}>Inicio</Text>
              <Text style={st.timelineValue}>{formatMonthYear(profile?.mobilityStartDate)}</Text>
            </View>
            <View>
              <Text style={st.timelineLabel}>Fin</Text>
              <Text style={st.timelineValue}>{formatMonthYear(profile?.mobilityEndDate)}</Text>
            </View>
          </View>
        </View>
        <View style={st.mobilityBadge}>
          <Ionicons name="time-outline" size={14} color={colors.eu.star} />
          <Text style={st.mobilityBadgeText}>Duración estimada: {mobilityMonths} meses</Text>
        </View>
      </Section>

      <Section title="Idiomas e intereses" icon="sparkles-outline" delay={260}>
        <View style={st.pillGroup}>
          {(profile?.languages ?? []).slice(0, 8).map((lang: any) => (
            <View key={`lang-${lang.id}-${lang.code}`} style={st.langPill}>
              <Text style={st.langPillText}>{lang.name}</Text>
              <Text style={st.langLevel}>{lang.proficiencyLevel}</Text>
            </View>
          ))}
          {(profile?.languages?.length ?? 0) === 0 && (
            <Text style={st.emptyText}>Aún no has definido idiomas.</Text>
          )}
        </View>

        <View style={[st.pillGroup, { marginTop: spacing.sm }]}>
          {(profile?.interests ?? []).slice(0, 10).map((interest: any) => (
            <View key={`interest-${interest.id}`} style={st.interestPill}>
              <Text style={st.interestPillText}>{interest.name}</Text>
            </View>
          ))}
          {(profile?.interests?.length ?? 0) === 0 && (
            <Text style={st.emptyText}>Aún no has definido intereses.</Text>
          )}
        </View>
      </Section>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
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
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: colors.text.primary,
  },
  sectionBody: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  dataRow: {
    gap: 4,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  dataLabel: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  dataValue: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  timelineWrap: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  timelineRail: {
    width: 18,
    alignItems: "center",
    marginTop: 2,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.eu.star,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    marginVertical: 2,
    backgroundColor: "rgba(255,215,0,0.35)",
  },
  timelineLabel: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: "uppercase",
  },
  timelineValue: {
    marginTop: 2,
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: colors.text.primary,
  },
  mobilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.25)",
    backgroundColor: "rgba(255,215,0,0.08)",
  },
  mobilityBadgeText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.eu.star,
  },
  pillGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  langPillText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.text.primary,
  },
  langLevel: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
  },
  interestPill: {
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,215,0,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.22)",
  },
  interestPillText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.eu.star,
  },
  emptyText: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.tertiary,
  },
});
