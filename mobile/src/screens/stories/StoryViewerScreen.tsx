import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  StatusBar,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  FadeOut,
  ZoomIn,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import * as storiesApi from "@/api/stories";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import type { StoryData, UserStories } from "@/types/stories";

const { width: W, height: H } = Dimensions.get("window");
const STORY_DURATION = 5000;

const REACTIONS = ["❤️", "🔥", "😂", "👏", "🎉"] as const;
type ReactionEmoji = (typeof REACTIONS)[number];

interface Props {
  groups: UserStories[];
  initialUserId: number;
  onClose: () => void;
}

export default function StoryViewerScreen({
  groups,
  initialUserId,
  onClose,
}: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const initialGroupIdx = groups.findIndex((g) => g.userId === initialUserId);

  const [groupIdx, setGroupIdx] = useState(
    initialGroupIdx >= 0 ? initialGroupIdx : 0,
  );
  const [storyIdx, setStoryIdx] = useState(0);
  const [sentReaction, setSentReaction] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const currentGroup = groups[groupIdx];
  const currentStory = currentGroup?.stories?.[storyIdx];
  const storyCount = currentGroup?.stories?.length ?? 0;

  // Progress bar
  const progress = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTimer = useCallback(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: STORY_DURATION });
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      goNext();
    }, STORY_DURATION);
  }, [groupIdx, storyIdx]);

  const goNext = useCallback(() => {
    if (storyIdx < storyCount - 1) {
      setStoryIdx((i) => i + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx((i) => i + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  }, [storyIdx, storyCount, groupIdx, groups.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIdx > 0) {
      setStoryIdx((i) => i - 1);
    } else if (groupIdx > 0) {
      setGroupIdx((i) => i - 1);
      const prevLen = groups[groupIdx - 1]?.stories.length ?? 1;
      setStoryIdx(prevLen - 1);
    }
  }, [storyIdx, groupIdx, groups]);

  const handleReaction = useCallback(
    (emoji: string) => {
      if (!currentStory) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSentReaction(emoji);
      storiesApi.reactToStory(currentStory.id, emoji).catch(() => {});

      // Auto-dismiss after 1.5s
      setTimeout(() => setSentReaction(null), 1500);
    },
    [currentStory],
  );

  // Reset timer on story change
  useEffect(() => {
    startTimer();
    // Mark viewed
    if (currentStory && !currentStory.viewedByCurrentUser) {
      storiesApi.viewStory(currentStory.id).catch(() => {});
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [groupIdx, storyIdx]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (!currentStory) {
    onClose();
    return <View />;
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Background image */}
      <Image
        source={{ uri: resolveMediaUrl(currentStory.mediaUrl) }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Dimmed overlay */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />

      {/* Progress bars at top */}
      <View style={[styles.progressRow, { top: insets.top + 8 }]}>
        {currentGroup.stories.map((_, i) => (
          <View key={i} style={styles.progressBg}>
            {i < storyIdx ? (
              <View style={[styles.progressFill, { width: "100%" }]} />
            ) : i === storyIdx ? (
              <Animated.View style={[styles.progressFill, progressBarStyle]} />
            ) : null}
          </View>
        ))}
      </View>

      {/* User info header */}
      <View style={[styles.header, { top: insets.top + 28 }]}>
        {currentGroup.userPhoto ? (
          <Image
            source={{ uri: resolveMediaUrl(currentGroup.userPhoto) }}
            style={styles.headerAvatar}
          />
        ) : (
          <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
            <Text style={styles.headerInitial}>
              {currentGroup.userName[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.headerName}>{currentGroup.userName}</Text>
        <Pressable
          onPress={onClose}
          hitSlop={16}
          style={styles.closeBtn}
        >
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      {/* Caption */}
      {currentStory.caption ? (
        <View style={[styles.captionContainer, { bottom: insets.bottom + 100 }]}>
          <Text style={styles.captionText}>{currentStory.caption}</Text>
        </View>
      ) : null}

      {/* Reaction bar */}
      <View style={[styles.reactionBar, { bottom: insets.bottom + 24 }]}>
        {REACTIONS.map((emoji) => (
          <Pressable
            key={emoji}
            onPress={() => handleReaction(emoji)}
            style={({ pressed }) => [
              styles.reactionBtn,
              pressed && styles.reactionBtnPressed,
            ]}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
          </Pressable>
        ))}
      </View>

      {/* Floating reaction feedback */}
      {sentReaction && (
        <Animated.View
          entering={ZoomIn.springify().damping(12)}
          exiting={FadeOut.duration(300)}
          style={styles.reactionFeedback}
        >
          <Text style={styles.reactionFeedbackEmoji}>{sentReaction}</Text>
          <Text style={styles.reactionFeedbackText}>Reacción enviada</Text>
        </Animated.View>
      )}

      {/* Touch zones: left = prev, right = next */}
      <View style={styles.touchZones}>
        <Pressable style={styles.touchLeft} onPress={goPrev} />
        <Pressable style={styles.touchRight} onPress={goNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlay: { backgroundColor: "rgba(0,0,0,0.15)" },

  // Progress
  progressRow: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    gap: 4,
    zIndex: 10,
  },
  progressBg: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: 1.5,
  },

  // Header
  header: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  headerAvatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerInitial: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: "#FFF",
  },
  headerName: {
    flex: 1,
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: "#FFF",
    marginLeft: spacing.sm,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },

  // Caption
  captionContainer: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
  },
  captionText: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Touch zones
  touchZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 5,
  },
  touchLeft: { flex: 1 },
  touchRight: { flex: 2 },

  // Reactions
  reactionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    zIndex: 12,
  },
  reactionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  reactionBtnPressed: {
    transform: [{ scale: 1.25 }],
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  reactionEmoji: {
    fontSize: 22,
  },
  reactionFeedback: {
    position: "absolute",
    alignSelf: "center",
    top: "40%",
    alignItems: "center",
    zIndex: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
  },
  reactionFeedbackEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  reactionFeedbackText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
});
