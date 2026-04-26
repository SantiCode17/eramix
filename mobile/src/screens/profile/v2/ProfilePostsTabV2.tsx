import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { colors, radii, spacing, typography } from "@/design-system/tokens";
import type { ProfilePost } from "../data/profilePosts";

type Props = {
  posts: ProfilePost[];
  onCreatePost: () => void;
  onOpenPost: (postId: number) => void;
};

function getRelativeTime(date: string): string {
  const diff = Date.now() - +new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function ProfilePostsTabV2({ posts, onCreatePost, onOpenPost }: Props): React.JSX.Element {
  if (posts.length === 0) {
    return (
      <View style={s.emptyCard}>
        <Ionicons name="newspaper-outline" size={40} color={colors.text.tertiary} />
        <Text style={s.emptyTitle}>Sin publicaciones todavía</Text>
        <Text style={s.emptySubtitle}>Publica desde tu perfil cuando quieras, sin depender de comunidades.</Text>
        <Pressable style={s.emptyButton} onPress={onCreatePost}>
          <Ionicons name="add" size={16} color="#0A1628" />
          <Text style={s.emptyButtonText}>Nueva publicación</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
  keyExtractor={(item) => String(item.id)}
      scrollEnabled={false}
      contentContainerStyle={s.list}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 45).springify()}>
          <Pressable style={s.postCard} onPress={() => onOpenPost(item.id)}>
            <View style={s.postTopRow}>
              <Text style={s.postTime}>{getRelativeTime(item.createdAt)}</Text>
              <View style={s.postStatsRow}>
                <Ionicons name="heart-outline" size={14} color={colors.text.tertiary} />
                <Text style={s.postStatsText}>{item.likeCount}</Text>
                <Ionicons name="chatbubble-outline" size={14} color={colors.text.tertiary} />
                <Text style={s.postStatsText}>{item.comments.length}</Text>
              </View>
            </View>
            <Text style={s.postText} numberOfLines={4}>{item.content}</Text>
          </Pressable>
        </Animated.View>
      )}
    />
  );
}

const s = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  postCard: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  postTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postTime: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.tertiary,
  },
  postStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  postStatsText: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.tertiary,
    marginRight: 6,
  },
  postText: {
    fontFamily: typography.families.body,
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 21,
  },
  emptyCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.text.primary,
  },
  emptySubtitle: {
    textAlign: "center",
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
  emptyButton: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radii.full,
    backgroundColor: colors.eu.star,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  emptyButtonText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: "#0A1628",
  },
});
