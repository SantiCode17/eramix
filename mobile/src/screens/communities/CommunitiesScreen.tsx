import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type {
  CommunityData,
  CommunityCategory,
  CommunitiesStackParamList,
} from "@/types/communities";
import * as communitiesApi from "@/api/communities";
import { handleError } from "@/utils/errorHandler";

type Nav = StackNavigationProp<CommunitiesStackParamList, "CommunitiesList">;

const CATEGORY_EMOJI: Record<CommunityCategory, string> = {
  UNIVERSITY: "🎓",
  CITY: "🏙️",
  INTEREST: "⭐",
  GENERAL: "🌍",
};

const TABS: { label: string; value: "my" | "explore" | "suggested" }[] = [
  { label: "Mis comunidades", value: "my" },
  { label: "Explorar", value: "explore" },
  { label: "Sugeridas", value: "suggested" },
];

// ── Community Card ──────────────────────────────────

function CommunityCard({
  item,
  index,
  onPress,
}: {
  item: CommunityData;
  index: number;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <Pressable style={styles.card} onPress={onPress}>
        {item.coverImageUrl ? (
          <Image source={{ uri: item.coverImageUrl }} style={styles.cardCover} />
        ) : (
          <LinearGradient
            colors={[colors.eu.mid, colors.eu.deep]}
            style={styles.cardCover}
          >
            <Text style={styles.cardEmoji}>
              {CATEGORY_EMOJI[item.category] || "🌍"}
            </Text>
          </LinearGradient>
        )}
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={styles.cardDesc} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <View style={styles.cardFooter}>
            <Text style={styles.cardMembers}>
              👥 {item.memberCount} miembros
            </Text>
            {item.isMember ? (
              <View style={styles.joinedBadge}>
                <Text style={styles.joinedText}>Unido ✓</Text>
              </View>
            ) : (
              <View style={styles.joinBadge}>
                <Text style={styles.joinText}>Unirse</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Screen ──────────────────────────────────────────

export default function CommunitiesScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"my" | "explore" | "suggested">("my");
  const [communities, setCommunities] = useState<CommunityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCommunities = useCallback(async () => {
    try {
      let data: CommunityData[];
      switch (tab) {
        case "my":
          data = await communitiesApi.getMyCommunities();
          break;
        case "suggested":
          data = await communitiesApi.getSuggestedCommunities();
          break;
        default:
          data = await communitiesApi.getCommunities();
          break;
      }
      setCommunities(data);
    } catch (e) {
      handleError(e, "Communities.fetch");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    fetchCommunities();
  }, [fetchCommunities]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCommunities();
  }, [fetchCommunities]);

  const renderItem = useCallback(
    ({ item, index }: { item: CommunityData; index: number }) => (
      <CommunityCard
        item={item}
        index={index}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          nav.navigate("CommunityFeed", {
            communityId: item.id,
            communityName: item.name,
          });
        }}
      />
    ),
    [nav],
  );

  return (
    <LinearGradient
      colors={[colors.background.start, colors.background.end]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comunidades</Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContainer}
      >
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <Pressable
              key={t.value}
              onPress={() => setTab(t.value)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.eu.star} />
        </View>
      ) : communities.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 64 }}>🌍</Text>
          <Text style={styles.emptyTitle}>
            {tab === "my"
              ? "No estás en ninguna comunidad"
              : "No hay comunidades disponibles"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {tab === "my"
              ? "Explora comunidades y únete a las que te interesen"
              : "Vuelve a intentarlo más tarde"}
          </Text>
        </View>
      ) : (
        <FlashList
          data={communities}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.eu.star}
              colors={[colors.eu.star]}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 80,
          }}
        />
      )}
    </LinearGradient>
  );
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    ...typography.sizes.h2,
    fontFamily: typography.families.heading,
    color: colors.text.primary,
  },
  tabsScroll: { maxHeight: 48 },
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  tabActive: {
    backgroundColor: colors.eu.star + "20",
    borderColor: colors.eu.star,
  },
  tabText: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.caption,
    color: colors.text.secondary,
  },
  tabTextActive: { color: colors.eu.star },
  card: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  cardCover: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  cardEmoji: { fontSize: 40 },
  cardBody: { padding: spacing.md },
  cardName: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  cardDesc: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  cardMembers: {
    fontFamily: typography.families.body,
    ...typography.sizes.small,
    color: colors.text.secondary,
  },
  joinedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.status.success + "20",
  },
  joinedText: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.small,
    color: colors.status.success,
  },
  joinBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: colors.eu.orange + "20",
  },
  joinText: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.small,
    color: colors.eu.orange,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontFamily: typography.families.heading,
    ...typography.sizes.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
