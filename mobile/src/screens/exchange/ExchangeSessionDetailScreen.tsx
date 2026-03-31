import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { ExchangeSession, ExchangeStackParamList } from "@/types/exchange";
import * as exchangeApi from "@/api/exchange";

type Route = RouteProp<ExchangeStackParamList, "ExchangeSessionDetail">;

export default function ExchangeSessionDetailScreen() {
  const nav = useNavigation();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { sessionId } = route.params;
  const [session, setSession] = useState<ExchangeSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const all = await exchangeApi.getMySessions();
      setSession(all.find((s) => s.id === sessionId) || null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [sessionId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleComplete = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await exchangeApi.completeSession(sessionId);
      fetch();
    } catch (e) { Alert.alert("Error", "No se pudo completar"); }
  };

  const handleCancel = async () => {
    try {
      await exchangeApi.cancelSession(sessionId);
      fetch();
    } catch (e) { Alert.alert("Error", "No se pudo cancelar"); }
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      </LinearGradient>
    );
  }

  if (!session) {
    return (
      <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.center}><Text style={styles.emptyTitle}>Sesión no encontrada</Text></View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}><Text style={{ fontSize: 22 }}>←</Text></Pressable>
        <Text style={styles.headerTitle}>Detalle de Sesión</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.langRow}>
            <View style={styles.langBadge}><Text style={styles.langText}>{session.offerLanguageName}</Text></View>
            <Text style={styles.arrow}>⇄</Text>
            <View style={styles.langBadge}><Text style={styles.langText}>{session.wantLanguageName}</Text></View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Participantes</Text>
            <Text style={styles.value}>
              {session.userAFirstName} {session.userALastName} & {session.userBFirstName} {session.userBLastName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Estado</Text>
            <Text style={[styles.value, { color: colors.eu.star }]}>{session.status}</Text>
          </View>

          {session.scheduledAt && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.value}>{new Date(session.scheduledAt).toLocaleString()}</Text>
            </View>
          )}

          {session.durationMinutes && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Duración</Text>
              <Text style={styles.value}>{session.durationMinutes} min</Text>
            </View>
          )}

          {session.notes && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Notas</Text>
              <Text style={styles.value}>{session.notes}</Text>
            </View>
          )}
        </View>

        {session.status === "SCHEDULED" && (
          <View style={styles.btnRow}>
            <Pressable style={styles.completeBtn} onPress={handleComplete}>
              <Text style={styles.completeBtnText}>Completar ✓</Text>
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  content: { padding: spacing.lg },
  card: { backgroundColor: colors.glass.white, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.glass.border, padding: spacing.lg },
  langRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  langBadge: { backgroundColor: colors.eu.star + "20", paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.full },
  langText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.caption, color: colors.eu.star },
  arrow: { ...typography.sizes.h3, color: colors.text.secondary },
  infoRow: { marginBottom: spacing.md },
  label: { fontFamily: typography.families.bodyMedium, ...typography.sizes.small, color: colors.text.secondary },
  value: { fontFamily: typography.families.body, ...typography.sizes.body, color: colors.text.primary, marginTop: spacing.xxs },
  btnRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  completeBtn: { flex: 1, backgroundColor: colors.status.success + "20", borderRadius: radii.full, paddingVertical: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.status.success },
  completeBtnText: { fontFamily: typography.families.bodyBold, ...typography.sizes.button, color: colors.status.success },
  cancelBtn: { flex: 1, backgroundColor: colors.status.error + "20", borderRadius: radii.full, paddingVertical: spacing.md, alignItems: "center", borderWidth: 1, borderColor: colors.status.error },
  cancelBtnText: { fontFamily: typography.families.bodyBold, ...typography.sizes.button, color: colors.status.error },
  emptyTitle: { fontFamily: typography.families.heading, ...typography.sizes.h3, color: colors.text.primary },
});
