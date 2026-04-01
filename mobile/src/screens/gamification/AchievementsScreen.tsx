import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { Achievement } from "@/types/gamification";
import * as gamificationApi from "@/api/gamification";
import { handleError } from "@/utils/errorHandler";

export default function AchievementsScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try { setError(null); setAchievements(await gamificationApi.getAchievements()); }
    catch (e) { setError(handleError(e, "Achievements.getAchievements")); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const renderItem = useCallback(
    ({ item, index }: { item: Achievement; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <View style={[styles.card, !item.unlocked && styles.cardLocked]}>
          <Text style={styles.emoji}>{item.emoji}</Text>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={[styles.name, !item.unlocked && styles.nameLocked]}>{item.name}</Text>
            <Text style={styles.desc}>{item.description}</Text>
            <View style={styles.meta}>
              <Text style={styles.xp}>+{item.xpReward} XP</Text>
              {item.unlocked && (
                <Text style={styles.unlockedText}>✓ Desbloqueado</Text>
              )}
            </View>
          </View>
        </View>
      </Animated.View>
    ), [],
  );

  return (
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}><Text style={{ fontSize: 22 }}>←</Text></Pressable>
        <Text style={styles.headerTitle}>Logros</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      ) : (
        <FlashList
          data={achievements}
          renderItem={renderItem}
          keyExtractor={(i) => i.code}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 40 }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.glass.white, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.glass.border,
    padding: spacing.md, marginBottom: spacing.sm,
  },
  cardLocked: { opacity: 0.5 },
  emoji: { fontSize: 36 },
  name: { fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  nameLocked: { color: colors.text.secondary },
  desc: { fontFamily: typography.families.body, ...typography.sizes.small, color: colors.text.secondary, marginTop: spacing.xxs },
  meta: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.xs },
  xp: { fontFamily: typography.families.bodyMedium, ...typography.sizes.small, color: colors.eu.star },
  unlockedText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.small, color: colors.status.success },
});
