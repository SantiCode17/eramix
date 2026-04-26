import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import type { User } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
export const CARD_HEIGHT = CARD_WIDTH * 1.4;

/** Genera un par de colores gradient determinista a partir del nombre
 *  SOLO usa colores del design system — nunca azules brillantes */
const nameToGradient = (name: string): [string, string] => {
  const gradients: [string, string][] = [
    ["#1A2D4D", "#0D1F3C"], // navy — default
    ["#132240", "#0A1628"], // deep navy
    ["#1A2D4A", "#0F1E36"], // navy surface
    ["#243858", "#132240"], // navy border → card
    ["#1E3250", "#142740"], // navy mid-tone
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

interface UserCardProps {
  user: User;
}

export default function UserCard({
  user,
}: UserCardProps): React.JSX.Element {
  const fullName = `${user.firstName} ${user.lastName}`;
  const destination = [user.destinationCity, user.destinationCountry]
    .filter(Boolean)
    .join(", ");
  const universityName =
    user.hostUniversity?.name ?? user.homeUniversity?.name;

  const hasInterests = (user.interests?.length ?? 0) > 0;
  const hasLanguages = (user.languages?.length ?? 0) > 0;
  const hasDestination = !!user.destinationCity;
  const compatibilityScore = Math.min(
    100,
    (hasInterests ? 35 : 0) +
      (hasLanguages ? 25 : 0) +
      (hasDestination ? 25 : 0) +
      (universityName ? 15 : 0),
  );

  const placeholderColors = nameToGradient(fullName);

  return (
    <View style={styles.card}>
      {/* Photo area (60% of card) */}
      <View style={styles.photoContainer}>
        {user.profilePhotoUrl ? (
          <Image
            source={{ uri: resolveMediaUrl(user.profilePhotoUrl) }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={placeholderColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.photoPlaceholder}
          >
            <Text style={styles.photoInitial}>
              {user.firstName?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </LinearGradient>
        )}
        <LinearGradient
          colors={["transparent", "rgba(4,6,26,0.92)"]}
          style={styles.photoGradient}
        />
        {/* Name overlay on photo */}
        <View style={styles.nameOverlay}>
          <Text style={styles.name} numberOfLines={1}>
            {fullName}
          </Text>
          {destination ? (
            <Text style={styles.destination} numberOfLines={1}>
              <Ionicons name="location-outline" size={12} color={colors.eu.star} />{" "}
              {destination}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Info area (40% of card) */}
      <View style={styles.infoContainer}>
        {/* University */}
        {universityName ? (
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={16} color={colors.eu.star} />
            <Text style={styles.infoText} numberOfLines={1}>
              {universityName}
            </Text>
          </View>
        ) : null}

        {/* Compatibility bar */}
        <View style={styles.compatSection}>
          <View style={styles.compatHeader}>
            <Text style={styles.compatLabel}>Afinidad</Text>
            <Text style={styles.compatValue}>{compatibilityScore}%</Text>
          </View>
          <View style={styles.compatBar}>
            <LinearGradient
              colors={[...colors.gradient.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.compatFill,
                { width: `${compatibilityScore}%` as unknown as number },
              ]}
            />
          </View>
        </View>

        {/* Interest chips */}
        {hasInterests ? (
          <View style={styles.chipsRow}>
            {user.interests!.slice(0, 4).map((interest) => (
              <View key={interest.id} style={styles.chip}>
                <Text style={styles.chipText}>
                  {interest.name}
                </Text>
              </View>
            ))}
            {user.interests!.length > 4 ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  +{user.interests!.length - 4}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Language badges */}
        {hasLanguages ? (
          <View style={styles.languagesRow}>
            {user.languages!.slice(0, 3).map((lang) => (
              <View key={lang.id} style={styles.langBadge}>
                <Text style={styles.langText}>{lang.name}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: "rgba(4,6,26,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    ...shadows.glass,
  },
  // Photo
  photoContainer: {
    height: "60%",
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitial: {
    fontFamily: typography.families.heading,
    fontSize: 72,
    color: "rgba(255,255,255,0.3)",
  },
  photoGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  nameOverlay: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  name: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.text.primary,
  },
  destination: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  // Info
  infoContainer: {
    height: "40%",
    padding: spacing.md,
    justifyContent: "space-between",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    flex: 1,
  },
  // Compatibility
  compatSection: {
    marginBottom: spacing.xs,
  },
  compatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xxs,
  },
  compatLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  compatValue: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.eu.star,
  },
  compatBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  compatFill: {
    height: "100%",
    borderRadius: 2,
  },
  // Chips
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  chip: {
    backgroundColor: "rgba(255,215,0,0.1)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
  },
  chipText: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: "#FFD700",
  },
  // Languages
  languagesRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  langBadge: {
    backgroundColor: "rgba(255,109,63,0.12)",
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderWidth: 1,
    borderColor: "rgba(255,109,63,0.3)",
  },
  langText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: "#FF6D3F",
  },
});
