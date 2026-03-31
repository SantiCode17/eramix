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
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { ExchangeRequest } from "@/types/exchange";
import * as exchangeApi from "@/api/exchange";

export default function ExchangeRequestsScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = tab === "received"
        ? await exchangeApi.getPendingReceived()
        : await exchangeApi.getSentRequests();
      setRequests(data);
    } catch (e) { console.error("Error:", e); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAccept = async (id: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await exchangeApi.acceptRequest(id);
      fetch();
    } catch (e) { Alert.alert("Error", "No se pudo aceptar"); }
  };

  const handleReject = async (id: number) => {
    try {
      await exchangeApi.rejectRequest(id);
      fetch();
    } catch (e) { Alert.alert("Error", "No se pudo rechazar"); }
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
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}><Text style={{ fontSize: 22 }}>←</Text></Pressable>
        <Text style={styles.headerTitle}>Solicitudes</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        {(["received", "sent"] as const).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "received" ? "Recibidas" : "Enviadas"}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      ) : (
        <FlashList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 40 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>📭</Text>
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
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  tabs: { flexDirection: "row", paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radii.full, backgroundColor: colors.glass.white, borderWidth: 1, borderColor: colors.glass.border, alignItems: "center" },
  tabActive: { backgroundColor: colors.eu.star + "20", borderColor: colors.eu.star },
  tabText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.caption, color: colors.text.secondary },
  tabTextActive: { color: colors.eu.star },
  card: { backgroundColor: colors.glass.white, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.glass.border, padding: spacing.md, marginBottom: spacing.md },
  name: { fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  langRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap" },
  langBadge: { backgroundColor: colors.eu.star + "20", paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.full },
  langText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.small, color: colors.eu.star },
  message: { fontFamily: typography.families.body, ...typography.sizes.caption, color: colors.text.secondary, fontStyle: "italic", marginTop: spacing.sm },
  btnRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.md },
  acceptBtn: { flex: 1, backgroundColor: colors.status.success + "20", borderRadius: radii.full, paddingVertical: spacing.sm, alignItems: "center" },
  acceptText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.caption, color: colors.status.success },
  rejectBtn: { flex: 1, backgroundColor: colors.status.error + "20", borderRadius: radii.full, paddingVertical: spacing.sm, alignItems: "center" },
  rejectText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.caption, color: colors.status.error },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing.xxl },
  emptyTitle: { fontFamily: typography.families.heading, ...typography.sizes.h3, color: colors.text.primary, marginTop: spacing.md },
});
