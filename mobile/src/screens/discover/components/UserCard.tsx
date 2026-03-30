import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import type { User } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
export const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface UserCardProps {
  user: User;
  onSendRequest?: () => void;
  onDismiss?: () => void;
  onViewProfile?: () => void;
}

export default function UserCard({
  user,
  onSendRequest,
  onDismiss,
  onViewProfile,
}: UserCardProps): React.JSX.Element {
  const fullName = `${user.firstName} ${user.lastName}`;
  const destination = [user.destinationCity, user.destinationCountry]
    .filter(Boolean)
    .join(", ");
  const universityName =
    user.hostUniversity?.name ?? user.homeUniversity?.name;

  // Compute a simple "compatibility" score based on shared data
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

  return (
    <View style={styles.card}>
      {/* Photo area (60% of card) */}
      <View style={styles.photoContainer}>
        {user.profilePhotoUrl ? (
          <Image
            source={{ uri: user.profilePhotoUrl }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoInitial}>
              {user.firstName?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
        )}
        <LinearGradient
          colors={["transparent", "rgba(26, 26, 46, 0.95)"]}
          style={styles.photoGradient}
        />
        {/* Name overlay on photo */}
        <View style={styles.nameOverlay}>
          <Text style={styles.name} numberOfLines={1}>
            {fullName}
          </Text>
          {destination ? (
            <Text style={styles.destination} numberOfLines={1}>
              📍 {destination}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Info area (40% of card) */}
      <View style={styles.infoContainer}>
        {/* University */}
        {universityName ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>🎓</Text>
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
              colors={[colors.accent.start, colors.accent.end]}
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
                  {interest.icon ?? "✨"} {interest.name}
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

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            onPress={onDismiss}
            style={[styles.actionBtn, styles.dismissBtn]}
          >
            <Text style={styles.actionEmoji}>✕</Text>
          </Pressable>

          <Pressable
            onPress={onViewProfile}
            style={[styles.actionBtn, styles.profileBtn]}
          >
            <Text style={styles.actionEmoji}>👤</Text>
          </Pressable>

          <Pressable
            onPress={onSendRequest}
            style={[styles.actionBtn, styles.connectBtn]}
          >
            <Text style={styles.actionEmoji}>⭐</Text>
          </Pressable>
        </View>
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
    backgroundColor: "rgba(26, 26, 46, 0.95)",
    borderWidth: 1,
    borderColor: colors.glass.border,
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
    backgroundColor: colors.eu.deep,
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitial: {
    fontFamily: typography.families.heading,
    fontSize: 64,
    color: colors.eu.star,
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
    marginBottom: spacing.xs,
  },
  infoEmoji: {
    fontSize: 16,
    marginRight: spacing.xs,
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
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.secondary,
  },
  compatValue: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.small.fontSize,
    color: colors.eu.star,
  },
  compatBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  chipText: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.secondary,
  },
  // Languages
  languagesRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  langBadge: {
    backgroundColor: "rgba(0, 51, 153, 0.3)",
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderWidth: 1,
    borderColor: "rgba(0, 51, 153, 0.5)",
  },
  langText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: colors.eu.light,
  },
  // Actions
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dismissBtn: {
    backgroundColor: "rgba(244, 67, 54, 0.15)",
    borderColor: "rgba(244, 67, 54, 0.3)",
  },
  profileBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  connectBtn: {
    backgroundColor: "rgba(255, 204, 0, 0.15)",
    borderColor: "rgba(255, 204, 0, 0.3)",
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  actionEmoji: {
    fontSize: 20,
  },
});
