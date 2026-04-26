import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  smartMatchApi,
  type SmartMatchUser,
} from "@/api/socialFeatures";
import {
  GlassCard,
  Chip,
  EmptyState,
  ScreenBackground,
  Header,
  LoadingSpinner,
} from "@/design-system";
import {
  colors,
  typography,
  spacing,
  radii,
} from "@/design-system/tokens";

const { width: SCREEN_W } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_W * 0.3;
const CARD_W = SCREEN_W - spacing.md * 2;

/* ── Screen ──────────────────────────────────────── */

export default function SmartMatchScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  /* ── data ── */
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ["smartMatch"],
    queryFn: () => smartMatchApi.getSuggestions(),
  });

  const likeMut = useMutation({
    mutationFn: (id: number) => smartMatchApi.likeSuggestion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["smartMatch"] }),
  });

  const skipMut = useMutation({
    mutationFn: (id: number) => smartMatchApi.skipSuggestion(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["smartMatch"] }),
  });

  const currentIndex = useSharedValue(0);
  const current = useMemo(
    () => suggestions[0] ?? null,
    [suggestions],
  );
  const next = useMemo(
    () => suggestions[1] ?? null,
    [suggestions],
  );

  /* ── gesture ── */
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const handleSwipeRight = useCallback(() => {
    if (!current) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    likeMut.mutate(current.id);
  }, [current, likeMut]);

  const handleSwipeLeft = useCallback(() => {
    if (!current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    skipMut.mutate(current.id);
  }, [current, skipMut]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.4;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_W * 1.5, { duration: 300 });
        runOnJS(handleSwipeRight)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_W * 1.5, { duration: 300 });
        runOnJS(handleSwipeLeft)();
      } else {
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const cardAnim = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_W, 0, SCREEN_W],
          [-15, 0, 15],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const nextScale = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          Math.abs(translateX.value),
          [0, SWIPE_THRESHOLD],
          [0.92, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.5, 1],
      Extrapolation.CLAMP,
    ),
  }));

  /* ── actions ── */
  const onSkip = useCallback(() => {
    translateX.value = withTiming(-SCREEN_W * 1.5, { duration: 350 });
    handleSwipeLeft();
  }, [handleSwipeLeft, translateX]);

  const onLike = useCallback(() => {
    translateX.value = withTiming(SCREEN_W * 1.5, { duration: 350 });
    handleSwipeRight();
  }, [handleSwipeRight, translateX]);

  const onSuper = useCallback(() => {
    if (!current) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    translateY.value = withTiming(-SCREEN_W, { duration: 350 });
    likeMut.mutate(current.id);
  }, [current, likeMut, translateY]);

  /* ── render card ── */
  const renderCard = (user: SmartMatchUser, isNext?: boolean) => (
    <View style={st.cardContainer}>
      {/* photo */}
      {user.profilePhotoUrl ? (
        <Image
          source={{ uri: user.profilePhotoUrl }}
          style={st.cardImage}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={["#1A3DE8", "#3B6BFF"]}
          style={st.cardImage}
        >
          <Text style={st.cardInitial}>
            {user.firstName[0]}
          </Text>
        </LinearGradient>
      )}

      {/* gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={st.cardOverlay}
      >
        {/* compatibility */}
        <View style={st.compatBadge}>
          <Ionicons name="sparkles" size={14} color={colors.eu.star} />
          <Text style={st.compatText}>{user.compatibilityScore}% match</Text>
        </View>

        {/* name + location */}
        <Text style={st.userName}>{user.firstName}</Text>
        <View style={st.locRow}>
          <Ionicons name="location" size={13} color={colors.text.secondary} />
          <Text style={st.locText}>
            {user.destinationCity}, {user.destinationCountry}
          </Text>
        </View>

        {/* bio */}
        {user.bio ? (
          <Text style={st.bio} numberOfLines={2}>{user.bio}</Text>
        ) : null}

        {/* tags */}
        {user.sharedInterests.length > 0 && (
          <View style={st.tagsRow}>
            {user.sharedInterests.slice(0, 4).map((t) => (
              <View key={t} style={st.tag}>
                <Ionicons name="heart" size={10} color={colors.eu.star} />
                <Text style={st.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        {user.sharedLanguages.length > 0 && (
          <View style={st.tagsRow}>
            {user.sharedLanguages.slice(0, 3).map((l) => (
              <View key={l} style={[st.tag, st.langTag]}>
                <Ionicons name="chatbubble-ellipses" size={10} color="#4DD0E1" />
                <Text style={[st.tagText, { color: "#4DD0E1" }]}>{l}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>

      {/* LIKE / NOPE stamps */}
      {!isNext && (
        <>
          <Animated.View style={[st.stamp, st.stampLike, likeOpacity]}>
            <Text style={st.stampTextLike}>LIKE</Text>
          </Animated.View>
          <Animated.View style={[st.stamp, st.stampNope, nopeOpacity]}>
            <Text style={st.stampTextNope}>NOPE</Text>
          </Animated.View>
        </>
      )}
    </View>
  );

  return (
    <ScreenBackground>
      <Header title="Smart Match" onBack={() => navigation.goBack()} />

      {isLoading ? (
        <View style={st.centered}>
          <LoadingSpinner size={48} />
        </View>
      ) : !current ? (
        <View style={st.centered}>
          <EmptyState
            icon="people-outline"
            title="Sin sugerencias"
            message="Vuelve más tarde para ver nuevas personas afines"
          />
        </View>
      ) : (
        <Animated.View entering={FadeIn.duration(400)} style={st.stack}>
          {/* next card behind */}
          {next && (
            <Animated.View style={[st.cardWrapper, nextScale]}>
              {renderCard(next, true)}
            </Animated.View>
          )}

          {/* current card */}
          <GestureDetector gesture={pan}>
            <Animated.View style={[st.cardWrapper, cardAnim]}>
              {renderCard(current)}
            </Animated.View>
          </GestureDetector>

          {/* action buttons */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={st.actions}>
            <Pressable onPress={onSkip} style={[st.actionBtn, st.skipBtn]}>
              <Ionicons name="close" size={28} color="#FF6B6B" />
            </Pressable>
            <Pressable onPress={onSuper} style={[st.actionBtn, st.superBtn]}>
              <Ionicons name="star" size={22} color={colors.eu.star} />
            </Pressable>
            <Pressable onPress={onLike} style={[st.actionBtn, st.likeBtn]}>
              <Ionicons name="heart" size={28} color="#4FD1C5" />
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </ScreenBackground>
  );
}

/* ── styles ──────────────────────────────────────── */

const st = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  /* stack */
  stack: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    position: "absolute",
    top: spacing.md,
    alignSelf: "center",
  },

  /* card */
  cardContainer: {
    width: CARD_W,
    height: CARD_W * 1.35,
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: colors.background.card,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInitial: {
    fontFamily: typography.families.heading,
    fontSize: 60,
    color: "rgba(255,255,255,0.5)",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: spacing.lg,
  },

  /* stamps */
  stamp: {
    position: "absolute",
    top: 50,
    borderRadius: radii.md,
    borderWidth: 3,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  stampLike: {
    left: 24,
    borderColor: "#4FD1C5",
    transform: [{ rotate: "-15deg" }],
  },
  stampNope: {
    right: 24,
    borderColor: "#FF6B6B",
    transform: [{ rotate: "15deg" }],
  },
  stampTextLike: {
    fontFamily: typography.families.heading,
    fontSize: 32,
    color: "#4FD1C5",
    fontWeight: "800",
  },
  stampTextNope: {
    fontFamily: typography.families.heading,
    fontSize: 32,
    color: "#FF6B6B",
    fontWeight: "800",
  },

  /* compat */
  compatBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    backgroundColor: "rgba(255,215,0,0.15)",
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing.xs,
  },
  compatText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.eu.star,
    fontWeight: "700",
  },

  /* info */
  userName: {
    fontFamily: typography.families.heading,
    fontSize: 26,
    color: "#fff",
    fontWeight: "800",
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  locText: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
  bio: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: spacing.xs,
    lineHeight: 18,
  },

  /* tags */
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.xs,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,215,0,0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  langTag: {
    backgroundColor: "rgba(77,208,225,0.12)",
  },
  tagText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: colors.eu.star,
    fontWeight: "600",
  },

  /* actions */
  actions: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    width: "100%",
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  skipBtn: {
    backgroundColor: "rgba(255,107,107,0.08)",
    borderColor: "rgba(255,107,107,0.3)",
  },
  superBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,215,0,0.08)",
    borderColor: "rgba(255,215,0,0.3)",
  },
  likeBtn: {
    backgroundColor: "rgba(79,209,197,0.08)",
    borderColor: "rgba(79,209,197,0.3)",
  },
});
