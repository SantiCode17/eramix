import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  radii,
  TAB_BAR_HEIGHT,
} from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
import * as exchangeApi from "@/api/exchange";
import { handleError } from "@/utils/errorHandler";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import type { ExchangePartner } from "@/types/exchange";

export default function FindPartnerScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [partners, setPartners] = useState<ExchangePartner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await exchangeApi.findPartners();
        setPartners(data);
      } catch (e) {
        handleError(e, "FindPartner.fetch");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: ExchangePartner; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
        <View style={st.card}>
          {item.photoUrl ? (
            <Image
              source={{ uri: resolveMediaUrl(item.photoUrl) }}
              style={st.avatar}
            />
          ) : (
            <View style={[st.avatar, st.avatarPlaceholder]}>
              <Text style={st.avatarInitial}>{item.name?.[0] ?? "?"}</Text>
            </View>
          )}
          <View style={st.cardBody}>
            <Text style={st.name} numberOfLines={1}>
              {item.name}
            </Text>
            {item.city && (
              <View style={st.metaRow}>
                <Ionicons name="location-outline" size={12} color={colors.text.secondary} />
                <Text style={st.city}>{item.city}</Text>
              </View>
            )}
            <View style={st.badges}>
              {item.teaches && (
                <View style={st.badge}>
                  <Text style={st.badgeText}>Enseña: {item.teaches}</Text>
                </View>
              )}
              {item.learns && (
                <View style={[st.badge, st.badgeLearn]}>
                  <Text style={[st.badgeText, st.badgeLearnText]}>
                    Aprende: {item.learns}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {item.rating != null && (
            <View style={st.ratingWrap}>
              <Ionicons name="star" size={12} color={colors.eu.star} />
              <Text style={st.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    ),
    [],
  );

  return (
    <ScreenBackground>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Header */}
        <View style={st.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={st.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </Pressable>
          <Text style={st.headerTitle}>Buscar compañero</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={st.center}>
            <ActivityIndicator size="large" color={colors.eu.star} />
          </View>
        ) : (
          <FlashList
            data={partners}
            keyExtractor={(p) => String(p.id)}
            renderItem={renderItem}
            contentContainerStyle={{
              paddingBottom: insets.bottom + TAB_BAR_HEIGHT + spacing.md,
            }}
            ListEmptyComponent={
              <View style={st.empty}>
                <Ionicons name="people-outline" size={48} color={colors.text.secondary} />
                <Text style={st.emptyTitle}>Sin resultados</Text>
                <Text style={st.emptySubtitle}>
                  No hay compañeros de intercambio disponibles
                </Text>
              </View>
            }
          />
        )}
      </View>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
  },

  /* Card */
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    backgroundColor: colors.glass.whiteMid,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontFamily: typography.families.subheading,
    fontSize: 18,
    color: colors.text.primary,
  },
  cardBody: { flex: 1, marginLeft: spacing.md },
  name: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    marginTop: 2,
  },
  city: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  badges: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,215,0,0.12)",
  },
  badgeText: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.eu.star,
  },
  badgeLearn: {
    backgroundColor: "rgba(91,141,239,0.12)",
  },
  badgeLearnText: {
    color: "#5B8DEF",
  },
  ratingWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
  },

  /* Empty */
  empty: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
