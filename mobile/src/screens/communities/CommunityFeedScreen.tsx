import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type {
  CommunityData,
  CommunityPostData,
  CommunityCommentData,
  CommunitiesStackParamList,
} from "@/types/communities";
import * as communitiesApi from "@/api/communities";
import { handleError } from "@/utils/errorHandler";

type ScreenRoute = RouteProp<CommunitiesStackParamList, "CommunityFeed">;
type Nav = StackNavigationProp<CommunitiesStackParamList, "CommunityFeed">;

// ── Helpers ─────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

// ── Comment Row ─────────────────────────────────────

function CommentRow({ comment }: { comment: CommunityCommentData }) {
  return (
    <View style={styles.comment}>
      <Text style={styles.commentAuthor}>
        {comment.authorFirstName} {comment.authorLastName}
      </Text>
      <Text style={styles.commentBody}>{comment.content}</Text>
    </View>
  );
}

// ── Post Card ───────────────────────────────────────

function PostCard({
  post,
  communityId,
  index,
  onLikeToggle,
  onCommentSubmit,
}: {
  post: CommunityPostData;
  communityId: number;
  index: number;
  onLikeToggle: (postId: number) => void;
  onCommentSubmit: (postId: number, content: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleComment = () => {
    const text = commentText.trim();
    if (!text) return;
    onCommentSubmit(post.id, text);
    setCommentText("");
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <View style={styles.postCard}>
        {post.isPinned && (
          <View style={styles.pinnedBadge}>
            <Text style={styles.pinnedText}>📌 Fijado</Text>
          </View>
        )}

        {/* Author header */}
        <View style={styles.postHeader}>
          {post.authorProfilePhotoUrl ? (
            <Image
              source={{ uri: post.authorProfilePhotoUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {post.authorFirstName?.[0] ?? "?"}
              </Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={styles.postAuthor}>
              {post.authorFirstName} {post.authorLastName}
            </Text>
            <Text style={styles.postTime}>{timeAgo(post.createdAt)}</Text>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.postContent}>{post.content}</Text>

        {post.imageUrl && (
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        )}

        {/* Actions */}
        <View style={styles.postActions}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onLikeToggle(post.id);
            }}
            style={styles.actionBtn}
          >
            <Text style={styles.actionIcon}>
              {post.likedByCurrentUser ? "❤️" : "🤍"}
            </Text>
            <Text style={styles.actionCount}>{post.likeCount}</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowComments(!showComments)}
            style={styles.actionBtn}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>{post.commentCount}</Text>
          </Pressable>
        </View>

        {/* Comments section */}
        {showComments && (
          <View style={styles.commentsSection}>
            {post.recentComments?.map((c) => (
              <CommentRow key={c.id} comment={c} />
            ))}

            <View style={styles.commentInput}>
              <TextInput
                style={styles.commentTextInput}
                placeholder="Escribe un comentario..."
                placeholderTextColor={colors.text.disabled}
                value={commentText}
                onChangeText={setCommentText}
                onSubmitEditing={handleComment}
                returnKeyType="send"
              />
              <Pressable onPress={handleComment} style={styles.commentSend}>
                <Text style={{ fontSize: 18 }}>📤</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ── Screen ──────────────────────────────────────────

export default function CommunityFeedScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<ScreenRoute>();
  const insets = useSafeAreaInsets();
  const { communityId, communityName } = route.params;

  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [posts, setPosts] = useState<CommunityPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchCommunity = useCallback(async () => {
    try {
      const data = await communitiesApi.getCommunity(communityId);
      setCommunity(data);
    } catch (e) {
      handleError(e, "CommunityFeed.getCommunity");
    }
  }, [communityId]);

  const fetchPosts = useCallback(
    async (p: number = 0, reset: boolean = false) => {
      try {
        const data = await communitiesApi.getCommunityPosts(communityId, p);
        if (reset) {
          setPosts(data.content);
        } else {
          setPosts((prev) => [...prev, ...data.content]);
        }
        setHasMore(!data.last);
        setPage(p);
      } catch (e) {
        handleError(e, "CommunityFeed.getPosts");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [communityId],
  );

  useEffect(() => {
    fetchCommunity();
    fetchPosts(0, true);
  }, [fetchCommunity, fetchPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCommunity();
    fetchPosts(0, true);
  }, [fetchCommunity, fetchPosts]);

  const onEndReached = useCallback(() => {
    if (hasMore && !loading) {
      fetchPosts(page + 1, false);
    }
  }, [hasMore, loading, page, fetchPosts]);

  const handleLikeToggle = useCallback(
    async (postId: number) => {
      try {
        const updated = await communitiesApi.togglePostLike(
          communityId,
          postId,
        );
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? updated : p)),
        );
      } catch (e) {
        handleError(e, "CommunityFeed.toggleLike");
      }
    },
    [communityId],
  );

  const handleCommentSubmit = useCallback(
    async (postId: number, content: string) => {
      try {
        await communitiesApi.createComment(communityId, postId, { content });
        // Refresh the post to get updated comment count
        fetchPosts(0, true);
      } catch (e) {
        handleError(e, "CommunityFeed.createComment");
      }
    },
    [communityId, fetchPosts],
  );

  const handleJoinLeave = useCallback(async () => {
    if (!community) return;
    try {
      if (community.isMember) {
        await communitiesApi.leaveCommunity(communityId);
      } else {
        await communitiesApi.joinCommunity(communityId);
      }
      fetchCommunity();
    } catch (e) {
      handleError(e, "CommunityFeed.joinLeave");
    }
  }, [community, communityId, fetchCommunity]);

  const renderPost = useCallback(
    ({ item, index }: { item: CommunityPostData; index: number }) => (
      <PostCard
        post={item}
        communityId={communityId}
        index={index}
        onLikeToggle={handleLikeToggle}
        onCommentSubmit={handleCommentSubmit}
      />
    ),
    [communityId, handleLikeToggle, handleCommentSubmit],
  );

  const ListHeader = useCallback(() => {
    if (!community) return null;
    return (
      <View style={styles.communityHeader}>
        <Text style={styles.communityName}>{community.name}</Text>
        {community.description && (
          <Text style={styles.communityDesc}>{community.description}</Text>
        )}
        <View style={styles.communityMeta}>
          <Text style={styles.metaText}>
            👥 {community.memberCount} miembros
          </Text>
          <Pressable onPress={handleJoinLeave} style={styles.joinLeaveBtn}>
            <Text style={styles.joinLeaveText}>
              {community.isMember ? "Abandonar" : "Unirse"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }, [community, handleJoinLeave]);

  return (
    <LinearGradient
      colors={[colors.background.start, colors.background.end]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {communityName}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && posts.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.eu.star} />
        </View>
      ) : (
        <FlashList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={ListHeader}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.eu.star}
              colors={[colors.eu.star]}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>📝</Text>
              <Text style={styles.emptyTitle}>Sin publicaciones aún</Text>
              <Text style={styles.emptySubtitle}>
                Sé el primero en publicar algo
              </Text>
            </View>
          }
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 80,
          }}
        />
      )}

      {/* FAB create post */}
      {community?.isMember && (
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + 24 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            nav.navigate("CreateCommunityPost", { communityId });
          }}
        >
          <LinearGradient
            colors={[colors.accent.start, colors.accent.end]}
            style={styles.fabGradient}
          >
            <Text style={styles.fabText}>✏️</Text>
          </LinearGradient>
        </Pressable>
      )}
    </LinearGradient>
  );
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header bar
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.text.primary,
  },

  // Community header
  communityHeader: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  communityName: {
    fontFamily: typography.families.heading,
    ...typography.sizes.h2,
    color: colors.text.primary,
  },
  communityDesc: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  communityMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  metaText: {
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.secondary,
  },
  joinLeaveBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.eu.star + "20",
    borderWidth: 1,
    borderColor: colors.eu.star,
  },
  joinLeaveText: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.small,
    color: colors.eu.star,
  },

  // Post card
  postCard: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  pinnedBadge: {
    backgroundColor: colors.eu.star + "15",
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  pinnedText: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.small,
    color: colors.eu.star,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: {
    backgroundColor: colors.eu.mid,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.caption,
    color: colors.text.primary,
  },
  postAuthor: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.caption,
    color: colors.text.primary,
  },
  postTime: {
    fontFamily: typography.families.body,
    ...typography.sizes.small,
    color: colors.text.secondary,
  },
  postContent: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: radii.md,
    marginTop: spacing.sm,
  },

  // Actions
  postActions: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: spacing.lg,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  actionIcon: { fontSize: 18 },
  actionCount: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.caption,
    color: colors.text.secondary,
  },

  // Comments
  commentsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  comment: { marginBottom: spacing.sm },
  commentAuthor: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.small,
    color: colors.text.primary,
  },
  commentBody: {
    fontFamily: typography.families.body,
    ...typography.sizes.small,
    color: colors.text.secondary,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
    backgroundColor: colors.glass.whiteMid,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
  },
  commentTextInput: {
    flex: 1,
    fontFamily: typography.families.body,
    ...typography.sizes.caption,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  commentSend: { padding: spacing.xs },

  // Empty
  empty: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
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

  // FAB
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
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: { fontSize: 24 },
});
