import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  DS,
  layout,
} from "@/design-system/tokens";
import { ScreenBackground, Header, GlassCard, EmptyState } from "@/design-system/components";
import type { HousingPost, HousingStackParamList } from "@/types/housing";
import * as housingApi from "@/api/housing";
import { handleError } from "@/utils/errorHandler";

type Nav = StackNavigationProp<HousingStackParamList, "HousingList">;
const { width: SW } = Dimensions.get("window");

/* ─── component ──────────────────────── */
export default function HousingListScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<HousingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      setPosts(await housingApi.getAllPosts());
    } catch (e) {
      setError(handleError(e, "Housing.getAllPosts"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ─── card ─── */
  const renderItem = useCallback(
    ({ item, index }: { item: HousingPost; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
        <Pressable
          style={st.card}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            nav.navigate("HousingDetail", { postId: item.id });
          }}
        >
          {/* type badge */}
          <View
            style={[
              st.typeBadge,
              {
                backgroundColor:
                  item.postType === "OFFER"
                    ? colors.status.successBg
                    : colors.eu.star + "20",
              },
            ]}
          >
            <Ionicons
              name={item.postType === "OFFER" ? "home" : "search"}
              size={12}
              color={
                item.postType === "OFFER"
                  ? colors.status.success
                  : colors.eu.star
              }
            />
            <Text
              style={[
                st.typeText,
                {
                  color:
                    item.postType === "OFFER"
                      ? colors.status.success
                      : colors.eu.star,
                },
              ]}
            >
              {item.postType === "OFFER" ? "Oferta" : "Busca"}
            </Text>
          </View>

          <Text style={st.title} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={st.locationRow}>
            <Ionicons
              name="location-outline"
              size={13}
              color={colors.text.secondary}
            />
            <Text style={st.city}>{item.city}</Text>
          </View>

          <View style={st.priceRow}>
            <Text style={st.price}>{item.monthlyRent}€/mes</Text>
            <View style={st.roomsBadge}>
              <Ionicons
                name="bed-outline"
                size={13}
                color={colors.text.secondary}
              />
              <Text style={st.rooms}>{item.roomsAvailable} hab.</Text>
            </View>
          </View>

          <View style={st.metaRow}>
            <Text style={st.date}>
              <Ionicons
                name="calendar-outline"
                size={11}
                color={colors.text.tertiary}
              />{" "}
              {item.availableFrom}
            </Text>
            <Text style={st.author}>
              {item.userFirstName} {item.userLastName}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    ),
    [nav],
  );

  /* ─── render ─── */
  return (
    <ScreenBackground>
      <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1 }}>
        {/* header */}
        <View style={[st.header, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable
            onPress={() => nav.dispatch(DrawerActions.openDrawer())}
            style={st.hamburger}
            hitSlop={12}
          >
            <Ionicons name="menu" size={22} color={colors.text.primary} />
          </Pressable>
          <Text style={st.headerTitle}>Alojamiento</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={st.center}>
            <ActivityIndicator size="large" color={DS.primary} />
          </View>
        ) : (
          <FlashList
            data={posts}
            renderItem={renderItem}
            keyExtractor={(i) => String(i.id)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchData();
                }}
                tintColor={DS.primary}
                colors={[DS.primary]}
              />
            }
            contentContainerStyle={{
              paddingHorizontal: layout.screenPadding,
              paddingBottom: insets.bottom + 80,
            }}
            ListEmptyComponent={
              <EmptyState
                icon="home-outline"
                title="No hay anuncios"
                message="Publica tu oferta o búsqueda de piso"
              />
            }
          />
        )}
      </Animated.View>
    </ScreenBackground>
  );
}

/* ─── styles ─────────────────────────── */
const st = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.md,
  },
  hamburger: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.glass.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    ...typography.sizes.h3,
    color: colors.text.primary,
  },

  /* card */
  card: {
    backgroundColor: colors.background.card,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.glassSmall,
  },
  typeBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  typeText: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.caption,
    fontWeight: "600",
  },
  title: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    marginTop: spacing.xs,
  },
  city: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  price: {
    fontFamily: typography.families.heading,
    ...typography.sizes.h4,
    color: DS.primary,
  },
  roomsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  rooms: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glass.border,
  },
  date: {
    fontFamily: typography.families.body,
    ...typography.sizes.tiny,
    color: colors.text.tertiary,
  },
  author: {
    fontFamily: typography.families.body,
    ...typography.sizes.tiny,
    color: colors.text.tertiary,
  },
});
