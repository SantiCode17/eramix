import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, Pressable, Image, ActivityIndicator, RefreshControl,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { ExchangePartner } from "@/types/exchange";
import * as exchangeApi from "@/api/exchange";
import { handleError } from "@/utils/errorHandler";

export default function FindPartnerScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const [partners, setPartners] = useState<ExchangePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try { setError(null); setPartners(await exchangeApi.findPartners()); }
    catch (e) { setError(handleError(e, "FindPartner.findPartners")); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const renderPartner = useCallback(
    ({ item, index }: { item: ExchangePartner; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
        <Pressable style={styles.card}>
          <View style={styles.row}>
            {item.profilePhotoUrl ? (
              <Image source={{ uri: item.profilePhotoUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPh]}>
                <Text style={styles.avatarText}>{item.firstName?.[0] ?? "?"}</Text>
              </View>
            )}
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
              {item.destinationCity && <Text style={styles.city}><Ionicons name="location-outline" size={12} color={colors.text.secondary} /> {item.destinationCity}</Text>}
              {item.averageRating != null && (
                <Text style={styles.rating}><Ionicons name="star" size={12} color={colors.eu.star} /> {item.averageRating} · {item.sessionsCompleted} sesiones</Text>
              )}
            </View>
          </View>

          {item.teaches.length > 0 && (
            <View style={styles.langRow}>
              <Text style={styles.langLabel}>Enseña:</Text>
              {item.teaches.map((l) => (
                <View key={l.languageId} style={styles.langBadge}>
                  <Text style={styles.langText}>{l.languageName}</Text>
                </View>
              ))}
            </View>
          )}
          {item.learns.length > 0 && (
            <View style={styles.langRow}>
              <Text style={styles.langLabel}>Aprende:</Text>
              {item.learns.map((l) => (
                <View key={l.languageId} style={[styles.langBadge, { backgroundColor: colors.eu.orange + "20" }]}>
                  <Text style={[styles.langText, { color: colors.eu.orange }]}>{l.languageName}</Text>
                </View>
              ))}
            </View>
          )}
        </Pressable>
      </Animated.View>
    ), [],
  );

  return (
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Buscar Compañero</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      ) : (
        <FlashList
          data={partners}
          renderItem={renderPartner}
          keyExtractor={(i) => String(i.userId)}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 40 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyTitle}>Sin compañeros disponibles</Text>
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
    backgroundColor: colors.glass.white, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.glass.border,
    padding: spacing.md, marginBottom: spacing.md,
  },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPh: { backgroundColor: colors.eu.mid, justifyContent: "center", alignItems: "center" },
  avatarText: { fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  name: { fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary },
  city: { fontFamily: typography.families.body, ...typography.sizes.small, color: colors.text.secondary },
  rating: { fontFamily: typography.families.body, ...typography.sizes.small, color: colors.eu.star },
  langRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginTop: spacing.sm, gap: spacing.xs },
  langLabel: { fontFamily: typography.families.bodyMedium, ...typography.sizes.small, color: colors.text.secondary, marginRight: spacing.xs },
  langBadge: { backgroundColor: colors.eu.star + "20", paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radii.full },
  langText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.small, color: colors.eu.star },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing.xxl },
  emptyTitle: { fontFamily: typography.families.heading, ...typography.sizes.h3, color: colors.text.primary, marginTop: spacing.md },
});
