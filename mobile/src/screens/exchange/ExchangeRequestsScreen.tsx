import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import type { ExchangeRequest } from "@/types/exchange";
import * as exchangeApi from "@/api/exchange";
import { handleError } from "@/utils/errorHandler";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { CategoryTab } from "@/components";

export default function ExchangeRequestsScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);
      const data = tab === "received"
        ? await exchangeApi.getPendingReceived()
        : await exchangeApi.getSentRequests();
      setRequests(data);
    } catch (e) { setError(handleError(e, "ExchangeRequests.fetch")); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetch(); }, [fetch]);

  // Timeout: if loading for > 8s, show empty state
  const loadingTimedOut = useLoadingTimeout(loading, 8000);

  const handleAccept = async (id: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await exchangeApi.acceptRequest(id);
      fetch();
    } catch (e) { Alert.alert("Error al aceptar", handleError(e, "ExchangeRequests.accept")); }
  };

  const handleReject = async (id: number) => {
    try {
      await exchangeApi.rejectRequest(id);
      fetch();
    } catch (e) { Alert.alert("Error al rechazar", handleError(e, "ExchangeRequests.reject")); }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: ExchangeRequest; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
        <View style={styles.card}>
          <Text style={styles.name}>
            {tab === "received"
              ? `${item.requesterFirstName} ${item.requesterLastName}`
              : `${item.targetFirstName} ${item.targetLastName}`}
          </Text>
          <View style={styles.langRow}>
            <View style={styles.langBadge}><Text style={styles.langText}>Ofrece: {item.offerLanguageName}</Text></View>
            <View style={[styles.langBadge, { backgroundColor: colors.eu.orange + "20" }]}>
              <Text style={[styles.langText, { color: colors.eu.orange }]}>Quiere: {item.wantLanguageName}</Text>
            </View>
          </View>
          {item.message && <Text style={styles.message}>"{item.message}"</Text>}
          {tab === "received" && (
            <View style={styles.btnRow}>
              <Pressable style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
                <Text style={styles.acceptText}>Aceptar</Text>
              </Pressable>
              <Pressable style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                <Text style={styles.rejectText}>Rechazar</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Animated.View>
    ), [tab, fetch],
  );

  return (
    <LinearGradient colors={[DS.background, "#0E1A35", "#0F1535"]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Solicitudes</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        {(["received", "sent"] as const).map((t) => (
          <CategoryTab
            key={t}
            label={t === "received" ? "Recibidas" : "Enviadas"}
            active={tab === t}
            onPress={() => setTab(t)}
          />
        ))}
      </View>

      {loading && !loadingTimedOut ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      ) : (loading && loadingTimedOut) || error ? (
        <View style={styles.empty}>
          <Ionicons name="file-tray-outline" size={48} color={colors.text.secondary} />
          <Text style={styles.emptyTitle}>Sin solicitudes</Text>
          <Text style={styles.emptySubtitle}>No se pudieron cargar las solicitudes</Text>
          <Pressable style={styles.retryBtn} onPress={() => { setLoading(true); fetch(); }}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <FlashList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 40 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="file-tray-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyTitle}>Sin solicitudes</Text>
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
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  tabs: { flexDirection: "row", paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  card: { backgroundColor: "rgba(255,255,255,0.04)", borderRadius: radii.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.08)", padding: spacing.md, marginBottom: spacing.md },
  name: { fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  langRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap" },
  langBadge: { backgroundColor: colors.eu.star + "20", paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.full },
  langText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.bodySmall, color: colors.eu.star },
  message: { fontFamily: typography.families.body, ...typography.sizes.caption, color: colors.text.secondary, fontStyle: "italic", marginTop: spacing.sm },
  btnRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  acceptBtn: { flex: 1, backgroundColor: colors.status.success + "20", borderRadius: radii.full, paddingVertical: spacing.sm, alignItems: "center" },
  acceptText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.caption, color: colors.status.success },
  rejectBtn: { flex: 1, backgroundColor: colors.status.error + "20", borderRadius: radii.full, paddingVertical: spacing.sm, alignItems: "center" },
  rejectText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.caption, color: colors.status.error },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing.xxl },
  emptyTitle: { fontFamily: typography.families.heading, ...typography.sizes.h3, color: colors.text.primary, marginTop: spacing.md },
  emptySubtitle: { fontFamily: typography.families.body, ...typography.sizes.caption, color: colors.text.secondary, marginTop: spacing.xs, textAlign: "center" },
  retryBtn: { marginTop: spacing.lg, borderWidth: 1, borderColor: colors.eu.star, borderRadius: radii.full, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, backgroundColor: colors.eu.star + "10" },
  retryText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.caption, color: colors.eu.star },
});
