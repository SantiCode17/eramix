import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
  FlatList,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import type { UserPhotoResponse } from "@/types";

const { width: SCREEN_W } = Dimensions.get("window");
const GRID_GAP = 6;
const GRID_COLS = 3;
const ITEM_SIZE = (SCREEN_W - spacing.md * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;

interface VisualPost {
  id: number;
  imageUrl: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  createdAtLabel: string;
}

type Props = {
  photos: UserPhotoResponse[];
  onCreatePress?: () => void;
};

export function PostsTabScreen({ photos, onCreatePress }: Props): React.JSX.Element {
  const [selected, setSelected] = useState<VisualPost | null>(null);
  const [liked, setLiked] = useState(false);

  const posts = useMemo<VisualPost[]>(() => {
    return photos.map((photo, index) => ({
      id: photo.id,
      imageUrl: photo.photoUrl,
      caption: `Recuerdo Erasmus #${index + 1}`,
      likeCount: 12 + ((index * 9) % 58),
      commentCount: 2 + ((index * 3) % 14),
      createdAtLabel: `${Math.max(1, Math.round((index + 1) * 1.4))}d`,
    }));
  }, [photos]);

  if (posts.length === 0) {
    return (
      <View style={st.emptyWrap}>
        <LinearGradient
          colors={["rgba(255,215,0,0.12)", "rgba(255,140,53,0.04)"]}
          style={st.emptyGlow}
        />
        <Ionicons name="images-outline" size={48} color={colors.text.tertiary} />
        <Text style={st.emptyTitle}>Todavía no tienes publicaciones visuales</Text>
        <Text style={st.emptySubtitle}>Sube tu primera publicación para empezar tu muro de perfil.</Text>
        <Pressable onPress={onCreatePress} style={st.emptyCta}>
          <Text style={st.emptyCtaText}>Subir publicación</Text>
        </Pressable>
      </View>
    );
  }

  const openPost = (post: VisualPost) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(post);
    setLiked(false);
  };

  return (
    <View style={st.container}>
      <View style={st.headerStrip}>
        <View>
          <Text style={st.headerTitle}>Tu mural Erasmus</Text>
          <Text style={st.headerSubtitle}>{posts.length} recuerdos visuales guardados</Text>
        </View>
        <Pressable onPress={onCreatePress} style={st.newPostBtn}>
          <Ionicons name="add" size={16} color="#0A1628" />
          <Text style={st.newPostBtnText}>Subir</Text>
        </Pressable>
      </View>

      {posts[0] ? (
        <Pressable style={st.highlightCard} onPress={() => openPost(posts[0])}>
          <Image source={{ uri: resolveMediaUrl(posts[0].imageUrl) }} style={st.highlightImage} />
          <LinearGradient colors={["transparent", "rgba(4,6,26,0.92)"]} style={st.highlightOverlay} />
          <View style={st.highlightMeta}>
            <Text style={st.highlightTitle}>Destacado de tu perfil</Text>
            <Text numberOfLines={1} style={st.highlightCaption}>{posts[0].caption}</Text>
            <View style={st.highlightStats}>
              <Ionicons name="heart" size={12} color="#FF6A8E" />
              <Text style={st.highlightStatsText}>{posts[0].likeCount}</Text>
              <Ionicons name="chatbubble-outline" size={12} color={colors.text.secondary} />
              <Text style={st.highlightStatsText}>{posts[0].commentCount}</Text>
            </View>
          </View>
        </Pressable>
      ) : null}

      <FlatList
        data={posts.slice(1)}
        keyExtractor={(item) => String(item.id)}
        numColumns={GRID_COLS}
        scrollEnabled={false}
        columnWrapperStyle={{ gap: GRID_GAP }}
        contentContainerStyle={{ gap: GRID_GAP, paddingBottom: spacing.md }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 35).springify()}>
            <Pressable style={st.tile} onPress={() => openPost(item)}>
              <Image source={{ uri: resolveMediaUrl(item.imageUrl) }} style={st.tileImage} />
              <LinearGradient colors={["transparent", "rgba(4,6,26,0.8)"]} style={st.tileOverlay} />
              <View style={st.tileMeta}>
                <Ionicons name="heart" size={11} color="#FF6A8E" />
                <Text style={st.tileMetaText}>{item.likeCount}</Text>
              </View>
            </Pressable>
          </Animated.View>
        )}
      />

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={st.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelected(null)} />
          {selected && (
            <View style={st.modalCard}>
              <Image source={{ uri: resolveMediaUrl(selected.imageUrl) }} style={st.modalImage} resizeMode="cover" />
              <View style={st.modalBody}>
                <View style={st.modalRow}>
                  <Text style={st.modalCaption}>{selected.caption}</Text>
                  <Text style={st.modalTime}>{selected.createdAtLabel}</Text>
                </View>
                <View style={st.modalActions}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setLiked((prev) => !prev);
                    }}
                    style={st.actionBtn}
                  >
                    <Ionicons name={liked ? "heart" : "heart-outline"} size={20} color={liked ? "#FF6A8E" : colors.text.primary} />
                    <Text style={st.actionText}>{selected.likeCount + (liked ? 1 : 0)}</Text>
                  </Pressable>
                  <View style={st.actionBtn}>
                    <Ionicons name="chatbubble-outline" size={19} color={colors.text.primary} />
                    <Text style={st.actionText}>{selected.commentCount}</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <Pressable style={st.actionBtn} onPress={() => setSelected(null)}>
                    <Ionicons name="close" size={20} color={colors.text.secondary} />
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.text.primary,
  },
  headerSubtitle: {
    marginTop: 2,
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  highlightCard: {
    width: "100%",
    height: 198,
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  highlightImage: {
    width: "100%",
    height: "100%",
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  highlightMeta: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
  },
  highlightTitle: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  highlightCaption: {
    marginTop: 4,
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: colors.text.primary,
  },
  highlightStats: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  highlightStatsText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: colors.text.secondary,
    marginRight: 8,
  },
  newPostBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radii.full,
    backgroundColor: colors.eu.star,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  newPostBtnText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: "#0A1628",
  },
  tile: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  tileImage: {
    width: "100%",
    height: "100%",
  },
  tileOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  tileMeta: {
    position: "absolute",
    bottom: 5,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  tileMetaText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 10,
    color: "#FFF",
  },
  emptyWrap: {
    alignItems: "center",
    borderRadius: radii.xl,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  emptyGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  emptyTitle: {
    marginTop: spacing.sm,
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.text.primary,
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: 6,
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 19,
  },
  emptyCta: {
    marginTop: spacing.md,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.35)",
    backgroundColor: "rgba(255,215,0,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyCtaText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.eu.star,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  modalCard: {
    width: "100%",
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: "#0C1528",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  modalImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  modalBody: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "center",
  },
  modalCaption: {
    flex: 1,
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: colors.text.primary,
  },
  modalTime: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingRight: 12,
  },
  actionText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.secondary,
  },
});
