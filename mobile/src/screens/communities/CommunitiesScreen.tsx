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
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type {
  CommunityData,
  CommunityCategory,
  CommunitiesStackParamList,
} from "@/types/communities";
import * as communitiesApi from "@/api/communities";
import { handleError } from "@/utils/errorHandler";

type Nav = StackNavigationProp<CommunitiesStackParamList, "CommunitiesList">;
type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const CATEGORY_ICONS: Record<CommunityCategory, IoniconsName> = {
  UNIVERSITY: "school-outline",
  CITY: "business-outline",
  INTEREST: "star-outline",
  GENERAL: "globe-outline",
};

const TABS: { label: string; value: "my" | "explore" | "suggested"; icon: IoniconsName }[] = [
  { label: "Mis comunidades", value: "my", icon: "heart-outline" },
  { label: "Explorar", value: "explore", icon: "compass-outline" },
  { label: "Sugeridas", value: "suggested", icon: "sparkles-outline" },
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
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
        onPress={onPress}
      >
        {item.coverImageUrl ? (
          <Image source={{ uri: item.coverImageUrl }} style={styles.cardCover} />
        ) : (
          <LinearGradient
            colors={[colors.eu.mid, colors.eu.deep]}
            style={styles.cardCover}
          >
            <Ionicons
              name={CATEGORY_ICONS[item.category] || "globe-outline"}
              size={32}
              color="rgba(255,255,255,0.2)"
            />
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
            <View style={styles.cardMembersRow}>
              <Ionicons name="people-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.cardMembers}>
                {item.memberCount} miembros
              </Text>
            </View>
            {item.isMember ? (
              <View style={styles.joinedBadge}>
                <Ionicons name="checkmark-circle" size={13} color={colors.status.success} />
                <Text style={styles.joinedText}>Unido</Text>
              </View>
            ) : (
              <Pressable style={styles.joinBadge} onPress={onPress}>
                <Ionicons name="add-circle-outline" size={13} color={colors.eu.star} />
                <Text style={styles.joinText}>Unirse</Text>
              </Pressable>
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
              <Ionicons
                name={t.icon}
                size={14}
                color={active ? colors.eu.star : colors.text.secondary}
                style={{ marginRight: 5 }}
              />
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
          <Ionicons name="people-outline" size={56} color="rgba(255,255,255,0.15)" />
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
    letterSpacing: -0.5,
  },
  tabsScroll: { maxHeight: 48 },
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  tabActive: {
    backgroundColor: "rgba(255, 204, 0, 0.12)",
    borderColor: "rgba(255, 204, 0, 0.3)",
  },
  tabText: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.caption,
    color: colors.text.secondary,
  },
  tabTextActive: { color: colors.eu.star },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  cardCover: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: { padding: spacing.md },
  cardName: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.text.primary,
    letterSpacing: -0.2,
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
  cardMembersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  cardMembers: {
    fontFamily: typography.families.body,
    ...typography.sizes.small,
    color: colors.text.secondary,
  },
  joinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: "rgba(76, 175, 80, 0.12)",
  },
  joinedText: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.small,
    color: colors.status.success,
  },
  joinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: "rgba(255, 204, 0, 0.12)",
  },
  joinText: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.small,
    color: colors.eu.star,
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
