import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useDiscoverStore } from "@/store/useDiscoverStore";
import { UserCard, CARD_WIDTH, FilterModal } from "./components";
import { EmptyState, Header, GlassButton } from "@/design-system";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { DiscoverStackParamList, DiscoverFilters } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

type NavProp = StackNavigationProp<DiscoverStackParamList, "DiscoverMain">;

export default function DiscoverScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();
  const {
    users,
    currentIndex,
    loading,
    error,
    filters,
    fetchUsers,
    dismissUser,
    sendFriendRequest,
    setFilters,
    resetFilters,
  } = useDiscoverStore();

  const [filterVisible, setFilterVisible] = useState(false);

  // Swipe animation values
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    fetchUsers();
  }, []);

  const currentUser = users[currentIndex];
  const nextUser = users[currentIndex + 1];
  const thirdUser = users[currentIndex + 2];

  const handleSwipeComplete = useCallback(
    (direction: "left" | "right") => {
      if (!currentUser) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (direction === "right") {
        sendFriendRequest(currentUser.id);
      } else {
        dismissUser(currentUser.id);
      }

      // Reset animation
      translateX.value = 0;
      translateY.value = 0;
    },
    [currentUser, sendFriendRequest, dismissUser],
  );

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.3; // Dampen vertical
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? "right" : "left";
        const targetX = direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;

        translateX.value = withTiming(targetX, { duration: 250 }, () => {
          runOnJS(handleSwipeComplete)(direction);
        });
        translateY.value = withTiming(0, { duration: 250 });
      } else {
        // Snap back
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  // Top card animated style
  const topCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
          [-15, 0, 15],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  // Second card: scales up as top card is swiped
  const secondCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.95, 1],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ scale }],
      opacity: interpolate(
        Math.abs(translateX.value),
        [0, SWIPE_THRESHOLD],
        [0.7, 1],
        Extrapolation.CLAMP,
      ),
    };
  });

  // Third card
  const thirdCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [0.9, 0.95],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ scale }],
      opacity: interpolate(
        Math.abs(translateX.value),
        [0, SWIPE_THRESHOLD],
        [0.4, 0.7],
        Extrapolation.CLAMP,
      ),
    };
  });

  // Swipe indicator overlays
  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const nopeOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const handleApplyFilters = useCallback(
    (newFilters: DiscoverFilters) => {
      setFilters(newFilters);
      fetchUsers();
    },
    [setFilters, fetchUsers],
  );

  const handleManualDismiss = useCallback(() => {
    if (!currentUser) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dismissUser(currentUser.id);
  }, [currentUser, dismissUser]);

  const handleManualConnect = useCallback(() => {
    if (!currentUser) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    sendFriendRequest(currentUser.id);
  }, [currentUser, sendFriendRequest]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <Header
        title="Descubrir"
        right={
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate("FriendRequests")}
              style={styles.headerBtn}
            >
              <Text style={styles.headerBtnText}>📩</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("NearbyMap")}
              style={styles.headerBtn}
            >
              <Text style={styles.headerBtnText}>🗺️</Text>
            </Pressable>
            <Pressable
              onPress={() => setFilterVisible(true)}
              style={styles.headerBtn}
            >
              <Text style={styles.headerBtnText}>⚡</Text>
            </Pressable>
          </View>
        }
      />

      {/* Card Stack */}
      <View style={styles.cardStack}>
        {loading && !currentUser ? (
          <ActivityIndicator size="large" color={colors.eu.star} />
        ) : error ? (
          <EmptyState
            icon="⚠️"
            title="Error"
            message={error}
            action={
              <GlassButton title="Reintentar" variant="secondary" size="sm" onPress={fetchUsers} />
            }
          />
        ) : !currentUser ? (
          <EmptyState
            icon="🔍"
            title="Sin más perfiles"
            message="Has visto todos los perfiles disponibles. Ajusta los filtros o vuelve más tarde."
            action={
              <GlassButton title="Cambiar filtros" variant="secondary" size="sm" onPress={() => setFilterVisible(true)} />
            }
          />
        ) : (
          <>
            {/* Third card (bottom) */}
            {thirdUser ? (
              <Animated.View
                style={[styles.cardWrapper, styles.backCard2, thirdCardStyle]}
                pointerEvents="none"
              >
                <UserCard user={thirdUser} />
              </Animated.View>
            ) : null}

            {/* Second card */}
            {nextUser ? (
              <Animated.View
                style={[styles.cardWrapper, styles.backCard1, secondCardStyle]}
                pointerEvents="none"
              >
                <UserCard user={nextUser} />
              </Animated.View>
            ) : null}

            {/* Top card (swipeable) */}
            <GestureDetector gesture={panGesture}>
              <Animated.View style={[styles.cardWrapper, topCardStyle]}>
                {/* LIKE overlay */}
                <Animated.View style={[styles.swipeOverlay, styles.likeOverlay, likeOverlayStyle]}>
                  <Text style={styles.overlayText}>CONECTAR ⭐</Text>
                </Animated.View>

                {/* NOPE overlay */}
                <Animated.View style={[styles.swipeOverlay, styles.nopeOverlay, nopeOverlayStyle]}>
                  <Text style={styles.overlayText}>PASAR ✕</Text>
                </Animated.View>

                <UserCard
                  user={currentUser}
                  onDismiss={handleManualDismiss}
                  onSendRequest={handleManualConnect}
                  onViewProfile={() =>
                    navigation.navigate("UserDetail", { userId: currentUser.id })
                  }
                />
              </Animated.View>
            </GestureDetector>
          </>
        )}
      </View>

      {/* Bottom hint */}
      {currentUser ? (
        <View style={styles.bottomHint}>
          <Text style={styles.hintText}>
            ← Pasar    Desliza    Conectar →
          </Text>
        </View>
      ) : null}

      {/* Filter Modal */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        filters={filters}
        onApply={handleApplyFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnText: {
    fontSize: 18,
  },
  // Card stack
  cardStack: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  cardWrapper: {
    position: "absolute",
  },
  backCard1: {
    top: spacing.sm,
  },
  backCard2: {
    top: spacing.md,
  },
  // Swipe overlays
  swipeOverlay: {
    position: "absolute",
    top: spacing.xl,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 3,
  },
  likeOverlay: {
    right: spacing.lg,
    borderColor: colors.status.success,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  nopeOverlay: {
    left: spacing.lg,
    borderColor: colors.status.error,
    backgroundColor: "rgba(244, 67, 54, 0.2)",
  },
  overlayText: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
  },
  // Bottom hint
  bottomHint: {
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  hintText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.secondary,
  },
});
