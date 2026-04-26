/**
 * ════════════════════════════════════════════════════
 *  FlipUserCard — 3D Flip Card for Discover / Profile
 *  European Glass · Reanimated 4 · Front/Back faces
 * ════════════════════════════════════════════════════
 */
import React, { useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import type { User } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const CARD_WIDTH = SCREEN_WIDTH - spacing.md * 2;
export const CARD_HEIGHT = CARD_WIDTH * 1.55;

/** Deterministic gradient from name */
const nameToGradient = (name: string): [string, string] => {
  const gradients: [string, string][] = [
    ["#1A2D4D", "#0D1F3C"],
    ["#132240", "#0A1628"],
    ["#1A2D4A", "#0F1E36"],
    ["#243858", "#132240"],
    ["#1E3250", "#142740"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

interface FlipUserCardProps {
  user: User;
  /** If true, card starts flipped to back */
  startFlipped?: boolean;
}

export default function FlipUserCard({
  user,
  startFlipped = false,
}: FlipUserCardProps): React.JSX.Element {
  const isFlipped = useSharedValue(startFlipped ? 1 : 0);

  const toggleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    isFlipped.value = withTiming(isFlipped.value === 0 ? 1 : 0, {
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, []);

  // ── Front face animation ──
  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(isFlipped.value, [0, 1], [0, 180], Extrapolation.CLAMP);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: "hidden" as const,
      opacity: isFlipped.value > 0.5 ? 0 : 1,
      zIndex: isFlipped.value > 0.5 ? 0 : 1,
    };
  });

  // ── Back face animation ──
  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(isFlipped.value, [0, 1], [180, 360], Extrapolation.CLAMP);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      backfaceVisibility: "hidden" as const,
      opacity: isFlipped.value > 0.5 ? 1 : 0,
      zIndex: isFlipped.value > 0.5 ? 1 : 0,
    };
  });

  // ── Edge glow during transition ──
  const glowStyle = useAnimatedStyle(() => {
    const progress = isFlipped.value;
    const glowIntensity = interpolate(
      progress,
      [0, 0.3, 0.5, 0.7, 1],
      [0, 0.6, 1, 0.6, 0],
      Extrapolation.CLAMP,
    );
    return {
      borderColor: `rgba(255, 215, 0, ${glowIntensity * 0.5})`,
      shadowColor: "#FFD700",
      shadowOpacity: glowIntensity * 0.4,
      shadowRadius: glowIntensity * 20,
    };
  });

  const fullName = `${user.firstName} ${user.lastName}`;
  const destination = [user.destinationCity, user.destinationCountry].filter(Boolean).join(", ");
  const universityName = user.hostUniversity?.name ?? user.homeUniversity?.name;
  const placeholderColors = nameToGradient(fullName);

  const hasInterests = (user.interests?.length ?? 0) > 0;
  const hasLanguages = (user.languages?.length ?? 0) > 0;

  // Compatibility score
  const compatibilityScore = Math.min(
    100,
    (hasInterests ? 35 : 0) +
      (hasLanguages ? 25 : 0) +
      (!!user.destinationCity ? 25 : 0) +
      (universityName ? 15 : 0),
  );

  return (
    <Pressable onPress={toggleFlip} style={{ flex: 1 }}>
      <Animated.View style={[styles.cardContainer, glowStyle]}>
        {/* ══ FRONT FACE ══ */}
        <Animated.View style={[styles.card, frontStyle]}>
          {/* Photo area (60%) */}
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
              colors={["transparent", "rgba(4,6,26,0.95)"]}
              style={styles.photoGradient}
            />
            <View style={styles.nameOverlay}>
              <Text style={styles.name} numberOfLines={1}>{fullName}</Text>
              {destination ? (
                <View style={styles.destRow}>
                  <Ionicons name="location-outline" size={13} color={colors.eu.star} />
                  <Text style={styles.destination} numberOfLines={1}>{destination}</Text>
                </View>
              ) : null}
            </View>
            {/* Tap hint */}
            <View style={styles.flipHint}>
              <Ionicons name="sync-outline" size={12} color="rgba(255,215,0,0.6)" />
              <Text style={styles.flipHintText}>Toca para ver más</Text>
            </View>
          </View>

          {/* Info area (40%) */}
          <View style={styles.infoContainer}>
            {universityName ? (
              <View style={styles.infoRow}>
                <Ionicons name="school-outline" size={16} color={colors.eu.star} />
                <Text style={styles.infoText} numberOfLines={1}>{universityName}</Text>
              </View>
            ) : null}
            {/* Compatibility */}
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
                  style={[styles.compatFill, { width: `${compatibilityScore}%` as any }]}
                />
              </View>
            </View>
            {/* Interest chips */}
            {hasInterests ? (
              <View style={styles.chipsRow}>
                {user.interests!.slice(0, 4).map((interest) => (
                  <View key={interest.id} style={styles.chip}>
                    <Text style={styles.chipText}>{interest.name}</Text>
                  </View>
                ))}
                {user.interests!.length > 4 ? (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>+{user.interests!.length - 4}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </Animated.View>

        {/* ══ BACK FACE ══ */}
        <Animated.View style={[styles.card, styles.cardAbsolute, backStyle]}>
          <LinearGradient
            colors={["rgba(255,215,0,0.06)", "rgba(19,34,64,0.97)", "rgba(10,22,40,0.99)"]}
            style={styles.backGradient}
          >
            {/* Header */}
            <View style={styles.backHeader}>
              <Text style={styles.backName}>{fullName}</Text>
              <View style={styles.flipHint}>
                <Ionicons name="sync-outline" size={12} color="rgba(255,215,0,0.6)" />
                <Text style={styles.flipHintText}>Volver</Text>
              </View>
            </View>

            {/* Bio */}
            {user.bio ? (
              <View style={styles.backSection}>
                <Text style={styles.backSectionTitle}>Sobre mí</Text>
                <Text style={styles.backBio}>{user.bio}</Text>
              </View>
            ) : null}

            {/* Languages with levels */}
            {hasLanguages ? (
              <View style={styles.backSection}>
                <Text style={styles.backSectionTitle}>🗣 Idiomas</Text>
                {user.languages!.slice(0, 3).map((lang) => (
                  <View key={lang.id} style={styles.langRow}>
                    <Text style={styles.langName}>{lang.name}</Text>
                    <View style={styles.langBarBg}>
                      <View
                        style={[
                          styles.langBarFill,
                          {
                            width: `${
                              lang.proficiencyLevel === "NATIVE" ? 100
                              : lang.proficiencyLevel === "ADVANCED" ? 80
                              : lang.proficiencyLevel === "INTERMEDIATE" ? 55
                              : 30
                            }%` as any,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.langLevel}>
                      {lang.proficiencyLevel === "NATIVE" ? "Nativo"
                       : lang.proficiencyLevel === "ADVANCED" ? "Avanzado"
                       : lang.proficiencyLevel === "INTERMEDIATE" ? "Intermedio"
                       : "Básico"}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Interests as colored chips */}
            {hasInterests ? (
              <View style={styles.backSection}>
                <Text style={styles.backSectionTitle}>💫 Intereses</Text>
                <View style={styles.chipsRow}>
                  {user.interests!.slice(0, 5).map((interest) => (
                    <View key={interest.id} style={styles.backChip}>
                      <Text style={styles.backChipText}>
                        {interest.icon ?? "✦"} {interest.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* University */}
            {universityName ? (
              <View style={styles.backUniRow}>
                <Ionicons name="school" size={14} color="rgba(255,215,0,0.5)" />
                <Text style={styles.backUniText}>{universityName}</Text>
              </View>
            ) : null}
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    height: "100%",
    borderRadius: radii.xl,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.10)",
    elevation: 8,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: "rgba(4,6,26,0.95)",
  },
  cardAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
  },

  // Front Face
  photoContainer: { height: "60%", position: "relative" },
  photo: { width: "100%", height: "100%" },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitial: {
    fontFamily: typography.families.heading,
    fontSize: 72,
    color: "rgba(255,255,255,0.25)",
  },
  photoGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
  },
  nameOverlay: {
    position: "absolute",
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  name: {
    fontFamily: typography.families.heading,
    fontSize: 24,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  destRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  destination: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
  flipHint: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.2)",
  },
  flipHintText: {
    color: "rgba(255,215,0,0.6)",
    fontSize: 10,
    fontWeight: "600",
  },
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
    fontSize: 13,
    color: colors.text.secondary,
    flex: 1,
  },
  compatSection: { marginBottom: spacing.xs },
  compatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  compatLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.text.secondary,
  },
  compatValue: {
    fontFamily: typography.families.subheading,
    fontSize: 13,
    color: colors.eu.star,
    textShadowColor: "rgba(255,215,0,0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  compatBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  compatFill: { height: "100%", borderRadius: 2 },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: "rgba(255,215,0,0.1)",
    borderRadius: radii.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.25)",
  },
  chipText: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: "#FFD700",
  },

  // Back Face
  backGradient: {
    flex: 1,
    padding: spacing.lg,
  },
  backHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  backName: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.text.primary,
    flex: 1,
  },
  backSection: { marginBottom: spacing.md },
  backSectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 13,
    color: "rgba(255,215,0,0.7)",
    marginBottom: spacing.sm,
  },
  backBio: {
    fontFamily: typography.families.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text.secondary,
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  langName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
    width: 80,
  },
  langBarBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  langBarFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#4FD1C5",
  },
  langLevel: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
    width: 65,
    textAlign: "right",
  },
  backChip: {
    backgroundColor: "rgba(255,215,0,0.12)",
    borderRadius: radii.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.3)",
  },
  backChipText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: "#FFD700",
  },
  backUniRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: "auto",
    paddingTop: spacing.sm,
  },
  backUniText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
  },
});
