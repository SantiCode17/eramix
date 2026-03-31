import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { Challenge, ChallengesStackParamList } from "@/types/challenges";
import * as challengeApi from "@/api/challenges";

type Nav = StackNavigationProp<ChallengesStackParamList, "ChallengesList">;

export default function ChallengesListScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try { setChallenges(await challengeApi.getActiveChallenges()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const renderItem = useCallback(
    ({ item, index }: { item: Challenge; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
        <Pressable
          style={styles.card}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            nav.navigate("ChallengeDetail", { challengeId: item.id });
          }}
        >
          <Text style={styles.emoji}>{item.emoji}</Text>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>📸 {item.submissionCount} fotos</Text>
              <Text style={styles.meta}>
                ⏰ {new Date(item.endDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    ), [nav],
  );

  return (
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📸 Retos Fotográficos</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      ) : (
        <FlashList
          data={challenges}
          renderItem={renderItem}
          keyExtractor={(i) => String(i.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.eu.star} colors={[colors.eu.star]} />}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 80 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 64 }}>📷</Text>
              <Text style={styles.emptyTitle}>No hay retos activos</Text>
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
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: { ...typography.sizes.h2, fontFamily: typography.families.heading, color: colors.text.primary },
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.glass.white, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.glass.border,
    padding: spacing.md, marginBottom: spacing.md,
  },
  emoji: { fontSize: 40 },
  title: { fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  desc: { fontFamily: typography.families.body, ...typography.sizes.small, color: colors.text.secondary, marginTop: spacing.xxs },
  metaRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm },
  meta: { fontFamily: typography.families.body, ...typography.sizes.small, color: colors.text.secondary },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing.xxl },
  emptyTitle: { fontFamily: typography.families.heading, ...typography.sizes.h3, color: colors.text.primary, marginTop: spacing.md },
});
