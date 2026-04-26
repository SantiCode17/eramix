/**
 * ════════════════════════════════════════════════════════════════
 *  PostDetailScreen — Full Post View with Comments
 *
 *  • Full post image + content
 *  • Like / comment / save actions
 *  • All comments with real API
 *  • Add comment input at bottom
 * ════════════════════════════════════════════════════════════════
 */
import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { StackScreenProps } from "@react-navigation/stack";

import { ScreenBackground, Avatar } from "@/design-system";
import { colors, typography, spacing, DS } from "@/design-system/tokens";
import { getCommunityPosts, togglePostLike, createComment } from "@/api/communities";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import type { ProfileStackParamList } from "@/types";
import type { CommunityPostData, CommunityCommentData } from "@/types/communities";

type Props = StackScreenProps<ProfileStackParamList, "PostDetail">;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

/* ── Comment Row ── */
function CommentRow({ comment }: { comment: CommunityCommentData }) {
  return (
    <Animated.View entering={FadeInDown.springify()} style={s.commentRow}>
      <Avatar
        name={`${comment.authorFirstName} ${comment.authorLastName}`}
        uri={comment.authorProfilePhotoUrl ? resolveMediaUrl(comment.authorProfilePhotoUrl) : undefined}
        size="sm"
      />
      <View style={s.commentBody}>
        <Text style={s.commentAuthor}>
          {comment.authorFirstName} {comment.authorLastName}
          <Text style={s.commentText}>  {comment.content}</Text>
        </Text>
        <Text style={s.commentTime}>{timeAgo(comment.createdAt)}</Text>
      </View>
    </Animated.View>
  );
}

/* ═══ Main Screen ═══ */
export default function PostDetailScreen({ route, navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { communityId, postId } = route.params;
  const inputRef = useRef<TextInput>(null);

  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ── Fetch post from community posts ── */
  const { data: post, isLoading } = useQuery<CommunityPostData | null>({
    queryKey: ["postDetail", communityId, postId],
    queryFn: async () => {
      const page = await getCommunityPosts(communityId);
      const found = page.content.find((p: CommunityPostData) => p.id === postId);
      if (found) {
        setLiked(found.likedByCurrentUser);
      }
      return found ?? null;
    },
  });

  /* ── Like mutation ── */
  const likeMut = useMutation({
    mutationFn: () => togglePostLike(communityId, postId),
    onMutate: () => setLiked((p) => !p),
    onSettled: () => qc.invalidateQueries({ queryKey: ["postDetail", communityId, postId] }),
  });

  /* ── Comment mutation ── */
  const commentMut = useMutation({
    mutationFn: (content: string) => createComment(communityId, postId, { content }),
    onSuccess: () => {
      setCommentText("");
      qc.invalidateQueries({ queryKey: ["postDetail", communityId, postId] });
    },
  });

  const handleComment = useCallback(() => {
    const text = commentText.trim();
    if (!text) return;
    commentMut.mutate(text);
  }, [commentText, commentMut]);

  if (isLoading) {
    return (
      <ScreenBackground>
        <View style={s.center}>
          <ActivityIndicator size="large" color={DS.primary} />
        </View>
      </ScreenBackground>
    );
  }

  if (!post) {
    return (
      <ScreenBackground>
        <View style={[s.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={s.headerBtn}>
              <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
            </View>
          </TouchableOpacity>
        </View>
        <View style={s.center}>
          <Text style={s.emptyText}>Publicación no encontrada</Text>
        </View>
      </ScreenBackground>
    );
  }

  const authorPhoto = post.authorProfilePhotoUrl ? resolveMediaUrl(post.authorProfilePhotoUrl) : undefined;
  const postImage = post.imageUrl ? resolveMediaUrl(post.imageUrl) : undefined;
  const comments: CommunityCommentData[] = post.recentComments ?? [];

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={20}
      >
        {/* Header */}
        <View style={[s.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <View style={s.headerBtn}>
              <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
            </View>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerEyebrow}>POST</Text>
            <Text style={s.headerTitle}>Detalle de publicación</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <FlatList
          data={comments}
          keyExtractor={(c) => String(c.id)}
          renderItem={({ item }) => <CommentRow comment={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListHeaderComponent={
            <View>
              <View style={s.heroNote}>
                <LinearGradient colors={["rgba(255,215,0,0.14)", "rgba(59,107,255,0.08)"]} style={s.heroNoteGlow} />
                <Ionicons name="sparkles-outline" size={14} color={colors.eu.star} />
                <Text style={s.heroNoteText}>Este post forma parte de tu vitrina pública en perfil.</Text>
              </View>

              {/* Author row */}
              <Animated.View entering={FadeIn} style={s.authorRow}>
                <Avatar
                  name={`${post.authorFirstName} ${post.authorLastName}`}
                  uri={authorPhoto}
                  size="sm"
                />
                <View style={{ flex: 1 }}>
                  <Text style={s.authorName}>
                    {post.authorFirstName} {post.authorLastName}
                  </Text>
                  <Text style={s.postTime}>{timeAgo(post.createdAt)}</Text>
                </View>
              </Animated.View>

              {/* Image */}
              {postImage && (
                <Animated.View entering={FadeIn.delay(100)}>
                  <Image source={{ uri: postImage }} style={s.postImage} resizeMode="cover" />
                </Animated.View>
              )}

              {/* Actions */}
              <View style={s.actions}>
                <TouchableOpacity onPress={() => likeMut.mutate()} style={s.actionBtn}>
                  <Ionicons
                    name={liked ? "heart" : "heart-outline"}
                    size={24}
                    color={liked ? "#FF4F6F" : colors.text.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => inputRef.current?.focus()} style={s.actionBtn}>
                  <Ionicons name="chatbubble-outline" size={22} color={colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn}>
                  <Ionicons name="paper-plane-outline" size={22} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <TouchableOpacity onPress={() => setSaved((p) => !p)} style={s.actionBtn}>
                  <Ionicons
                    name={saved ? "bookmark" : "bookmark-outline"}
                    size={22}
                    color={saved ? DS.primary : colors.text.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Likes count */}
              <Text style={s.likeCount}>
                {(post.likeCount ?? 0) + (liked && !post.likedByCurrentUser ? 1 : !liked && post.likedByCurrentUser ? -1 : 0)} Me gusta
              </Text>

              {/* Content */}
              {post.content ? (
                <View style={s.contentArea}>
                  <Text style={s.contentText}>
                    <Text style={s.authorNameBold}>
                      {post.authorFirstName}
                    </Text>
                    {"  "}
                    {post.content}
                  </Text>
                </View>
              ) : null}

              {/* Comments header */}
              {comments.length > 0 && (
                <Text style={s.commentsHeader}>
                  Comentarios ({post.commentCount ?? comments.length})
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={s.emptyComments}>
              <Ionicons name="chatbubbles-outline" size={32} color={colors.text.tertiary} />
              <Text style={s.emptyText}>Sé el primero en comentar</Text>
            </View>
          }
        />

        {/* Input */}
        <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            ref={inputRef}
            style={s.input}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Añadir un comentario..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleComment}
            disabled={!commentText.trim() || commentMut.isPending}
            hitSlop={8}
          >
            {commentMut.isPending ? (
              <ActivityIndicator size="small" color={DS.primary} />
            ) : (
              <Text style={[s.sendText, !commentText.trim() && { opacity: 0.3 }]}>Publicar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

/* ═══ Styles ═══ */
const s = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingBottom: 8 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center" },
  headerCenter: {
    alignItems: "center",
  },
  headerEyebrow: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1,
  },
  headerTitle: { fontFamily: typography.families.subheading, fontSize: typography.sizes.h4.fontSize, color: colors.text.primary },
  heroNote: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    overflow: "hidden",
  },
  heroNoteGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  heroNoteText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  // Author
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: spacing.md, paddingVertical: 10 },
  authorName: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.text.primary },
  postTime: { fontFamily: typography.families.body, fontSize: 11, color: colors.text.tertiary },
  // Image
  postImage: { width: "100%", aspectRatio: 1, backgroundColor: "rgba(255,255,255,0.03)" },
  // Actions
  actions: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 10, gap: 12 },
  actionBtn: { padding: 2 },
  likeCount: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.text.primary, paddingHorizontal: spacing.md, marginTop: 6 },
  // Content
  contentArea: { paddingHorizontal: spacing.md, marginTop: 6 },
  contentText: { fontFamily: typography.families.body, fontSize: 13, color: colors.text.secondary, lineHeight: 19 },
  authorNameBold: { fontFamily: typography.families.bodyMedium, color: colors.text.primary },
  // Comments
  commentsHeader: { fontFamily: typography.families.body, fontSize: 12, color: colors.text.tertiary, paddingHorizontal: spacing.md, marginTop: 16, marginBottom: 8 },
  commentRow: { flexDirection: "row", gap: 10, paddingHorizontal: spacing.md, paddingVertical: 6, alignItems: "flex-start" },
  commentBody: { flex: 1 },
  commentAuthor: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.text.primary },
  commentText: { fontFamily: typography.families.body, color: colors.text.secondary },
  commentTime: { fontFamily: typography.families.body, fontSize: 10, color: colors.text.tertiary, marginTop: 3 },
  emptyComments: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontFamily: typography.families.body, fontSize: 13, color: colors.text.tertiary },
  // Input bar
  inputBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingTop: 10, borderTopWidth: 0.5, borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(10,22,40,0.95)", gap: 10 },
  input: { flex: 1, fontFamily: typography.families.body, fontSize: 14, color: colors.text.primary, maxHeight: 80 },
  sendText: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: DS.primary },
});
