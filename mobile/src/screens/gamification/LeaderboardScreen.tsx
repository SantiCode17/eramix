import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, Image,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { LeaderboardEntry } from "@/types/gamification";
import * as gamificationApi from "@/api/gamification";
import { handleError } from "@/utils/errorHandler";

export default function LeaderboardScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try { setError(null); setEntries(await gamificationApi.getLeaderboard()); }
    catch (e) { setError(handleError(e, "Leaderboard.getLeaderboard")); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const medalIcon = (rank: number): { name: string; color: string } | null => {
    if (rank === 1) return { name: "medal", color: "#FFD700" };
    if (rank === 2) return { name: "medal", color: "#C0C0C0" };
    if (rank === 3) return { name: "medal", color: "#CD7F32" };
    return null;
  };

  const renderItem = useCallback(
    ({ item, index }: { item: LeaderboardEntry; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 40).duration(400)}>
        <View style={[styles.card, item.rank <= 3 && styles.cardTop]}>
          <Text style={styles.rank}>
            {medalIcon(item.rank) ? (
              <Ionicons name="medal-outline" size={20} color={medalIcon(item.rank)!.color} />
            ) : `#${item.rank}`}
          </Text>
          {item.profilePhotoUrl ? (
            <Image source={{ uri: item.profilePhotoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPh]}>
              <Text style={styles.avatarText}>{item.firstName?.[0] ?? "?"}</Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
            <Text style={styles.levelText}>Nivel {item.level}</Text>
          </View>
          <Text style={styles.xp}>{item.totalXp} XP</Text>
        </View>
      </Animated.View>
    ), [],
  );

  return (
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}><Text style={{ fontSize: 22 }}>←</Text></Pressable>
        <Text style={styles.headerTitle}>Clasificación</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      ) : (
        <FlashList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(i) => String(i.userId)}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 40 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="trophy-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyTitle}>Aún no hay clasificación</Text>
            </View>
          }
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
  cardTop: { borderColor: colors.eu.star + "60" },
  rank: { fontSize: 20, width: 40, textAlign: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarPh: { backgroundColor: colors.eu.mid, justifyContent: "center", alignItems: "center" },
  avatarText: { fontFamily: typography.families.subheading, ...typography.sizes.caption, color: colors.text.primary },
  name: { fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  levelText: { fontFamily: typography.families.body, ...typography.sizes.bodySmall, color: colors.text.secondary },
  xp: { fontFamily: typography.families.bodyBold, ...typography.sizes.caption, color: colors.eu.star },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing.xxl },
  emptyTitle: { fontFamily: typography.families.heading, ...typography.sizes.h3, color: colors.text.primary, marginTop: spacing.md },
});
