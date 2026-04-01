import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import * as storiesApi from "@/api/stories";
import { handleError } from "@/utils/errorHandler";
import { useAuthStore } from "@/store/useAuthStore";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { StoryData, UserStories } from "@/types/stories";
import type { DiscoverStackParamList } from "@/types";

type Nav = StackNavigationProp<DiscoverStackParamList>;

interface Props {
  onCreateStory: () => void;
  onViewStories: (userId: number, groups: UserStories[]) => void;
}

/** Horizontal stories bar – placed at top of Discover */
export default function StoriesBar({
  onCreateStory,
  onViewStories,
}: Props): React.JSX.Element {
  const currentUser = useAuthStore((s) => s.user);
  const [groups, setGroups] = useState<UserStories[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = useCallback(async () => {
    try {
      const feed: StoryData[] = await storiesApi.getStoryFeed();
      // group by user
      const map = new Map<number, UserStories>();
      for (const s of feed) {
        let g = map.get(s.userId);
        if (!g) {
          g = {
            userId: s.userId,
            userName: s.userFirstName,
            userPhoto: s.userProfilePhotoUrl,
            stories: [],
            hasUnviewed: false,
          };
          map.set(s.userId, g);
        }
        g.stories.push(s);
        if (!s.viewedByCurrentUser) g.hasUnviewed = true;
      }
      setGroups(Array.from(map.values()));
    } catch (e) {
      handleError(e, "StoriesBar.getStoryFeed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  if (loading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator color={colors.eu.star} size="small" />
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
    >
      {/* Own story — create */}
      <Pressable style={styles.storyItem} onPress={onCreateStory}>
        <View style={[styles.avatarRing, styles.avatarRingCreate]}>
          {currentUser?.profilePhotoUrl ? (
            <Image
              source={{ uri: currentUser.profilePhotoUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {currentUser?.firstName?.[0]?.toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
          <View style={styles.plusBadge}>
            <Text style={styles.plusText}>＋</Text>
          </View>
        </View>
        <Text style={styles.nameText} numberOfLines={1}>
          Tu historia
        </Text>
      </Pressable>

      {/* Other users */}
      {groups.map((g) => (
        <Pressable
          key={g.userId}
          style={styles.storyItem}
          onPress={() => onViewStories(g.userId, groups)}
        >
          <View
            style={[
              styles.avatarRing,
              g.hasUnviewed ? styles.avatarRingUnviewed : styles.avatarRingViewed,
            ]}
          >
            {g.userPhoto ? (
              <Image source={{ uri: g.userPhoto }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarInitial}>
                  {g.userName[0]?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.nameText} numberOfLines={1}>
            {g.userName}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const RING_SIZE = 68;
const AVATAR_SIZE = 60;

const styles = StyleSheet.create({
  container: { flexGrow: 0 },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  loadingRow: {
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  storyItem: {
    alignItems: "center",
    width: RING_SIZE + 4,
  },
  avatarRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
  },
  avatarRingUnviewed: {
    borderColor: colors.eu.star,
  },
  avatarRingViewed: {
    borderColor: colors.glass.border,
  },
  avatarRingCreate: {
    borderColor: colors.eu.orange,
    borderStyle: "dashed",
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.glass.white,
  },
  avatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontFamily: typography.families.subheading,
    fontSize: 22,
    color: colors.text.primary,
  },
  plusBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.eu.orange,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background.start,
  },
  plusText: {
    fontSize: 13,
    color: "#FFF",
    fontWeight: "700",
    marginTop: -1,
  },
  nameText: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: "center",
  },
});
