import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  DS,
  layout,
} from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
import type { HousingPost, HousingStackParamList } from "@/types/housing";
import * as housingApi from "@/api/housing";
import { handleError } from "@/utils/errorHandler";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

type Route = RouteProp<HousingStackParamList, "HousingDetail">;

export default function HousingDetailScreen() {
  const nav = useNavigation();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { postId } = route.params;
  const [post, setPost] = useState<HousingPost | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const all = await housingApi.getAllPosts();
      setPost(all.find((p) => p.id === postId) || null);
    } catch (e) {
      Alert.alert("Error", handleError(e, "HousingDetail.fetch"));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ─── loading ─── */
  if (loading) {
    return (
      <ScreenBackground>
        <View style={st.center}>
          <ActivityIndicator size="large" color={DS.primary} />
        </View>
      </ScreenBackground>
    );
  }

  /* ─── not found ─── */
  if (!post) {
    return (
      <ScreenBackground>
        <View style={st.center}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.text.tertiary} />
          <Text style={st.emptyTitle}>Anuncio no encontrado</Text>
        </View>
      </ScreenBackground>
    );
  }

  /* ─── detail ─── */
  return (
    <ScreenBackground>
      <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1 }}>
        {/* header */}
        <View style={[st.headerBar, { paddingTop: insets.top + spacing.xs }]}>
          <Pressable onPress={() => nav.goBack()} style={st.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </Pressable>
          <Text style={st.headerTitle}>Detalle</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={st.content}
          showsVerticalScrollIndicator={false}
        >
          {/* photo */}
          {post.photoUrl && (
            <Animated.View entering={FadeInDown.duration(500)}>
              <Image
                source={{ uri: resolveMediaUrl(post.photoUrl) }}
                style={st.photo}
              />
            </Animated.View>
          )}

          {/* card */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={st.card}>
            {/* type badge */}
            <View
              style={[
                st.typeBadge,
                {
                  backgroundColor:
                    post.postType === "OFFER"
                      ? colors.status.successBg
                      : colors.eu.star + "20",
                },
              ]}
            >
              <Ionicons
                name={post.postType === "OFFER" ? "home-outline" : "search-outline"}
                size={16}
                color={
                  post.postType === "OFFER"
                    ? colors.status.success
                    : colors.eu.star
                }
              />
              <Text
                style={[
                  st.typeText,
                  {
                    color:
                      post.postType === "OFFER"
                        ? colors.status.success
                        : colors.eu.star,
                  },
                ]}
              >
                {post.postType === "OFFER" ? "Oferta" : "Busca"}
              </Text>
            </View>

            <Text style={st.title}>{post.title}</Text>
            <Text style={st.desc}>{post.description}</Text>

            {/* info rows */}
            <InfoRow label="Ciudad" icon="location-outline" value={post.city} />
            {post.address && (
              <InfoRow label="Dirección" icon="map-outline" value={post.address} />
            )}
            <InfoRow
              label="Precio"
              icon="cash-outline"
              value={`${post.monthlyRent}€/mes`}
              highlight
            />
            <InfoRow
              label="Habitaciones"
              icon="bed-outline"
              value={String(post.roomsAvailable)}
            />
            <InfoRow
              label="Disponible desde"
              icon="calendar-outline"
              value={post.availableFrom}
            />
            {post.availableUntil && (
              <InfoRow label="Hasta" icon="time-outline" value={post.availableUntil} />
            )}

            {/* author */}
            <View style={st.authorRow}>
              <Text style={st.authorLabel}>Publicado por</Text>
              <Text style={st.authorName}>
                {post.userFirstName} {post.userLastName}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </ScreenBackground>
  );
}

/* ─── InfoRow helper ─── */
function InfoRow({
  label,
  icon,
  value,
  highlight,
}: {
  label: string;
  icon: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={st.infoRow}>
      <View style={st.infoLeft}>
        <Ionicons
          name={icon as any}
          size={14}
          color={colors.text.tertiary}
        />
        <Text style={st.label}>{label}</Text>
      </View>
      <Text style={highlight ? st.valueHighlight : st.value}>{value}</Text>
    </View>
  );
}

/* ─── styles ─────────────────────────── */
const st = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.md },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.sm,
  },
  backBtn: {
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
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  content: {
    padding: layout.screenPadding,
    paddingBottom: 100,
  },
  photo: {
    width: "100%",
    height: 220,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.background.card,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    padding: spacing.lg,
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
    ...typography.sizes.bodySmall,
  },
  title: {
    fontFamily: typography.families.heading,
    ...typography.sizes.h3,
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  desc: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glass.border,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  label: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.caption,
    color: colors.text.secondary,
  },
  value: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  valueHighlight: {
    fontFamily: typography.families.heading,
    ...typography.sizes.body,
    color: DS.primary,
  },
  authorRow: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glass.border,
  },
  authorLabel: {
    fontFamily: typography.families.body,
    ...typography.sizes.bodySmall,
    color: colors.text.secondary,
  },
  authorName: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  emptyTitle: {
    fontFamily: typography.families.heading,
    ...typography.sizes.h3,
    color: colors.text.primary,
  },
});
