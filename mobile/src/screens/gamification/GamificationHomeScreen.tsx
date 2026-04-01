import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { UserProgress, GamificationStackParamList } from "@/types/gamification";
import * as gamificationApi from "@/api/gamification";
import { handleError } from "@/utils/errorHandler";

type Nav = StackNavigationProp<GamificationStackParamList, "GamificationHome">;

export default function GamificationHomeScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try { setError(null); setProgress(await gamificationApi.getProgress()); }
    catch (e) { setError(handleError(e, "Gamification.getProgress")); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Gamificación</Text>
      </View>

      {loading || !progress ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      ) : (
        <Animated.View entering={FadeInDown.duration(500)} style={styles.content}>
          {/* Level card */}
          <View style={styles.levelCard}>
            <Text style={styles.levelEmoji}>⭐</Text>
            <Text style={styles.levelNumber}>Nivel {progress.level}</Text>
            <View style={styles.xpBarOuter}>
              <View style={[styles.xpBarInner, { width: `${Math.min(progress.progressPercent, 100)}%` }]} />
            </View>
            <Text style={styles.xpText}>
              {progress.currentXp} / {progress.currentXp + progress.xpToNextLevel} XP
            </Text>
            <Text style={styles.totalXp}>{progress.totalXp} XP total</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🏅</Text>
              <Text style={styles.statValue}>{progress.achievementsUnlocked}</Text>
              <Text style={styles.statLabel}>Logros</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>📊</Text>
              <Text style={styles.statValue}>{progress.totalAchievements}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={() => nav.navigate("Achievements")}>
              <Text style={styles.actionEmoji}>🏅</Text>
              <Text style={styles.actionLabel}>Ver Logros</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => nav.navigate("Leaderboard")}>
              <Text style={styles.actionEmoji}>🏆</Text>
              <Text style={styles.actionLabel}>Clasificación</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: { ...typography.sizes.h2, fontFamily: typography.families.heading, color: colors.text.primary },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  levelCard: {
    backgroundColor: colors.glass.white, borderRadius: radii.xl, borderWidth: 1,
    borderColor: colors.glass.border, padding: spacing.xl, alignItems: "center",
  },
  levelEmoji: { fontSize: 48 },
  levelNumber: { fontFamily: typography.families.heading, ...typography.sizes.h1, color: colors.eu.star, marginTop: spacing.sm },
  xpBarOuter: {
    width: "100%", height: 12, backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radii.full, marginTop: spacing.md, overflow: "hidden",
  },
  xpBarInner: { height: "100%", backgroundColor: colors.eu.star, borderRadius: radii.full },
  xpText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.caption, color: colors.text.primary, marginTop: spacing.sm },
  totalXp: { fontFamily: typography.families.body, ...typography.sizes.small, color: colors.text.secondary, marginTop: spacing.xs },
  statsRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.glass.white, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.glass.border, padding: spacing.md, alignItems: "center",
  },
  statEmoji: { fontSize: 28 },
  statValue: { fontFamily: typography.families.heading, ...typography.sizes.h2, color: colors.text.primary, marginTop: spacing.xs },
  statLabel: { fontFamily: typography.families.body, ...typography.sizes.small, color: colors.text.secondary },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  actionBtn: {
    flex: 1, backgroundColor: colors.glass.white, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.glass.border, padding: spacing.md, alignItems: "center", gap: spacing.xs,
  },
  actionEmoji: { fontSize: 28 },
  actionLabel: { fontFamily: typography.families.bodyMedium, ...typography.sizes.caption, color: colors.text.primary },
});
