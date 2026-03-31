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
import type { HousingPost, HousingStackParamList } from "@/types/housing";
import * as housingApi from "@/api/housing";

type Nav = StackNavigationProp<HousingStackParamList, "HousingList">;

export default function HousingListScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<HousingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try { setPosts(await housingApi.getAllPosts()); }
    catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const renderItem = useCallback(
    ({ item, index }: { item: HousingPost; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <Pressable
          style={styles.card}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            nav.navigate("HousingDetail", { postId: item.id });
          }}
        >
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.postType === "OFFER" ? "🏠 Oferta" : "🔍 Busca"}</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.city}>📍 {item.city}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{item.monthlyRent}€/mes</Text>
            <Text style={styles.rooms}>🛏️ {item.roomsAvailable} hab.</Text>
          </View>
          <Text style={styles.date}>Disponible: {item.availableFrom}</Text>
          <Text style={styles.author}>
            {item.userFirstName} {item.userLastName}
          </Text>
        </Pressable>
      </Animated.View>
    ), [nav],
  );

  return (
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏠 Alojamiento</Text>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      ) : (
        <FlashList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(i) => String(i.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={colors.eu.star} colors={[colors.eu.star]} />}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 80 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 64 }}>🏘️</Text>
              <Text style={styles.emptyTitle}>No hay anuncios</Text>
              <Text style={styles.emptySubtitle}>Publica tu oferta o búsqueda de piso</Text>
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
    backgroundColor: colors.glass.white, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.glass.border,
    padding: spacing.md, marginBottom: spacing.md,
  },
  typeBadge: { alignSelf: "flex-start", backgroundColor: colors.eu.star + "20", borderRadius: radii.full, paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  typeText: { fontFamily: typography.families.bodyMedium, ...typography.sizes.small, color: colors.eu.star },
  title: { fontFamily: typography.families.subheading, ...typography.sizes.body, color: colors.text.primary, marginTop: spacing.sm },
  city: { fontFamily: typography.families.body, ...typography.sizes.caption, color: colors.text.secondary, marginTop: spacing.xs },
  priceRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm },
  price: { fontFamily: typography.families.heading, ...typography.sizes.body, color: colors.eu.star },
  rooms: { fontFamily: typography.families.body, ...typography.sizes.caption, color: colors.text.secondary },
  date: { fontFamily: typography.families.body, ...typography.sizes.small, color: colors.text.secondary, marginTop: spacing.xs },
  author: { fontFamily: typography.families.body, ...typography.sizes.small, color: colors.text.disabled, marginTop: spacing.sm },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing.xxl },
  emptyTitle: { fontFamily: typography.families.heading, ...typography.sizes.h3, color: colors.text.primary, marginTop: spacing.md },
  emptySubtitle: { fontFamily: typography.families.body, ...typography.sizes.body, color: colors.text.secondary, textAlign: "center", marginTop: spacing.sm },
});
