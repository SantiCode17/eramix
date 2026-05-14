/**
 * ════════════════════════════════════════════════════════
 *  DiscoverScreen — Swipeable Card Stack v2
 *  European Glass · Reanimated 4 · Filter + Actions
 *  IMPROVED: Better swipe sensitivity, larger gesture area,
 *  bigger action buttons, smoother animations
 * ════════════════════════════════════════════════════════
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import { useDiscoverStore } from "@/store/useDiscoverStore";
import { useAuthStore } from "@/store";
import { CarouselUserCard, FilterModal, MatchCelebrationModal } from "./components";
import type { User } from "@/types";
import { EmptyState, ScreenBackground } from "@/design-system";
import {
  colors,
  typography,
  spacing,
  radii,
  DS,
} from "@/design-system/tokens";
import type { DiscoverStackParamList, DiscoverFilters } from "@/types";
import { fetchConversations } from "@/api/chat";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
// MUCH lower thresholds for easier swiping
const SWIPE_THRESHOLD = 60;
const SWIPE_VELOCITY = 300;
const TAB_BAR_HEIGHT = 64;

type NavProp = StackNavigationProp<DiscoverStackParamList, "DiscoverMain">;

/* ─── Component ───────────────────────────────────── */
export default function DiscoverScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();

  /* ── Store ── */
  const {
    users,
    currentIndex,
    loading,
    error,
    filters,
    sentRequests,
    requestedIds,
    receivedRequests,
    fetchUsers,
    fetchSentRequests,
    fetchReceivedRequests,
    dismissUser,
    sendFriendRequest,
    setFilters,
  } = useDiscoverStore();

  /* ── Auth (for my own photo in the match modal) ── */
  const myUser = useAuthStore((s) => s.user);

  /* ── Local state ── */
  const [filterVisible, setFilterVisible] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);

  /* ── Derived ── */
  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];
  const thirdUser = users[currentIndex + 2];
  const hasCards = currentIndex < users.length;

  /* ── Card dimensions ── */
  const HEADER_H = insets.top + 56;
  const TAB_H = TAB_BAR_HEIGHT + insets.bottom;
  const availH = SCREEN_H - HEADER_H - TAB_H;
  const CARD_H = availH - 24;
  const CARD_W = SCREEN_W - 16;

  /* ── Gesture values ── */
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  /* ── Fetch on mount ── */
  useEffect(() => {
    fetchUsers();
    fetchSentRequests();
    fetchReceivedRequests();
  }, []);

  /* ── Callbacks ── */
  const handleSwipeComplete = useCallback(
    (direction: "left" | "right") => {
      if (!currentUser) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (direction === "right") {
        const alreadySent =
          sentRequests?.some(
            (r) => r.receiverId === currentUser.id && r.status === "PENDING",
          ) || requestedIds.has(currentUser.id);

        if (!alreadySent) {
          /* Check if this person already liked us → mutual match */
          const isMatch = receivedRequests.some(
            (r) => r.senderId === currentUser.id && r.status === "PENDING",
          );
          sendFriendRequest(currentUser.id);
          if (isMatch) {
            setMatchedUser(currentUser);
          }
        } else {
          dismissUser(currentUser.id);
        }
      } else {
        dismissUser(currentUser.id);
      }

      translateX.value = 0;
      translateY.value = 0;
    },
    [currentUser, sendFriendRequest, dismissUser, sentRequests, requestedIds, receivedRequests],
  );

  const handleGoToChat = useCallback(async () => {
    if (!matchedUser) {
      setMatchedUser(null);
      return;
    }
    try {
      const conversations = await fetchConversations();
      const convo = conversations.find((c) => c.otherUserId === matchedUser.id);
      setMatchedUser(null);
      if (convo) {
        /* Navigate to the Chat tab and directly open the conversation */
        (navigation.getParent() as any)?.navigate("Chat", {
          screen: "ChatRoom",
          params: {
            conversationId: convo.id,
            otherUserId: convo.otherUserId,
            otherUserName: `${matchedUser.firstName} ${matchedUser.lastName}`,
            otherUserPhoto: matchedUser.profilePhotoUrl ?? null,
          },
        });
      } else {
        /* Fallback: just open the Chat tab */
        navigation.getParent()?.navigate("Chat" as never);
      }
    } catch {
      setMatchedUser(null);
      navigation.getParent()?.navigate("Chat" as never);
    }
  }, [matchedUser, navigation]);

  const handleDismissMatch = useCallback(() => {
    setMatchedUser(null);
  }, []);

  const swipeOff = useCallback(
    (direction: "left" | "right") => {
      "worklet";
      const dest = direction === "right" ? SCREEN_W * 1.5 : -SCREEN_W * 1.5;
      translateX.value = withTiming(dest, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });

      runOnJS(handleSwipeComplete)(direction);

      // Reset after animation
      setTimeout(() => {
        translateX.value = 0;
        translateY.value = 0;
      }, 300);
    },
    [handleSwipeComplete]
  );

  /* ── Pan gesture — IMPROVED sensitivity ── */
  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15]) // Lower threshold to start recognizing
    .failOffsetY([-30, 30]) // Fail if vertical movement is dominant
    .onUpdate((e) => {
      // More responsive 1:1 mapping for X
      translateX.value = e.translationX * 1.1;
      // Subtle Y movement for natural feel
      translateY.value = e.translationY * 0.3;
    })
    .onEnd((e) => {
      if (
        Math.abs(e.translationX) > SWIPE_THRESHOLD ||
        Math.abs(e.velocityX) > SWIPE_VELOCITY
      ) {
        swipeOff(e.translationX > 0 ? "right" : "left");
      } else {
        // Snap back with bouncy spring
        translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
    });

  /* ── Animated styles ── */
  const topCardAnim = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_W, 0, SCREEN_W],
          [-15, 0, 15],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
  }));

  const likeOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const nopeOverlay = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const secondCardAnim = useAnimatedStyle(() => {
    const abs = Math.abs(translateX.value);
    return {
      transform: [
        { scale: interpolate(abs, [0, SWIPE_THRESHOLD], [0.95, 1], Extrapolation.CLAMP) },
      ],
      opacity: interpolate(abs, [0, SWIPE_THRESHOLD * 0.5], [0.5, 1], Extrapolation.CLAMP),
    };
  });

  const thirdCardAnim = useAnimatedStyle(() => {
    const abs = Math.abs(translateX.value);
    return {
      transform: [
        { scale: interpolate(abs, [0, SWIPE_THRESHOLD], [0.9, 0.95], Extrapolation.CLAMP) },
      ],
      opacity: interpolate(abs, [0, SWIPE_THRESHOLD], [0, 0.5], Extrapolation.CLAMP),
    };
  });

  /* ── Border glow on swipe ── */
  const cardBorderColor = useAnimatedStyle(() => {
    const likeIntensity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD * 1.5],
      [0, 1],
      Extrapolation.CLAMP
    );
    const nopeIntensity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD * 1.5, 0],
      [1, 0],
      Extrapolation.CLAMP
    );

    if (likeIntensity > 0) {
      return {
        borderColor: `rgba(255,215,0,${likeIntensity * 0.6})`,
        borderWidth: 2,
      };
    }
    if (nopeIntensity > 0) {
      return {
        borderColor: `rgba(255,79,111,${nopeIntensity * 0.6})`,
        borderWidth: 2,
      };
    }
    return { borderColor: "rgba(255,255,255,0.08)", borderWidth: 1 };
  });

  /* ── Filter apply ── */
  const handleApplyFilters = useCallback(
    (newFilters: DiscoverFilters) => {
      setFilters(newFilters);
      setFilterVisible(false);
      fetchUsers();
    },
    [setFilters, fetchUsers]
  );

  /* ── Render ── */
  return (
    <ScreenBackground>
      {/* ═══ Header ═══ */}
      <Animated.View
        entering={FadeIn.delay(50)}
        style={[st.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={st.headerRow}>
          <View style={st.headerLeft}>
            <Pressable
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={st.glassBtn}
            >
              <Ionicons name="menu-outline" size={22} color="#FFFFFF" />
            </Pressable>
            <Text style={st.headerTitle}>Descubrir</Text>
          </View>
          <View style={st.headerActions}>
            <Pressable
              onPress={() => navigation.navigate("Notifications")}
              style={st.glassBtn}
            >
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("LiveLocation")}
              style={st.glassBtn}
            >
              <Ionicons name="location-outline" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={() => setFilterVisible(true)}
              style={st.glassBtn}
            >
              <Ionicons name="options-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* ═══ Card Stack ═══ */}
      <View style={st.cardStack}>
        {loading && !currentUser ? (
          <View style={st.loadingWrap}>
            <ActivityIndicator size="large" color={DS.primary} />
            <Text style={st.loadingText}>Buscando perfiles...</Text>
          </View>
        ) : error ? (
          <EmptyState
            icon="alert-circle-outline"
            title="Error"
            message={error}
            ctaLabel="Reintentar"
            onCtaPress={fetchUsers}
          />
        ) : !currentUser ? (
          <View style={st.emptyContainer}>
            <EmptyState
              icon="search-outline"
              title="Sin más perfiles"
              message="Has visto todos los perfiles. Ajusta filtros o vuelve más tarde."
              ctaLabel="Cambiar filtros"
              onCtaPress={() => setFilterVisible(true)}
            />
          </View>
        ) : (
          <>
            {/* Third card */}
            {thirdUser && (
              <Animated.View
                style={[
                  st.cardWrap,
                  { width: CARD_W, height: CARD_H, top: 24 },
                  thirdCardAnim,
                ]}
                pointerEvents="none"
              >
                <CarouselUserCard user={thirdUser} />
              </Animated.View>
            )}
            {/* Second card */}
            {nextUser && (
              <Animated.View
                style={[
                  st.cardWrap,
                  { width: CARD_W, height: CARD_H, top: 18 },
                  secondCardAnim,
                ]}
                pointerEvents="none"
              >
                <CarouselUserCard user={nextUser} />
              </Animated.View>
            )}
            {/* Top card — swipeable */}
            <GestureDetector gesture={panGesture}>
              <Animated.View
                style={[
                  st.cardWrap,
                  { width: CARD_W, height: CARD_H, top: 12 },
                  topCardAnim,
                  cardBorderColor,
                ]}
              >
                {/* LIKE overlay */}
                <Animated.View style={[st.swipeOverlay, st.likePos, likeOverlay]}>
                  <LinearGradient
                    colors={["rgba(255,215,0,0.25)", "rgba(255,215,0,0.05)"]}
                    style={[st.overlayGrad, { borderColor: "rgba(255,215,0,0.8)", backgroundColor: "rgba(4,6,26,0.6)" }]}
                  >
                    <Text style={[st.overlayText, { color: "#FFD700" }]}>
                      LIKE ✦
                    </Text>
                  </LinearGradient>
                </Animated.View>

                {/* NOPE overlay */}
                <Animated.View style={[st.swipeOverlay, st.nopePos, nopeOverlay]}>
                  <LinearGradient
                    colors={["rgba(255,79,111,0.25)", "rgba(255,79,111,0.05)"]}
                    style={[st.overlayGrad, { borderColor: "rgba(255,79,111,0.8)", backgroundColor: "rgba(4,6,26,0.6)" }]}
                  >
                    <Text style={[st.overlayText, { color: "#FF4F6F" }]}>
                      NOPE ✕
                    </Text>
                  </LinearGradient>
                </Animated.View>

                <CarouselUserCard user={currentUser} />
              </Animated.View>
            </GestureDetector>
          </>
        )}
      </View>



      {/* ═══ Filter Modal ═══ */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />

      {/* ═══ Match Celebration Modal ═══ */}
      {matchedUser && (
        <MatchCelebrationModal
          visible
          matchedUser={matchedUser}
          myPhotoUrl={myUser?.profilePhotoUrl ?? null}
          onGoToChat={handleGoToChat}
          onContinue={handleDismissMatch}
        />
      )}
    </ScreenBackground>
  );
}

/* ═══ Styles — European Glass ═══ */
const st = StyleSheet.create({
  /* Header */
  header: { paddingHorizontal: 16, paddingBottom: 4 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  glassBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
  },

  /* Card Stack */
  cardStack: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardWrap: {
    position: "absolute",
    borderRadius: 24,
    overflow: "hidden",
  },

  /* Loading */
  loadingWrap: { alignItems: "center", gap: 16 },
  loadingText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingTop: 0,
    marginTop: -80,
  },

  /* Swipe Overlays */
  swipeOverlay: {
    position: "absolute",
    top: 40,
    zIndex: 100,
    borderRadius: 20,
    overflow: "hidden",
  },
  likePos: { left: 32, transform: [{ rotate: "-15deg" }] },
  nopePos: { right: 32, transform: [{ rotate: "15deg" }] },
  overlayGrad: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 4,
  },
  overlayText: {
    fontFamily: typography.families.heading,
    fontSize: 42,
    letterSpacing: 2,
  },


});
