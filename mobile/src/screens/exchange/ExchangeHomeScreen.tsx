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
import type { ExchangeSession, ExchangeStackParamList } from "@/types/exchange";
import * as exchangeApi from "@/api/exchange";
import { handleError } from "@/utils/errorHandler";

type Nav = StackNavigationProp<ExchangeStackParamList, "ExchangeHome">;

export default function ExchangeHomeScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [sessions, setSessions] = useState<ExchangeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try { setError(null); setSessions(await exchangeApi.getMySessions()); }
    catch (e) { setError(handleError(e, "ExchangeHome.getMySessions")); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetch(); }, [fetch]);

  const renderSession = useCallback(
    ({ item, index }: { item: ExchangeSession; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
        <Pressable
          style={styles.card}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            nav.navigate("ExchangeSessionDetail", { sessionId: item.id });
          }}
        >
          <View style={styles.cardRow}>
            <View style={styles.langBadge}>
              <Text style={styles.langText}>{item.offerLanguageName}</Text>
            </View>
            <Text style={styles.arrow}>⇄</Text>
            <View style={styles.langBadge}>
              <Text style={styles.langText}>{item.wantLanguageName}</Text>
            </View>
          </View>
          <Text style={styles.partnerName}>
            {item.userAFirstName} {item.userALastName} & {item.userBFirstName} {item.userBLastName}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.statusBadge}>{item.status}</Text>
            {item.scheduledAt && (
              <Text style={styles.dateText}>
                {new Date(item.scheduledAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </Pressable>
      </Animated.View>
    ),
    [nav],
  );

  return (
    <LinearGradient
      colors={[colors.background.start, colors.background.end]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Intercambio de Idiomas</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.actionBtn} onPress={() => nav.navigate("FindPartner")}>
          <Text style={styles.actionEmoji}>🔍</Text>
          <Text style={styles.actionLabel}>Buscar</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => nav.navigate("ExchangeRequests")}>
          <Text style={styles.actionEmoji}>📩</Text>
          <Text style={styles.actionLabel}>Solicitudes</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      ) : error ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>⚠️</Text>
          <Text style={styles.emptyTitle}>Error al cargar sesiones</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <Pressable style={styles.actionBtn} onPress={() => { setLoading(true); fetch(); }}>
            <Text style={styles.actionLabel}>Reintentar</Text>
          </Pressable>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 64 }}>🗣️</Text>
          <Text style={styles.emptyTitle}>Sin sesiones aún</Text>
          <Text style={styles.emptySubtitle}>Busca un compañero y empieza a practicar idiomas</Text>
        </View>
      ) : (
        <FlashList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(i) => String(i.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.eu.star} colors={[colors.eu.star]} />}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 80 }}
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
  actions: { flexDirection: "row", paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.md },
  actionBtn: {
    flex: 1, backgroundColor: colors.glass.white, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.glass.border, padding: spacing.md,
    alignItems: "center", gap: spacing.xs,
  },
  actionEmoji: { fontSize: 28 },
  actionLabel: { fontFamily: typography.families.bodyMedium, ...typography.sizes.caption, color: colors.text.primary },
  card: {
    backgroundColor: colors.glass.white, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.glass.border,
    padding: spacing.md, marginBottom: spacing.md,
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  langBadge: {
    backgroundColor: colors.eu.star + "20", paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs, borderRadius: radii.full,
  },
  langText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.small, color: colors.eu.star },
  arrow: { ...typography.sizes.body, color: colors.text.secondary },
  partnerName: { fontFamily: typography.families.body, ...typography.sizes.caption, color: colors.text.secondary, marginTop: spacing.sm },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
  statusBadge: { fontFamily: typography.families.bodyMedium, ...typography.sizes.small, color: colors.status.info },
  dateText: { fontFamily: typography.families.body, ...typography.sizes.small, color: colors.text.secondary },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: spacing.xl },
  emptyTitle: { fontFamily: typography.families.heading, ...typography.sizes.h3, color: colors.text.primary, marginTop: spacing.md, textAlign: "center" },
  emptySubtitle: { fontFamily: typography.families.body, ...typography.sizes.body, color: colors.text.secondary, textAlign: "center", marginTop: spacing.sm },
});
