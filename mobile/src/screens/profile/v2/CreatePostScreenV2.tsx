import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { StackScreenProps } from "@react-navigation/stack";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Avatar, ScreenBackground } from "@/design-system";
import { colors, radii, spacing, typography } from "@/design-system/tokens";
import { useMyProfile } from "@/hooks/useProfileQuery";
import type { ProfileStackParamList } from "@/types";
import { createProfilePost, getProfilePostById, updateProfilePost } from "../data/profilePosts";

type Props = StackScreenProps<ProfileStackParamList, "CreatePost">;

const MAX_CHARS = 500;

export default function CreatePostScreenV2({ route, navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const profileQuery = useMyProfile();
  const editPost = route.params?.editPost;
  const editPostId = editPost?.id;

  const [content, setContent] = useState("");

  React.useEffect(() => {
    let mounted = true;
  if (!editPostId) return;

    getProfilePostById(editPostId).then((post) => {
  if (mounted && post) setContent(post.content);
    });

    return () => {
      mounted = false;
    };
  }, [editPostId]);

  const publishMut = useMutation({
    mutationFn: async () => {
      const text = content.trim();
      if (!text) throw new Error("La publicación no puede estar vacía.");
      if (editPostId) {
        return updateProfilePost(editPostId, text);
      }
      return createProfilePost(text);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profilePosts"] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert("Error", error?.message ?? "No se pudo publicar.");
    },
  });

  const canPublish = content.trim().length > 0;
  const progress = useMemo(() => Math.min(100, (content.length / MAX_CHARS) * 100), [content.length]);

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={[s.header, { paddingTop: insets.top + 8 }]}> 
          <Pressable style={s.headerBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={22} color={colors.text.primary} />
          </Pressable>
          <Text style={s.headerTitle}>{editPostId ? "Editar publicación" : "Nueva publicación"}</Text>
          <Pressable style={[s.publishBtn, !canPublish && s.publishBtnDisabled]} onPress={() => publishMut.mutate()} disabled={!canPublish || publishMut.isPending}>
            {publishMut.isPending ? <ActivityIndicator size="small" color="#0A1628" /> : <Text style={s.publishBtnText}>{editPostId ? "Guardar" : "Publicar"}</Text>}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 24 }]}>
          <View style={s.authorRow}>
            <Avatar name={`${profileQuery.data?.firstName ?? ""} ${profileQuery.data?.lastName ?? ""}`} uri={profileQuery.data?.profilePhotoUrl} size="md" />
            <View>
              <Text style={s.authorName}>{`${profileQuery.data?.firstName ?? ""} ${profileQuery.data?.lastName ?? ""}`.trim() || "Usuario"}</Text>
              <Text style={s.authorMeta}>Perfil público</Text>
            </View>
          </View>

          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="¿Qué quieres compartir hoy?"
            placeholderTextColor={colors.text.tertiary}
            maxLength={MAX_CHARS}
            multiline
            autoFocus
            style={s.input}
          />

          <View style={s.progressTrack}>
            <View style={[s.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={s.counter}>{content.length}/{MAX_CHARS}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
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
  publishBtn: {
    borderRadius: radii.full,
    backgroundColor: colors.eu.star,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 84,
    alignItems: "center",
  },
  publishBtnDisabled: { opacity: 0.55 },
  publishBtnText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: "#0A1628",
  },
  scroll: { paddingHorizontal: spacing.md },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  authorName: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: colors.text.primary,
  },
  authorMeta: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.tertiary,
  },
  input: {
    minHeight: 180,
    textAlignVertical: "top",
    fontFamily: typography.families.body,
    fontSize: 17,
    lineHeight: 25,
    color: colors.text.primary,
  },
  progressTrack: {
    marginTop: spacing.md,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.eu.star,
  },
  counter: {
    marginTop: 6,
    textAlign: "right",
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.tertiary,
  },
});
