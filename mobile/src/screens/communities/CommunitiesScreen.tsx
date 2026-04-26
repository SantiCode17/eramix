/**
 * ════════════════════════════════════════════════════
 *  CommunitiesScreen — European Glass · Social Hub
 *  Glass tabs · Animated cards · Category gradients
 * ════════════════════════════════════════════════════
 */

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
  TextInput,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import Animated, { FadeIn, FadeInDown, FadeInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radii, borders, DS, TAB_BAR_HEIGHT } from "@/design-system/tokens";
import { EmptyState } from "@/design-system";
import { CategoryTab } from "@/components";
import type {
  CommunityData,
  CommunityCategory,
  CommunitiesStackParamList,
} from "@/types/communities";
import * as communitiesApi from "@/api/communities";
import { handleError } from "@/utils/errorHandler";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import { pluralize } from "@/utils/pluralize";
// import { communityHero } from "@/assets/images";

type Nav = StackNavigationProp<CommunitiesStackParamList, "CommunitiesList">;
type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const CATEGORY_ICONS: Record<CommunityCategory, IoniconsName> = {
  UNIVERSITY: "school-outline",
  CITY: "business-outline",
  INTEREST: "star-outline",
  GENERAL: "globe-outline",
};

const CATEGORY_GRADIENTS: Record<CommunityCategory, [string, string]> = {
  UNIVERSITY: ["rgba(19,34,64,0.70)", "rgba(26,45,77,0.35)"],
  CITY: ["rgba(255,107,53,0.30)", "rgba(255,79,111,0.12)"],
  INTEREST: ["rgba(255,215,0,0.25)", "rgba(255,179,0,0.08)"],
  GENERAL: ["rgba(0,214,143,0.25)", "rgba(0,214,143,0.08)"],
};

const TABS: { label: string; value: "my" | "explore" | "suggested"; icon: IoniconsName }[] = [
  { label: "Mis comunidades", value: "my", icon: "heart-outline" },
  { label: "Explorar", value: "explore", icon: "compass-outline" },
  { label: "Sugeridas", value: "suggested", icon: "sparkles-outline" },
];

// ═══ Community Card — Glass ═══
function CommunityCard({
  item,
  index,
  onPress,
}: {
  item: CommunityData;
  index: number;
  onPress: () => void;
}) {
  const gradColors = CATEGORY_GRADIENTS[item.category] ?? CATEGORY_GRADIENTS.GENERAL;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={onPress}
      >
        {/* Cover */}
        {item.coverImageUrl ? (
          <Image source={{ uri: resolveMediaUrl(item.coverImageUrl) }} style={styles.cardCover} />
        ) : (
          <LinearGradient colors={gradColors} style={styles.cardCover}>
            <Ionicons
              name={CATEGORY_ICONS[item.category] || "globe-outline"}
              size={34}
              color="rgba(255,255,255,0.15)"
            />
          </LinearGradient>
        )}
        {/* Glass highlight on cover */}
        <View style={styles.cardCoverHighlight} />

        {/* Body */}
        <View style={styles.cardBody}>
          <View style={styles.cardCategoryRow}>
            <View style={[styles.categoryDot, { backgroundColor: gradColors[0].replace(/0\.\d+\)/, "0.8)") }]} />
            <Text style={styles.categoryText}>
              {item.category === "UNIVERSITY" ? "Universidad" :
               item.category === "CITY" ? "Ciudad" :
               item.category === "INTEREST" ? "Interés" : "General"}
            </Text>
          </View>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          {item.description && (
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          )}
          <View style={styles.cardFooter}>
            <View style={styles.cardMembersRow}>
              <Ionicons name="people-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.cardMembers}>{pluralize(item.memberCount, "miembro", "miembros")}</Text>
            </View>
            {item.isMember ? (
              <View style={styles.joinedBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#00D68F" />
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

// ═══ Main Screen ═══
export default function CommunitiesScreen() {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"my" | "explore" | "suggested">("my");
  const [communities, setCommunities] = useState<CommunityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0F1535"]}
        style={StyleSheet.absoluteFill}
      />

      {/* ═══ Glass Header ═══ */}
      <Animated.View entering={FadeIn.delay(50)} style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>Comunidades</Text>
          <Text style={styles.headerSubtitle}>Tu red Erasmus</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.createCommunityBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.9 }] },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            nav.navigate("CreateCommunity" as any);
          }}
        >
          <LinearGradient
            colors={["#FFD700", "#FF6B2B"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createCommunityGrad}
          >
            <Ionicons name="add" size={22} color="#06081A" />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {/* ═══ Search Bar ═══ */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar comunidades…"
          placeholderTextColor={colors.text.disabled}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
          </Pressable>
        )}
      </View>

      {/* ═══ Glass Tabs ═══ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContainer}
      >
        {TABS.map((t, i) => {
          const active = tab === t.value;
          return (
            <Animated.View key={t.value} entering={FadeInRight.delay(i * 80).springify()}>
              <CategoryTab
                label={t.label}
                icon={t.icon}
                active={active}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTab(t.value);
                }}
              />
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* ═══ Content ═══ */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.eu.star} />
          <Text style={styles.loadingText}>Cargando comunidades...</Text>
        </View>
      ) : communities.length === 0 ? (
        <View style={styles.emptyWrap} pointerEvents="box-none">
          <EmptyState
            icon="people-outline"
            title={tab === "my" ? "No estás en ninguna comunidad" : "No hay comunidades todavía"}
            message={tab === "my" ? "¡Crea una y reúne a tu gente Erasmus!" : "¡Sé el primero en crear una comunidad!"}
            ctaLabel="Crear comunidad"
            ctaGradient
            onCtaPress={() => nav.navigate("CreateCommunity" as any)}
            style={{ flex: 0 }}
          />
        </View>
      ) : (
        <FlashList
          data={communities.filter((c) => !search.trim() || c.name.toLowerCase().includes(search.toLowerCase()))}
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
            paddingBottom: insets.bottom + TAB_BAR_HEIGHT + 16,
          }}
        />
      )}
      {/* ═══ FAB (Crear Comunidad) ═══ */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => nav.navigate("CreateCommunity" as any)}
      >
        <Ionicons name="add" size={30} color="#06081A" />
      </Pressable>
    </View>
  );
}

// ═══ Styles — European Glass ═══
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.md, paddingBottom: 120 },
  loadingText: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.tertiary,
  },

  // Header
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  createCommunityBtn: {
    borderRadius: 20,
    overflow: "hidden",
  },
  createCommunityGrad: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Tabs
  tabsScroll: { flexGrow: 0, maxHeight: 52, marginTop: 14, marginBottom: spacing.md },
  tabsContainer: { paddingHorizontal: spacing.lg, gap: 8 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: borders.hairline,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tabActive: {
    backgroundColor: "rgba(255,215,0,0.10)",
    borderColor: "rgba(255,215,0,0.25)",
  },
  tabText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  tabTextActive: { color: colors.eu.star },

  // Card
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderWidth: borders.hairline,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  cardCover: {
    height: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  cardCoverHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  cardBody: { padding: spacing.md },
  cardCategoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardName: {
    fontFamily: typography.families.subheading,
    fontSize: 17,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    lineHeight: 18,
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
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  joinedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    backgroundColor: "rgba(0,214,143,0.10)",
    borderWidth: borders.hairline,
    borderColor: "rgba(0,214,143,0.20)",
  },
  joinedText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: "#00D68F",
  },
  joinBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,215,0,0.08)",
    borderWidth: borders.hairline,
    borderColor: "rgba(255,215,0,0.18)",
  },
  joinText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.eu.star,
  },

  // Empty
  emptyWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: TAB_BAR_HEIGHT,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,215,0,0.06)",
    borderWidth: borders.hairline,
    borderColor: "rgba(255,215,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.text.primary,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFB800",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
