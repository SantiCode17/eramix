import React, { useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import { useAuthStore } from "@/store/useAuthStore";
import type { User } from "@/types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
export const CARD_WIDTH = SCREEN_WIDTH - 16;
export const CARD_HEIGHT = SCREEN_HEIGHT * 0.72; // Occupy most of screen

interface CarouselUserCardProps {
  user: User;
}

type SlideType = "PHOTO" | "INTERESTS" | "FAVORITES" | "PROMPTS";

interface Slide {
  id: string;
  type: SlideType;
  content: any;
}

const nameToGradient = (name: string): [string, string] => {
  const gradients: [string, string][] = [
    ["#1A2D4D", "#0D1F3C"], ["#132240", "#0A1628"], ["#243858", "#132240"]
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return gradients[Math.abs(hash) % gradients.length];
};

function SlideIndicator({ i, scrollX }: { i: number; scrollX: Animated.SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(i - 1) * CARD_WIDTH, i * CARD_WIDTH, (i + 1) * CARD_WIDTH],
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );
    return { opacity };
  });
  return <Animated.View style={[styles.indicator, animatedStyle]} />;
}

export default function CarouselUserCard({ user }: CarouselUserCardProps): React.JSX.Element {
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(() => {
    const built: Slide[] = [];
    // 1. Main Photo
    built.push({ id: "main_photo", type: "PHOTO", content: user.photos?.[0] || { photoUrl: user.profilePhotoUrl } });

    // 2. Interests
    if (user.interests?.length || user.bio) {
      built.push({ id: "interests", type: "INTERESTS", content: null });
    }

    // 3. Favorites
    if (user.favoriteSong || user.favoriteFood || user.specialHobby) {
      built.push({ id: "favorites", type: "FAVORITES", content: null });
    }

    // 4. Prompts
    if (user.customPrompts) {
      try {
        const p = JSON.parse(user.customPrompts);
        if (Array.isArray(p) && p.length) built.push({ id: "prompts", type: "PROMPTS", content: p });
      } catch (e) {}
    }

    // 5. Rest of photos
    if (user.photos && user.photos.length > 1) {
      user.photos.slice(1).forEach((photo, idx) => {
        built.push({ id: `photo_${idx + 1}`, type: "PHOTO", content: photo });
      });
    }

    const slideOrder = useAuthStore.getState().slideOrder;
    if (slideOrder && slideOrder.length > 0) {
      // Sort 'built' array according to the 'slideOrder' array
      built.sort((a, b) => {
        const idxA = slideOrder.indexOf(a.id);
        const idxB = slideOrder.indexOf(b.id);
        // If not found in slideOrder, put them at the end
        if (idxA === -1 && idxB === -1) return 0;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
      });
    }

    return built;
  }, [user]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      // Intentionally not updating state on every frame to avoid re-renders, 
      // but keeping activeIndex for tap navigation
    }
  });

  const handleMomentumEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    if (newIndex !== activeIndex) {
      Haptics.selectionAsync();
      setActiveIndex(newIndex);
    }
  };

  const handleTap = (direction: "prev" | "next") => {
    let nextIndex = direction === "next" ? activeIndex + 1 : activeIndex - 1;
    if (nextIndex >= 0 && nextIndex < slides.length) {
      Haptics.selectionAsync();
      scrollViewRef.current?.scrollTo({ x: nextIndex * CARD_WIDTH, animated: true });
      setActiveIndex(nextIndex);
    }
  };

  const fullName = `${user.firstName} ${user.lastName && user.lastName !== "." ? user.lastName : ""}`.trim();
  const age = useMemo(() => {
    if (!user.dateOfBirth) return null;
    const dob = new Date(user.dateOfBirth);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }, [user.dateOfBirth]);
  const destination = [user.destinationCity, user.destinationCountry].filter(Boolean).join(", ");
  const placeholderColors = nameToGradient(fullName);

  return (
    <View style={styles.cardContainer}>
      {/* INDICATORS */}
      <View style={styles.indicatorsWrap}>
        {slides.map((_, i) => (
          <SlideIndicator key={i} i={i} scrollX={scrollX} />
        ))}
      </View>

      <Animated.ScrollView
        ref={scrollViewRef as any}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumEnd}
        style={StyleSheet.absoluteFillObject}
      >
        {slides.map((slide, idx) => (
          <View key={slide.id} style={{ width: CARD_WIDTH, height: "100%" }}>
            
            {/* TAP ZONES inside each slide so they scroll with it */}
            <View style={styles.tapZones}>
              <Pressable style={styles.tapZone} onPress={() => handleTap("prev")} />
              <Pressable style={styles.tapZone} onPress={() => handleTap("next")} />
            </View>

            {slide.type === "PHOTO" && (
              <View style={styles.slideContent}>
                {slide.content?.photoUrl ? (
                  <Image source={{ uri: resolveMediaUrl(slide.content.photoUrl) }} style={styles.fullImage} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={placeholderColors} style={styles.fullImage} />
                )}
                <LinearGradient colors={["transparent", "rgba(4,6,26,0.95)"]} style={styles.bottomGradient} />
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{fullName}{age !== null ? <Text style={styles.age}>, {age}</Text> : null}</Text>
                    {user.isVerified && <Ionicons name="checkmark-circle" size={20} color={colors.eu.star} />}
                  </View>
                  {destination ? (
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color="#FFF" />
                      <Text style={styles.location}>{destination}</Text>
                    </View>
                  ) : null}
                  {user.homeUniversity && (
                    <View style={[styles.locationRow, { marginTop: 2 }]}>
                      <Ionicons name="school-outline" size={14} color="rgba(255,255,255,0.6)" />
                      <Text style={[styles.location, { color: 'rgba(255,255,255,0.6)' }]}>{user.homeUniversity.name}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {slide.type === "INTERESTS" && (
              <LinearGradient colors={["#0D1F3C", "#0A1628"]} style={styles.slideContentGlass}>
                <Text style={styles.slideTitle}>Sobre mí</Text>
                <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                  {user.bio && <Text style={styles.bioText}>{user.bio}</Text>}
                  {user.interests && user.interests.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {user.interests.map((i: any) => (
                        <View key={i.id} style={styles.tag}>
                          <Text style={styles.tagText}>{i.emoji || "✦"} {i.name}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Animated.ScrollView>
              </LinearGradient>
            )}

            {slide.type === "FAVORITES" && (
              <LinearGradient colors={["#1E1610", "#0A0502"]} style={styles.slideContentGlass}>
                <Text style={[styles.slideTitle, { color: colors.eu.orange }]}>Favoritos</Text>
                <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                  <View style={styles.favoritesWrap}>
                    {user.favoriteSong && (
                      <View style={styles.favoriteItem}>
                        <Ionicons name="musical-notes" size={24} color={colors.eu.orange} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.favoriteLabel}>Canción</Text>
                          <Text style={styles.favoriteValue}>{user.favoriteSong}</Text>
                        </View>
                      </View>
                    )}
                    {user.favoriteFood && (
                      <View style={styles.favoriteItem}>
                        <Ionicons name="restaurant" size={24} color={colors.eu.orange} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.favoriteLabel}>Comida</Text>
                          <Text style={styles.favoriteValue}>{user.favoriteFood}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </Animated.ScrollView>
              </LinearGradient>
            )}

            {slide.type === "PROMPTS" && (
              <LinearGradient colors={["#1A180B", "#0A0A05"]} style={styles.slideContentGlass}>
                <Text style={[styles.slideTitle, { color: colors.eu.star }]}>Estilo de Vida</Text>
                <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingBottom: 60 }}>
                  {slide.content.map((p: any, i: number) => (
                    <View key={i} style={styles.promptCard}>
                      <Text style={styles.promptQ}>{p.question}</Text>
                      <Text style={styles.promptA}>{p.answer}</Text>
                    </View>
                  ))}
                </Animated.ScrollView>
              </LinearGradient>
            )}

          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    backgroundColor: DS.background,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  indicatorsWrap: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    gap: 4,
    zIndex: 100,
  },
  indicator: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 50,
  },
  tapZone: {
    flex: 1,
    height: "100%",
  },
  slideContent: {
    flex: 1,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  bottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  userInfo: {
    position: "absolute",
    bottom: 110,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  name: {
    fontFamily: typography.families.heading,
    fontSize: 32,
    color: "#FFF",
  },
  age: {
    fontFamily: typography.families.body,
    fontSize: 26,
    color: "#FFF",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  location: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
  },
  slideContentGlass: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: 60,
  },
  slideTitle: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    color: "#FFF",
    marginBottom: spacing.lg,
  },
  bioText: {
    fontFamily: typography.families.body,
    fontSize: 18,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 26,
    marginBottom: spacing.xl,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  tagText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: "#FFF",
  },
  favoritesWrap: { gap: spacing.md },
  favoriteItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  favoriteLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
  },
  favoriteValue: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    color: "#FFF",
  },
  promptCard: {
    backgroundColor: "rgba(255,215,0,0.1)",
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  promptQ: {
    fontFamily: typography.families.subheading,
    fontSize: 13,
    color: colors.eu.star,
    marginBottom: 6,
  },
  promptA: {
    fontFamily: typography.families.heading,
    fontSize: 22,
    color: "#FFF",
  },
});
