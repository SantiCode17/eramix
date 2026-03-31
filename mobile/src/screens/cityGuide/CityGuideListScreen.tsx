import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { getPlaces } from "@/api/cityGuide";
import type { Place, CityGuideStackParamList } from "@/types/cityGuide";

const CATEGORY_EMOJIS: Record<string, string> = {
  RESTAURANT: "🍽️",
  BAR: "🍺",
  CAFE: "☕",
  MUSEUM: "🏛️",
  PARK: "🌳",
  NIGHTCLUB: "🎶",
  LIBRARY: "📚",
  GYM: "💪",
  SUPERMARKET: "🛒",
  TRANSPORT: "🚌",
  UNIVERSITY: "🎓",
  HOSPITAL: "🏥",
  OTHER: "📍",
};

export default function CityGuideListScreen() {
  const navigation = useNavigation<StackNavigationProp<CityGuideStackParamList>>();
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getPlaces(search || undefined);
      setPlaces(res as any);
    } catch {}
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderPlace = ({ item }: { item: Place }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate("PlaceDetail", { placeId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.emoji}>{CATEGORY_EMOJIS[item.category] ?? "📍"}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.city}>{item.city}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {item.averageRating?.toFixed(1) ?? "–"}</Text>
        </View>
      </View>
      {item.description ? (
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      ) : null}
      <View style={styles.cardFooter}>
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{item.category}</Text>
        </View>
        <Text style={styles.reviewsText}>{item.reviewCount} reviews</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={styles.root}>
      <Text style={styles.headerTitle}>🗺️ Guía de Ciudad</Text>

      <TextInput
        style={styles.search}
        placeholder="Buscar por ciudad…"
        placeholderTextColor={colors.text.secondary}
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={load}
        returnKeyType="search"
      />

      <FlashList
        data={places}
        keyExtractor={(p) => String(p.id)}
        renderItem={renderPlace}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No se encontraron lugares</Text>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 60, paddingHorizontal: spacing.md },
  headerTitle: {
    ...typography.sizes.h2,
    fontFamily: typography.families.heading,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  search: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  card: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.xs },
  emoji: { fontSize: 28, marginRight: spacing.sm },
  name: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  city: {
    fontFamily: typography.families.body,
    ...typography.sizes.small,
    color: colors.text.secondary,
  },
  ratingBadge: {
    backgroundColor: colors.eu.star + "30",
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  ratingText: {
    color: colors.eu.star,
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.small,
  },
  desc: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  catBadge: {
    backgroundColor: colors.eu.mid + "25",
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  catText: {
    color: colors.eu.light,
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.small,
  },
  reviewsText: {
    fontFamily: typography.families.body,
    ...typography.sizes.small,
    color: colors.text.secondary,
  },
  empty: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 60,
  },
});
