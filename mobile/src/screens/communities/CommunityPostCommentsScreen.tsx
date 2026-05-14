import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Alert,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, Layout, ZoomIn } from "react-native-reanimated";

import { colors, typography, spacing, radii, borders } from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
import * as communitiesApi from "@/api/communities";
import { handleError } from "@/utils/errorHandler";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import type { CommunityPostData, CommunityCommentData } from "@/types/communities";

type CommunitiesStackParamList = {
  CommunityPostComments: { communityId: number; postParam: CommunityPostData };
};
type RouteType = RouteProp<CommunitiesStackParamList, "CommunityPostComments">;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function fullName(first?: string, last?: string): string {
  return [first, last].filter(Boolean).join(" ") || "Usuario";
}

/* ─── Post Preview (header de la lista) ─── */
function PostPreview({ post }: { post: CommunityPostData }) {
  const name = fullName(post.authorFirstName, post.authorLastName);
  return (
    <Animated.View entering={FadeIn.duration(350)} style={pp.container}>
      <View style={pp.authorRow}>
        {post.authorProfilePhotoUrl ? (
          <Image source={{ uri: resolveMediaUrl(post.authorProfilePhotoUrl) }} style={pp.avatar} />
        ) : (
          <View style={[pp.avatar, pp.avatarPh]}>
            <Text style={pp.avatarInitial}>{name[0] ?? "?"}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={pp.name}>{name}</Text>
          <Text style={pp.time}>{timeAgo(post.createdAt)}</Text>
        </View>
      </View>
      <Text style={pp.content} numberOfLines={3}>{post.content}</Text>
      <View style={pp.divider} />
      <Text style={pp.commentsLabel}>Comentarios</Text>
    </Animated.View>
  );
}

const pp = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPh: {
    backgroundColor: colors.glass.whiteMid,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: colors.text.primary,
  },
  name: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary,
  },
  time: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  content: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    lineHeight: typography.sizes.body.lineHeight,
    marginBottom: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginBottom: spacing.md,
  },
  commentsLabel: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
});

/* ─── Comment Item ─── */
function CommentItem({ item, index }: { item: CommunityCommentData; index: number }) {
  const name = fullName(item.authorFirstName, item.authorLastName);
  return (
    <Animated.View
      layout={Layout.springify()}
      entering={FadeInDown.delay(index * 30).duration(300)}
      style={ci.container}
    >
      {item.authorProfilePhotoUrl ? (
        <Image source={{ uri: resolveMediaUrl(item.authorProfilePhotoUrl) }} style={ci.avatar} />
      ) : (
        <View style={[ci.avatar, ci.avatarPh]}>
          <Text style={ci.avatarInitial}>{name[0] ?? "?"}</Text>
        </View>
      )}
      <View style={ci.bubble}>
        <View style={ci.bubbleHeader}>
          <Text style={ci.authorName}>{name}</Text>
          <Text style={ci.time}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={ci.content}>{item.content}</Text>
      </View>
    </Animated.View>
  );
}

const ci = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginTop: 2,
  },
  avatarPh: {
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: colors.text.primary,
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderTopLeftRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.07)",
    padding: spacing.md,
  },
  bubbleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  authorName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary,
  },
  time: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
  },
  content: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

/* ══════════════════════════════════════════════════
   Main Screen
   ══════════════════════════════════════════════════ */
export default function CommunityPostCommentsScreen() {
  const route = useRoute<RouteType>();
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { communityId, postParam } = route.params;
  const inputRef = useRef<TextInput>(null);

  const [post, setPost] = useState<CommunityPostData>(postParam);
  const [comments, setComments] = useState<CommunityCommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const data = await communitiesApi.getPostComments(communityId, post.id);
      setComments(data);
    } catch (e) {
      handleError(e, "Comments.fetch");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [communityId, post.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = useCallback(async () => {
    if (!newComment.trim() || submitting) return;
    const text = newComment.trim();
    setNewComment("");
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await communitiesApi.createComment(communityId, post.id, { content: text });
      setComments((prev) => [...prev, res]);
      // Update comment count locally so the header stays accurate
      setPost((p) => ({ ...p, commentCount: (p.commentCount ?? 0) + 1 }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      setNewComment(text);
      const msg = handleError(e, "Comments.submit");
      Alert.alert("No se pudo comentar", msg);
    } finally {
      setSubmitting(false);
    }
  }, [communityId, post.id, newComment, submitting]);

  const renderComment = useCallback(
    ({ item, index }: { item: CommunityCommentData; index: number }) => (
      <CommentItem item={item} index={index} />
    ),
    []
  );

  const commentCount = post.commentCount ?? comments.length;

  return (
    <ScreenBackground>
      <View style={[st.container, { paddingTop: insets.top }]}>

        {/* ── Header ── */}
        <Animated.View entering={FadeIn.duration(300)} style={st.header}>
          <Pressable onPress={() => nav.goBack()} hitSlop={14} style={st.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={st.headerTitle}>Comentarios</Text>
            <Text style={st.headerSub}>
              {commentCount} {commentCount === 1 ? "comentario" : "comentarios"}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </Animated.View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          {loading ? (
            <View style={st.center}>
              <ActivityIndicator size="large" color={colors.eu.star} />
            </View>
          ) : (
            <FlashList
              data={comments}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderComment}
              estimatedItemSize={90}
              ListHeaderComponent={<PostPreview post={post} />}
              contentContainerStyle={{ paddingTop: spacing.xs, paddingBottom: spacing.xl }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={colors.eu.star}
                />
              }
              ListEmptyComponent={
                <Animated.View entering={FadeInDown.delay(200).duration(400)} style={st.emptyBox}>
                  <View style={st.emptyIcon}>
                    <Ionicons name="chatbubbles-outline" size={36} color={colors.text.tertiary} />
                  </View>
                  <Text style={st.emptyText}>Sin comentarios todavía</Text>
                  <Text style={st.emptySub}>¡Sé el primero en comentar!</Text>
                </Animated.View>
              }
            />
          )}

          {/* ── Input Bar ── */}
          <View style={[st.inputSection, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={[st.inputAvatar, st.avatarPh]}>
              <Ionicons name="person" size={14} color={colors.text.secondary} />
            </View>
            <TextInput
              ref={inputRef}
              style={st.input}
              placeholder="Escribe un comentario..."
              placeholderTextColor={colors.text.tertiary}
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
              returnKeyType="default"
            />
            <Pressable
              style={({ pressed }) => [
                st.sendBtn,
                (!newComment.trim() || submitting) && st.sendBtnDisabled,
                pressed && { opacity: 0.8, transform: [{ scale: 0.93 }] },
              ]}
              onPress={handleSubmit}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <LinearGradient
                  colors={newComment.trim() ? ["#FFD700", "#FF8C00"] : ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
                  style={st.sendGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="send" size={15} color={newComment.trim() ? "#06081A" : colors.text.tertiary} />
                </LinearGradient>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: borders.hairline,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.09)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
  },
  headerSub: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: 1,
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  emptyBox: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
    alignItems: "center",
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
  },

  inputSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: borders.hairline,
    borderTopColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(10,18,40,0.92)",
    gap: 8,
  },
  inputAvatar: {
    width: 30,
    height: 30,
    borderRadius: radii.full,
    marginBottom: 6,
  },
  avatarPh: {
    backgroundColor: "rgba(255,255,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    color: colors.text.primary,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 4,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
