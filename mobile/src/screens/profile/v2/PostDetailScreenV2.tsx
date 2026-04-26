import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StackScreenProps } from "@react-navigation/stack";

import { Avatar, ScreenBackground } from "@/design-system";
import { colors, radii, spacing, typography } from "@/design-system/tokens";
import { useMyProfile } from "@/hooks/useProfileQuery";
import type { ProfileStackParamList } from "@/types";
import { addCommentToProfilePost, getProfilePostById, toggleLikeProfilePost } from "../data/profilePosts";

type Props = StackScreenProps<ProfileStackParamList, "PostDetail">;

function relativeTime(date: string): string {
  const diff = Date.now() - +new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function PostDetailScreenV2({ route, navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const myProfile = useMyProfile();
  const [commentText, setCommentText] = useState("");

  const postId = route.params.postId;

  const postQuery = useQuery({
    queryKey: ["profilePostDetail", postId],
    queryFn: () => getProfilePostById(postId),
  });

  const likeMut = useMutation({
    mutationFn: () => toggleLikeProfilePost(postId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profilePosts"] });
      await postQuery.refetch();
    },
  });

  const commentMut = useMutation({
    mutationFn: (content: string) => addCommentToProfilePost(postId, content, `${myProfile.data?.firstName ?? "Usuario"} ${myProfile.data?.lastName ?? ""}`.trim()),
    onSuccess: async () => {
      setCommentText("");
      await queryClient.invalidateQueries({ queryKey: ["profilePosts"] });
      await postQuery.refetch();
    },
    onError: (error: any) => Alert.alert("Error", error?.message ?? "No se pudo enviar el comentario."),
  });

  const post = postQuery.data;

  const comments = useMemo(() => post?.comments ?? [], [post?.comments]);

  const onComment = useCallback(() => {
    const text = commentText.trim();
    if (!text) return;
    commentMut.mutate(text);
  }, [commentText, commentMut]);

  if (postQuery.isLoading) {
    return (
      <ScreenBackground>
        <View style={s.centered}><ActivityIndicator size="large" color={colors.eu.star} /></View>
      </ScreenBackground>
    );
  }

  if (!post) {
    return (
      <ScreenBackground>
        <View style={[s.header, { paddingTop: insets.top + 8 }]}> 
          <Pressable style={s.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </Pressable>
          <Text style={s.headerTitle}>Publicación</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={s.centered}><Text style={s.emptyText}>Publicación no encontrada.</Text></View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[s.header, { paddingTop: insets.top + 8 }]}> 
          <Pressable style={s.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </Pressable>
          <Text style={s.headerTitle}>Publicación</Text>
          <View style={{ width: 38 }} />
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          ListHeaderComponent={
            <View style={s.postCard}>
              <Text style={s.postTime}>{relativeTime(post.createdAt)}</Text>
              <Text style={s.postContent}>{post.content}</Text>
              <View style={s.actionsRow}>
                <Pressable style={s.actionBtn} onPress={() => likeMut.mutate()}>
                  <Ionicons name={post.likedByMe ? "heart" : "heart-outline"} size={20} color={post.likedByMe ? "#FF5D77" : colors.text.primary} />
                  <Text style={s.actionText}>{post.likeCount}</Text>
                </Pressable>
                <View style={s.actionBtn}>
                  <Ionicons name="chatbubble-outline" size={19} color={colors.text.primary} />
                  <Text style={s.actionText}>{comments.length}</Text>
                </View>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={s.commentRow}>
              <Avatar name={item.authorName} size="sm" />
              <View style={{ flex: 1 }}>
                <Text style={s.commentAuthor}>{item.authorName}</Text>
                <Text style={s.commentContent}>{item.content}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={s.emptyComments}>Sin comentarios todavía.</Text>}
        />

        <View style={[s.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}> 
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Añadir comentario"
            placeholderTextColor={colors.text.tertiary}
            style={s.input}
            multiline
          />
          <Pressable onPress={onComment} disabled={!commentText.trim() || commentMut.isPending}>
            {commentMut.isPending ? <ActivityIndicator size="small" color={colors.eu.star} /> : <Text style={[s.send, !commentText.trim() && { opacity: 0.35 }]}>Enviar</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    color: colors.text.primary,
  },
  emptyText: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  postCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: spacing.sm,
    gap: spacing.sm,
  },
  postTime: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.tertiary,
  },
  postContent: {
    fontFamily: typography.families.body,
    fontSize: 15,
    lineHeight: 23,
    color: colors.text.primary,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
  commentRow: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  commentAuthor: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
  },
  commentContent: {
    marginTop: 2,
    fontFamily: typography.families.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text.secondary,
  },
  emptyComments: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    fontFamily: typography.families.body,
    color: colors.text.tertiary,
  },
  inputBar: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(10,22,40,0.95)",
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.primary,
    maxHeight: 80,
  },
  send: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: colors.eu.star,
  },
});
