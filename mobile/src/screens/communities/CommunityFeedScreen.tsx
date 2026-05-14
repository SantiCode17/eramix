import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  memo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  RefreshControl,
  ActivityIndicator,
  Keyboard,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp, useFocusEffect } from "@react-navigation/native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  radii,
  TAB_BAR_HEIGHT,
} from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
import * as communitiesApi from "@/api/communities";
import { handleError } from "@/utils/errorHandler";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import type {
  CommunityData,
  CommunityPostData,
  CommunityCommentData,
  CommunityMemberPreview,
} from "@/types/communities";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CommunitiesStackParamList = {
  CommunityFeed: { communityId: number; communityName?: string };
  CreateCommunityPost: { communityId: number };
};
type RouteType = RouteProp<CommunitiesStackParamList, "CommunityFeed">;

/* ─── helpers ─────────────────────────────────────────── */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function fullName(first?: string, last?: string): string {
  return [first, last].filter(Boolean).join(" ") || "Usuario";
}

const CATEGORY_LABELS: Record<string, string> = {
  UNIVERSITY: "Universidad",
  CITY: "Ciudad",
  INTEREST: "Interés",
  GENERAL: "General",
};

const CATEGORY_ICONS: Record<string, string> = {
  UNIVERSITY: "school-outline",
  CITY: "business-outline",
  INTEREST: "star-outline",
  GENERAL: "globe-outline",
};

/* ─── MemberAvatars ────────────────────────────────────── */
function MemberAvatars({
  members,
  total,
}: {
  members: CommunityMemberPreview[];
  total: number;
}) {
  const shown = members.slice(0, 4);
  return (
    <View style={av.row}>
      {shown.map((m, i) => (
        <View
          key={m.userId}
          style={[av.bubble, { marginLeft: i === 0 ? 0 : -8 }]}
        >
          {m.profilePhotoUrl ? (
            <Image
              source={{ uri: resolveMediaUrl(m.profilePhotoUrl) }}
              style={av.img}
            />
          ) : (
            <View style={[av.img, av.placeholder]}>
              <Text style={av.initial}>{m.firstName?.[0] ?? "?"}</Text>
            </View>
          )}
        </View>
      ))}
      {total > shown.length && (
        <View style={[av.bubble, av.more, { marginLeft: -8 }]}>
          <Text style={av.moreText}>+{total - shown.length}</Text>
        </View>
      )}
    </View>
  );
}

const av = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  bubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(10,18,40,1)",
    overflow: "hidden",
  },
  img: { width: "100%", height: "100%" },
  placeholder: {
    backgroundColor: colors.glass.whiteMid,
    justifyContent: "center",
    alignItems: "center",
  },
  initial: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 9,
    color: colors.text.primary,
  },
  more: {
    backgroundColor: colors.glass.whiteStrong,
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 8,
    color: colors.text.secondary,
  },
});


/* ─── PostCard ─────────────────────────────────────────── */
function PostCard({
  post,
  onLike,
  onPressComments,
}: {
  post: CommunityPostData;
  onLike: (id: number) => void;
  onPressComments: (post: CommunityPostData) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const name = fullName(post.authorFirstName, post.authorLastName);
  const isLong = post.content.length > 180;

  const handleLikePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    heartScale.value = withSequence(
      withTiming(1.5, { duration: 120 }),
      withSpring(1, { damping: 6 }),
    );
    onLike(post.id);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(350).springify()}
      style={pc.card}
    >
      {/* Pinned banner */}
      {post.isPinned && (
        <View style={pc.pinnedBadge}>
          <Ionicons name="pin" size={10} color={colors.eu.star} />
          <Text style={pc.pinnedText}>Fijado</Text>
        </View>
      )}

      {/* Author row */}
      <View style={pc.authorRow}>
        {post.authorProfilePhotoUrl ? (
          <Image
            source={{ uri: resolveMediaUrl(post.authorProfilePhotoUrl) }}
            style={pc.avatar}
          />
        ) : (
          <View style={[pc.avatar, pc.avatarPh]}>
            <Text style={pc.avatarInitial}>{name[0] ?? "?"}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={pc.authorName}>{name}</Text>
          <Text style={pc.postTime}>{timeAgo(post.createdAt)}</Text>
        </View>
      </View>

      {/* Content */}
      <Pressable onPress={() => isLong && setExpanded((v) => !v)}>
        <Text
          style={pc.content}
          numberOfLines={expanded || !isLong ? undefined : 4}
        >
          {post.content}
        </Text>
        {isLong && !expanded && (
          <Text style={pc.readMore}>Ver más</Text>
        )}
      </Pressable>

      {/* Image */}
      {post.imageUrl && (
        <Image
          source={{ uri: resolveMediaUrl(post.imageUrl) }}
          style={pc.image}
          resizeMode="cover"
        />
      )}

      {/* Action bar */}
      <View style={pc.actions}>
        <Pressable style={pc.actionBtn} onPress={handleLikePress}>
          <Animated.View style={heartStyle}>
            <Ionicons
              name={post.likedByCurrentUser ? "heart" : "heart-outline"}
              size={21}
              color={
                post.likedByCurrentUser ? colors.eu.star : colors.text.secondary
              }
            />
          </Animated.View>
          <Text
            style={[
              pc.actionCount,
              post.likedByCurrentUser && { color: colors.eu.star },
            ]}
          >
            {post.likeCount ?? 0}
          </Text>
        </Pressable>

        <Pressable style={pc.actionBtn} onPress={() => onPressComments(post)}>
          <Ionicons
            name={"chatbubble-outline"}
            size={19}
            color={colors.text.secondary}
          />
          <Text
            style={[
              pc.actionCount,
            ]}
          >
            {post.commentCount ?? 0}
          </Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        {post.isPinned && (
          <Ionicons name="pin" size={15} color={colors.eu.star} />
        )}
      </View>
    </Animated.View>
  );
}

const pc = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.09)",
    overflow: "hidden",
  },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    backgroundColor: "rgba(255,215,0,0.08)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,215,0,0.18)",
  },
  pinnedText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.eu.star,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPh: {
    backgroundColor: colors.glass.whiteMid,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: colors.text.primary,
  },
  authorName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  postTime: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  content: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    lineHeight: typography.sizes.body.lineHeight,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  readMore: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.eu.star,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  image: {
    width: "100%",
    height: 220,
    marginBottom: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.07)",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
  },
  actionCount: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },

  /* Comments */
  commentsSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.07)",
    gap: 0,
  },
  noComments: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    textAlign: "center",
    paddingVertical: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  sendBtn: { borderRadius: radii.full, overflow: "hidden" },
  sendGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

/* ══════════════════════════════════════════════════════════
   CommunityFeedScreen
   ══════════════════════════════════════════════════════════ */
export default function CommunityFeedScreen(): React.JSX.Element {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { communityId } = route.params;

  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [posts, setPosts] = useState<CommunityPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const hasMounted = useRef(false);

  /* ── fetchers ── */
  const fetchCommunity = useCallback(async () => {
    try {
      const data = await communitiesApi.getCommunity(communityId);
      setCommunity(data);
    } catch (e) {
      handleError(e, "CommunityFeed.fetchCommunity");
    }
  }, [communityId]);

  const fetchPosts = useCallback(
    async (p = 0, append = false) => {
      try {
        const res = await communitiesApi.getCommunityPosts(communityId, p, 15);
        const items: CommunityPostData[] = res.content ?? res;
        setPosts(append ? (prev) => [...prev, ...items] : items);
        setHasMore(
          res.totalPages != null
            ? p < res.totalPages - 1
            : items.length >= 15,
        );
        setPage(p);
      } catch (e) {
        handleError(e, "CommunityFeed.fetchPosts");
      }
    },
    [communityId],
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchCommunity(), fetchPosts(0)]);
      setLoading(false);
      hasMounted.current = true;
    })();
  }, []);

  // Refresh posts when screen regains focus (after commenting, creating a post, etc.)
  useFocusEffect(
    useCallback(() => {
      if (hasMounted.current) {
        fetchPosts(0);
      }
    }, [fetchPosts])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchCommunity(), fetchPosts(0)]);
    setRefreshing(false);
  }, [fetchCommunity, fetchPosts]);

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    fetchPosts(page + 1, true);
  }, [hasMore, page, fetchPosts]);

  /* ── actions ── */
  const handleLike = useCallback(
    async (postId: number) => {
      // Optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByCurrentUser: !p.likedByCurrentUser,
                likeCount:
                  (p.likeCount ?? 0) + (p.likedByCurrentUser ? -1 : 1),
              }
            : p,
        ),
      );
      try {
        const updated = await communitiesApi.togglePostLike(communityId, postId);
        // Sync with authoritative server counts
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likeCount: updated.likeCount, likedByCurrentUser: updated.likedByCurrentUser }
              : p,
          ),
        );
      } catch (e) {
        // Revert on error
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likedByCurrentUser: !p.likedByCurrentUser,
                  likeCount:
                    (p.likeCount ?? 0) + (p.likedByCurrentUser ? -1 : 1),
                }
              : p,
          ),
        );
        handleError(e, "CommunityFeed.like");
      }
    },
    [communityId],
  );

  const handleJoin = useCallback(async () => {
    if (!community) return;

    if (community.isMember) {
      Alert.alert(
        "Salir de la comunidad",
        `¿Estás seguro de que quieres abandonar "${community.name}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Salir",
            style: "destructive",
            onPress: async () => {
              setJoinLoading(true);
              try {
                await communitiesApi.leaveCommunity(communityId);
                setCommunity((c) =>
                  c
                    ? {
                        ...c,
                        isMember: false,
                        currentUserRole: null,
                        memberCount: Math.max((c.memberCount ?? 1) - 1, 0),
                      }
                    : c,
                );
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Warning,
                );
              } catch (e) {
                handleError(e, "CommunityFeed.leave");
              } finally {
                setJoinLoading(false);
              }
            },
          },
        ],
      );
    } else {
      setJoinLoading(true);
      try {
        const updatedCommunity = await communitiesApi.joinCommunity(communityId);
        setCommunity(updatedCommunity);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        handleError(e, "CommunityFeed.join");
      } finally {
        setJoinLoading(false);
      }
    }
  }, [community, communityId]);

  /* ── List header ── */
  const ListHeader = useCallback(() => {
    if (!community) return null;
    const catLabel = CATEGORY_LABELS[community.category] ?? community.category;
    const catIcon = CATEGORY_ICONS[community.category] ?? "globe-outline";
    const isAdmin =
      community.currentUserRole === "ADMIN" ||
      community.currentUserRole === "MODERATOR";

    return (
      <Animated.View entering={FadeIn.duration(450)}>
        {/* Cover image */}
        {community.coverImageUrl ? (
          <View style={hd.coverWrap}>
            <Image
              source={{ uri: resolveMediaUrl(community.coverImageUrl) }}
              style={hd.cover}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(10,18,40,0.92)"]}
              style={hd.coverGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </View>
        ) : (
          <LinearGradient
            colors={["rgba(255,215,0,0.12)", "rgba(255,140,0,0.06)"]}
            style={hd.coverPlaceholder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name={catIcon as any}
              size={40}
              color="rgba(255,215,0,0.3)"
            />
          </LinearGradient>
        )}

        {/* Info block */}
        <View style={hd.infoBlock}>
          {/* Category badge */}
          <View style={hd.catBadge}>
            <Ionicons name={catIcon as any} size={11} color={colors.eu.star} />
            <Text style={hd.catText}>{catLabel}</Text>
          </View>

          <Text style={hd.name}>{community.name}</Text>

          {community.description ? (
            <Text style={hd.desc} numberOfLines={3}>
              {community.description}
            </Text>
          ) : null}

          {/* Stats + join row */}
          <View style={hd.statsRow}>
            {/* Member avatars + count */}
            <Pressable
              style={hd.membersGroup}
              onPress={() => navigation.navigate("CommunityMembers", { communityId })}
            >
              {community.membersPreview?.length > 0 && (
                <MemberAvatars
                  members={community.membersPreview}
                  total={community.memberCount ?? 0}
                />
              )}
              <Text style={hd.memberCount}>
                {community.memberCount ?? 0} {community.memberCount === 1 ? "miembro" : "miembros"}
              </Text>
            </Pressable>

            {/* Join / Leave / Role button */}
            {community.isMember ? (
              isAdmin ? (
                <View style={hd.roleBadge}>
                  <Ionicons
                    name="shield-checkmark"
                    size={13}
                    color={colors.eu.star}
                  />
                  <Text style={hd.roleText}>
                    {community.currentUserRole === "ADMIN" ? "Admin" : "Mod"}
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={handleJoin}
                  disabled={joinLoading}
                  style={hd.memberBtn}
                >
                  {joinLoading ? (
                    <ActivityIndicator size="small" color={colors.eu.star} />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color={colors.eu.star}
                      />
                      <Text style={hd.memberBtnText}>Miembro</Text>
                    </>
                  )}
                </Pressable>
              )
            ) : (
              <Pressable
                onPress={handleJoin}
                disabled={joinLoading}
                style={hd.joinBtn}
              >
                <LinearGradient
                  colors={colors.gradient.accent as [string, string]}
                  style={hd.joinGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {joinLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={hd.joinText}>Unirse</Text>
                  )}
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>

        {/* Divider */}
        <View style={hd.divider} />
      </Animated.View>
    );
  }, [community, handleJoin, joinLoading]);

  /* ── render post ── */
  const renderPost = useCallback(
    ({ item }: { item: CommunityPostData }) => (
      <PostCard 
        post={item} 
        onLike={handleLike} 
        onPressComments={(post) => {
          navigation.navigate("CommunityPostComments", {
            communityId,
            postParam: post,
          });
        }} 
      />
    ),
    [handleLike, navigation, communityId],
  );

  /* ── Empty state ── */
  const EmptyPosts = useCallback(
    () => (
      <Animated.View
        entering={FadeInUp.delay(200).duration(400)}
        style={st.empty}
      >
        <View style={st.emptyIcon}>
          <Ionicons
            name="chatbubbles-outline"
            size={40}
            color={colors.text.tertiary}
          />
        </View>
        <Text style={st.emptyTitle}>Sin publicaciones aún</Text>
        <Text style={st.emptySubtitle}>
          {community?.isMember
            ? "¡Sé el primero en publicar algo!"
            : "Únete a la comunidad para ver y publicar contenido"}
        </Text>
        {!community?.isMember && (
          <Pressable
            onPress={handleJoin}
            disabled={joinLoading}
            style={st.emptyJoinBtn}
          >
            <LinearGradient
              colors={colors.gradient.accent as [string, string]}
              style={st.emptyJoinGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={st.emptyJoinText}>Unirse a la comunidad</Text>
            </LinearGradient>
          </Pressable>
        )}
      </Animated.View>
    ),
    [community, handleJoin, joinLoading],
  );

  /* ── UI ── */
  return (
    <ScreenBackground>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        {/* Toolbar */}
        <View style={st.toolbar}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={st.backBtn}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text.primary}
            />
          </Pressable>
          <Text style={st.toolbarTitle} numberOfLines={1}>
            {community?.name ??
              route.params.communityName ??
              "Comunidad"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={st.center}>
            <ActivityIndicator size="large" color={colors.eu.star} />
          </View>
        ) : (
          <FlashList
            data={posts}
            keyExtractor={(p) => String(p.id)}
            renderItem={renderPost}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={EmptyPosts}
            estimatedItemSize={200}
            contentContainerStyle={{
              paddingBottom:
                insets.bottom + TAB_BAR_HEIGHT + spacing.md,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.eu.star}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
          />
        )}

        {/* FAB — only for members */}
        {community?.isMember && (
          <Animated.View
            entering={ZoomIn.delay(400).duration(400).springify()}
            style={[
              st.fab,
              { bottom: insets.bottom + TAB_BAR_HEIGHT + spacing.md },
            ]}
          >
            <Pressable
              onPress={() =>
                navigation.navigate("CreateCommunityPost", {
                  communityId,
                })
              }
            >
              <LinearGradient
                colors={colors.gradient.accent as [string, string]}
                style={st.fabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="add" size={28} color="#fff" />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </ScreenBackground>
  );
}

/* ─── Header styles ──────────────────────────────────────── */
const hd = StyleSheet.create({
  coverWrap: { width: "100%", height: 160, position: "relative" },
  cover: { width: "100%", height: "100%" },
  coverGrad: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  coverPlaceholder: {
    width: "100%",
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,215,0,0.1)",
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.25)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  catText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.eu.star,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  name: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  desc: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    lineHeight: typography.sizes.body.lineHeight,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  membersGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  memberCount: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  memberBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.35)",
    backgroundColor: "rgba(255,215,0,0.08)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 90,
    justifyContent: "center",
  },
  memberBtnText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.eu.star,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.4)",
    backgroundColor: "rgba(255,215,0,0.1)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  roleText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.eu.star,
  },
  joinBtn: { borderRadius: radii.full, overflow: "hidden" },
  joinGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    minWidth: 90,
    alignItems: "center",
  },
  joinText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: "#fff",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: spacing.md,
  },
});

/* ─── Screen styles ──────────────────────────────────────── */
const st = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  toolbar: {
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
    flex: 1,
    textAlign: "center",
    marginHorizontal: spacing.sm,
  },

  empty: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.09)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: typography.sizes.body.lineHeight,
    marginBottom: spacing.xl,
  },
  emptyJoinBtn: { borderRadius: radii.full, overflow: "hidden" },
  emptyJoinGradient: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.full,
    alignItems: "center",
  },
  emptyJoinText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: "#fff",
  },

  fab: {
    position: "absolute",
    right: spacing.lg,
    zIndex: 10,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});
