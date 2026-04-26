/**
 * ════════════════════════════════════════════════════════════════
 *  ProfilePreviewScreen — Live Card Preview
 *  Shows the user how their card looks to others in the Discover feed.
 *  Fully functional carousel · Swipe indicators · Slide dots ·
 *  Uses same CarouselUserCard component from Discover
 * ════════════════════════════════════════════════════════════════
 */
import React, { useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { useAuthStore } from "@/store/useAuthStore";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import {
  colors,
  typography,
  spacing,
  radii,
  DS,
} from "@/design-system/tokens";
import type { User } from "@/types";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
// Exact sizing to match DiscoverScreen
const HEADER_H = 56 + 40; // insets.top approximate + 56
const BOTTOM_BAR_H = 100; // bottom buttons
const CARD_H = SCREEN_H - HEADER_H - BOTTOM_BAR_H - 24;
const CARD_W = SCREEN_W - 16;

/* ── Slide types ── */
type SlideType = "PHOTO" | "INTERESTS" | "FAVORITES" | "PROMPTS";
interface Slide {
  id: string;
  type: SlideType;
  content: any;
}

function buildSlides(user: User): Slide[] {
  const built: Slide[] = [];

  // 1. Main Photo
  built.push({
    id: "main_photo",
    type: "PHOTO",
    content: user.photos?.[0] || { photoUrl: user.profilePhotoUrl },
  });

  // 2. Interests / Bio
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
      if (Array.isArray(p) && p.length)
        built.push({ id: "prompts", type: "PROMPTS", content: p });
    } catch (e) {}
  }

  // 5. Additional photos
  if (user.photos && user.photos.length > 1) {
    user.photos.slice(1).forEach((photo, idx) => {
      built.push({ id: `photo_${idx}`, type: "PHOTO", content: photo });
    });
  }

  return built;
}

/* ── Animated slide indicator ── */
function SlideIndicator({
  index,
  scrollX,
  total,
}: {
  index: number;
  scrollX: Animated.SharedValue<number>;
  total: number;
}) {
  const animStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * CARD_W,
      index * CARD_W,
      (index + 1) * CARD_W,
    ];
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.35, 1, 0.35],
      Extrapolation.CLAMP
    );
    const scaleX = interpolate(
      scrollX.value,
      inputRange,
      [1, 1.6, 1],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ scaleX }] };
  });

  return <Animated.View style={[styles.indicator, animStyle]} />;
}

export default function ProfilePreviewScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(() => (user ? buildSlides(user) : []), [user]);

  const age = useMemo(() => {
    if (!user?.dateOfBirth) return null;
    const dob = new Date(user.dateOfBirth);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }, [user?.dateOfBirth]);

  const fullName = user
    ? `${user.firstName}${user.lastName && user.lastName !== "." ? ` ${user.lastName}` : ""}`
    : "Erasmus";
  const destination = [user?.destinationCity, user?.destinationCountry]
    .filter(Boolean)
    .join(", ");

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleMomentumEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
    if (newIndex !== activeIndex) {
      Haptics.selectionAsync();
      setActiveIndex(newIndex);
    }
  };

  const handleTap = (direction: "prev" | "next") => {
    let nextIndex = direction === "next" ? activeIndex + 1 : activeIndex - 1;
    if (nextIndex >= 0 && nextIndex < slides.length) {
      Haptics.selectionAsync();
      scrollRef.current?.scrollTo({ x: nextIndex * CARD_W, animated: true });
      setActiveIndex(nextIndex);
    }
  };

  if (!user) return <View style={styles.root} />;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0A1628"]}
        style={StyleSheet.absoluteFill}
      />

      {/* ═══ Header ═══ */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerBtn}
          hitSlop={12}
        >
          <View style={styles.headerBtnCircle}>
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.text.primary}
            />
          </View>
        </Pressable>
        <Text style={styles.headerTitle}>Vista previa</Text>
        <View style={styles.headerBtn} />
      </Animated.View>

      {/* ═══ Subtitle ═══ */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.subtitleWrap}
      >
        <Ionicons
          name="eye-outline"
          size={16}
          color="rgba(255,255,255,0.5)"
        />
        <Text style={styles.subtitleText}>
          Así ven los demás tu perfil en la sección Descubrir
        </Text>
      </Animated.View>

      {/* ═══ Card Preview ═══ */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.cardContainer}
      >
        {/* Slide indicators */}
        <View style={styles.indicatorsWrap}>
          {slides.map((_, i) => (
            <SlideIndicator
              key={i}
              index={i}
              scrollX={scrollX}
              total={slides.length}
            />
          ))}
        </View>

        <Animated.ScrollView
          ref={scrollRef as any}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumEnd}
          style={StyleSheet.absoluteFillObject}
          snapToInterval={CARD_W}
          decelerationRate="fast"
          contentContainerStyle={{ alignItems: "center" }}
        >
          {slides.map((slide, idx) => (
            <View key={slide.id} style={{ width: CARD_W, height: "100%" }}>
              {/* Tap zones */}
              <View style={styles.tapZones}>
                <Pressable
                  style={styles.tapZone}
                  onPress={() => handleTap("prev")}
                />
                <Pressable
                  style={styles.tapZone}
                  onPress={() => handleTap("next")}
                />
              </View>

              {slide.type === "PHOTO" && (
                <View style={styles.slideContent}>
                  {slide.content?.photoUrl ? (
                    <Image
                      source={{
                        uri: resolveMediaUrl(slide.content.photoUrl),
                      }}
                      style={styles.fullImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={["#1A2D4D", "#0D1F3C"]}
                      style={styles.fullImage}
                    >
                      <View style={styles.noPhotoWrap}>
                        <Ionicons
                          name="camera-outline"
                          size={48}
                          color="rgba(255,255,255,0.2)"
                        />
                        <Text style={styles.noPhotoText}>
                          Añade una foto para mejorar tu perfil
                        </Text>
                      </View>
                    </LinearGradient>
                  )}
                  <LinearGradient
                    colors={["transparent", "rgba(4,6,26,0.95)"]}
                    style={styles.bottomGradient}
                  />
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>
                        {fullName}
                        {age !== null && (
                          <Text style={styles.age}>, {age}</Text>
                        )}
                      </Text>
                      {user?.isVerified && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colors.eu.star}
                        />
                      )}
                    </View>
                    {destination && (
                      <View style={styles.locationRow}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color="#FFF"
                        />
                        <Text style={styles.location}>{destination}</Text>
                      </View>
                    )}
                    {user?.homeUniversity && (
                      <View style={styles.locationRow}>
                        <Ionicons
                          name="school-outline"
                          size={14}
                          color="rgba(255,255,255,0.6)"
                        />
                        <Text
                          style={[
                            styles.location,
                            { color: "rgba(255,255,255,0.6)" },
                          ]}
                        >
                          {user.homeUniversity.name}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {slide.type === "INTERESTS" && (
                <LinearGradient
                  colors={["#0D1F3C", "#0A1628"]}
                  style={styles.slideContentGlass}
                >
                  <Text style={styles.slideTitle}>Sobre mí</Text>
                  {user.bio && (
                    <Text style={styles.bioText}>{user.bio}</Text>
                  )}
                  {user.interests && user.interests.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {user.interests.map((interest: any) => (
                        <View key={interest.id} style={styles.tag}>
                          <Text style={styles.tagText}>
                            {interest.emoji || "✦"} {interest.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {!user.bio &&
                    (!user.interests || user.interests.length === 0) && (
                      <View style={styles.emptySlide}>
                        <Ionicons
                          name="sparkles-outline"
                          size={36}
                          color="rgba(255,255,255,0.15)"
                        />
                        <Text style={styles.emptySlideText}>
                          Añade una bio y tus intereses para completar este
                          slide
                        </Text>
                      </View>
                    )}
                </LinearGradient>
              )}

              {slide.type === "FAVORITES" && (
                <LinearGradient
                  colors={["#1E1610", "#0A0502"]}
                  style={styles.slideContentGlass}
                >
                  <Text
                    style={[styles.slideTitle, { color: colors.eu.orange }]}
                  >
                    Favoritos
                  </Text>
                  <View style={styles.favoritesWrap}>
                    {user.favoriteSong && (
                      <View style={styles.favoriteItem}>
                        <Ionicons
                          name="musical-notes"
                          size={24}
                          color={colors.eu.orange}
                        />
                        <View>
                          <Text style={styles.favoriteLabel}>Canción</Text>
                          <Text style={styles.favoriteValue}>
                            {user.favoriteSong}
                          </Text>
                        </View>
                      </View>
                    )}
                    {user.favoriteFood && (
                      <View style={styles.favoriteItem}>
                        <Ionicons
                          name="restaurant"
                          size={24}
                          color={colors.eu.orange}
                        />
                        <View>
                          <Text style={styles.favoriteLabel}>Comida</Text>
                          <Text style={styles.favoriteValue}>
                            {user.favoriteFood}
                          </Text>
                        </View>
                      </View>
                    )}
                    {user.specialHobby && (
                      <View style={styles.favoriteItem}>
                        <Ionicons
                          name="star"
                          size={24}
                          color={colors.eu.orange}
                        />
                        <View>
                          <Text style={styles.favoriteLabel}>
                            Hobby especial
                          </Text>
                          <Text style={styles.favoriteValue}>
                            {user.specialHobby}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              )}

              {slide.type === "PROMPTS" && (
                <LinearGradient
                  colors={["#1A180B", "#0A0A05"]}
                  style={styles.slideContentGlass}
                >
                  <Text
                    style={[styles.slideTitle, { color: colors.eu.star }]}
                  >
                    Mis Respuestas
                  </Text>
                  <View style={{ gap: spacing.md }}>
                    {slide.content.map((p: any, i: number) => (
                      <View key={i} style={styles.promptCard}>
                        <Text style={styles.promptQ}>{p.question}</Text>
                        <Text style={styles.promptA}>{p.answer}</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              )}
            </View>
          ))}
        </Animated.ScrollView>
      </Animated.View>

      {/* ═══ Bottom tips ═══ */}
      <Animated.View
        entering={FadeInDown.delay(350).springify()}
        style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}
      >
        <View style={styles.slideCounter}>
          <Text style={styles.slideCounterText}>
            {activeIndex + 1}/{slides.length} slides
          </Text>
        </View>

        <Pressable
          style={styles.editProfileBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate("EditProfileHub");
          }}
        >
          <LinearGradient
            colors={["#FFD700", "#FFBA08"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.editProfileBtnGrad}
          >
            <Ionicons name="create-outline" size={18} color="#0A1628" />
            <Text style={styles.editProfileBtnText}>Editar perfil</Text>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.background },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    zIndex: 10,
  },
  headerBtn: { width: 44, alignItems: "center" },
  headerBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    color: colors.text.primary,
  },

  /* Subtitle */
  subtitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingBottom: spacing.md,
  },
  subtitleText: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },

  /* Card */
  cardContainer: {
    width: CARD_W,
    height: CARD_H,
    alignSelf: "center",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: DS.background,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },

  /* Indicators */
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

  /* Tap zones */
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 50,
  },
  tapZone: {
    flex: 1,
    height: "100%",
  },

  /* Slides */
  slideContent: { flex: 1 },
  fullImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  noPhotoWrap: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  noPhotoText: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
    lineHeight: 20,
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
    marginBottom: 2,
  },
  location: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
  },

  /* Glass slides */
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
  emptySlide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  emptySlideText: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
    lineHeight: 22,
  },

  /* Favorites */
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

  /* Prompts */
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

  /* Bottom bar */
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  slideCounter: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  slideCounterText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.secondary,
  },
  editProfileBtn: {
    flex: 1,
    borderRadius: radii.full,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  editProfileBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  editProfileBtnText: {
    fontFamily: typography.families.heading,
    fontSize: 15,
    color: "#0A1628",
  },
});
