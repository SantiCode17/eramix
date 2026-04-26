import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { CarouselUserCard, FLIP_CARD_HEIGHT } from "@/screens/discover/components";
import { toProfileCardUser } from "./utils/profileCardUser";

type Props = {
  profile: any;
  onEditPress: () => void;
  onOpenARPress?: () => void;
};

function InfoPill({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={st.infoPill}>
      <Ionicons name={icon} size={14} color={colors.eu.star} />
      <View>
        <Text style={st.infoLabel}>{label}</Text>
        <Text style={st.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export function CardTabScreen({ profile, onEditPress, onOpenARPress }: Props): React.JSX.Element {
  const cardUser = useMemo(() => toProfileCardUser(profile), [profile]);

  const hostUniversity = profile?.hostUniversity?.name ?? "Sin universidad de acogida";
  const mobility = profile?.mobilityStartDate
    ? new Date(profile.mobilityStartDate).toLocaleDateString("es-ES", { month: "short", year: "numeric" })
    : "Pendiente";
  const languageCount = String(profile?.languages?.length ?? 0);

  return (
    <View style={st.container}>
      <Animated.View entering={FadeInDown.delay(80).springify()} style={st.heroCard}>
        <Text style={st.heroTitle}>Tu tarjeta oficial Eramix</Text>
        <Text style={st.heroSubtitle}>
          Es la misma tarjeta que aparece en Inicio para descubrir perfiles.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).springify()} style={st.cardFrame}>
        <View style={st.cardWrap}>
          <CarouselUserCard user={cardUser} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()} style={st.infoRow}>
        <InfoPill icon="school-outline" label="Universidad" value={hostUniversity} />
        <InfoPill icon="calendar-outline" label="Movilidad" value={mobility} />
        <InfoPill icon="language-outline" label="Idiomas" value={languageCount} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).springify()} style={st.actions}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onEditPress();
          }}
          style={st.primaryAction}
        >
          <LinearGradient
            colors={["#FFD700", "#FF8C35"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={st.primaryActionGradient}
          >
            <Ionicons name="color-palette-outline" size={18} color="#0A1628" />
            <Text style={st.primaryActionText}>Crear y personalizar tarjeta</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => {
            if (!onOpenARPress) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpenARPress();
          }}
          style={[st.secondaryAction, !onOpenARPress && st.secondaryActionDisabled]}
          disabled={!onOpenARPress}
        >
          <Ionicons name="sparkles-outline" size={16} color={colors.text.primary} />
          <Text style={st.secondaryActionText}>Vista holográfica</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  heroCard: {
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  heroTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.text.primary,
  },
  heroSubtitle: {
    marginTop: 6,
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
  cardFrame: {
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardWrap: {
    width: "100%",
    height: FLIP_CARD_HEIGHT,
  },
  infoRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  infoPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  infoLabel: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
    textTransform: "uppercase",
  },
  infoValue: {
    marginTop: 1,
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: colors.text.primary,
  },
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  primaryAction: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  primaryActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  primaryActionText: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: "#0A1628",
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 12,
  },
  secondaryActionDisabled: {
    opacity: 0.55,
  },
  secondaryActionText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
  },
});
