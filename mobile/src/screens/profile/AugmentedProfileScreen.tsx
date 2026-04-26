/**
 * ════════════════════════════════════════════════════════════════
 *  AugmentedProfileScreen — Holographic Profile Card
 *
 *  • Flip animation (front/back)
 *  • Pan gesture for 3D tilt effect
 *  • Shimmer overlay + gradient themes
 *  • Front: avatar, name, stats, QR placeholder
 *  • Back: bio, interests, mobility dates, share CTA
 * ════════════════════════════════════════════════════════════════
 */
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { StackScreenProps } from "@react-navigation/stack";

import { ScreenBackground, Avatar } from "@/design-system";
import { colors, typography, spacing, DS } from "@/design-system/tokens";
import { useMyProfile } from "@/hooks/useProfileQuery";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import type { ProfileStackParamList } from "@/types";

type Props = StackScreenProps<ProfileStackParamList, "AugmentedProfile">;

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = SCREEN_W - 48;
const CARD_H = CARD_W * 1.58;

/* ── Card Theme Gradients ── */
const THEMES: { name: string; colors: [string, string, string] }[] = [
  { name: "Obsidian",  colors: ["#0F1923", "#1A2A3C", "#0F1923"] },
  { name: "Aurora",    colors: ["#0A2342", "#134E5E", "#0A2342"] },
  { name: "Sunset",    colors: ["#2D1B42", "#4A1942", "#2D1B42"] },
  { name: "Deep Sea",  colors: ["#0B1120", "#142850", "#0B1120"] },
  { name: "Gold Rush", colors: ["#1A1400", "#3D3000", "#1A1400"] },
  { name: "Midnight",  colors: ["#0D0D1A", "#1A1A3E", "#0D0D1A"] },
];

/* ── Accent Colors ── */
const ACCENTS = ["#FFD700", "#FF6B2B", "#FF4F6F", "#00D4AA", "#6C5CE7", "#00B4D8", "#F2C464", "#FFFFFF"];

/* ═══ Main Screen ═══ */
export default function AugmentedProfileScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { data: profile } = useMyProfile();

  const [themeIdx, setThemeIdx] = useState(0);
  const [accentIdx, setAccentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const accent = ACCENTS[accentIdx];
  const theme = THEMES[themeIdx];

  /* ── Flip Animation ── */
  const flipProgress = useSharedValue(0);

  const flipCard = useCallback(() => {
    const next = !isFlipped;
    setIsFlipped(next);
    flipProgress.value = withSpring(next ? 1 : 0, {
      damping: 14,
      stiffness: 90,
    });
  }, [isFlipped, flipProgress]);

  const frontAnimStyle = useAnimatedStyle(() => ({
    backfaceVisibility: "hidden",
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const backAnimStyle = useAnimatedStyle(() => ({
    backfaceVisibility: "hidden",
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flipProgress.value, [0, 1], [180, 360])}deg` },
    ],
  }));

  /* ── Pan Gesture for 3D Tilt ── */
  const rotX = useSharedValue(0);
  const rotY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      rotX.value = interpolate(e.translationY, [-150, 150], [8, -8]);
      rotY.value = interpolate(e.translationX, [-150, 150], [-8, 8]);
    })
    .onEnd(() => {
      rotX.value = withSpring(0, { damping: 12 });
      rotY.value = withSpring(0, { damping: 12 });
    });

  const tiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateX: `${rotX.value}deg` },
      { rotateY: `${rotY.value}deg` },
    ],
  }));

  /* ── Share ── */
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `¡Mira mi tarjeta Erasmus en Eramix! 🌍✨\n${profile?.firstName} ${profile?.lastName}`,
      });
    } catch {}
  }, [profile]);

  const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();
  const photoUrl = profile?.profilePhotoUrl ? resolveMediaUrl(profile.profilePhotoUrl) : undefined;

  return (
    <ScreenBackground>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <View style={s.headerBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
          </View>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Mi Tarjeta</Text>
        <TouchableOpacity onPress={() => navigation.navigate("CardCustomize")} hitSlop={12}>
          <View style={s.headerBtn}>
            <Ionicons name="color-palette-outline" size={20} color={DS.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Card */}
      <Animated.View entering={FadeIn.delay(200)} style={s.cardArea}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={tiltStyle}>
            <TouchableOpacity onPress={flipCard} activeOpacity={1}>
              <View style={{ width: CARD_W, height: CARD_H }}>
                {/* Front */}
                <Animated.View style={[s.cardFace, frontAnimStyle]}>
                  <LinearGradient
                    colors={theme.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={s.cardGradient}
                  >
                    {/* Shimmer Lines */}
                    <View style={[s.shimmerLine, { top: "15%", left: -40, transform: [{ rotate: "25deg" }], backgroundColor: `${accent}10` }]} />
                    <View style={[s.shimmerLine, { top: "45%", right: -30, transform: [{ rotate: "-15deg" }], backgroundColor: `${accent}08` }]} />

                    {/* Logo */}
                    <View style={s.logoRow}>
                      <Text style={[s.logoText, { color: accent }]}>ERAMIX</Text>
                      <Text style={s.logoSub}>ERASMUS CARD</Text>
                    </View>

                    {/* Avatar */}
                    <View style={s.frontCenter}>
                      <View style={[s.photoRing, { borderColor: accent }]}>
                        {photoUrl ? (
                          <Image source={{ uri: photoUrl }} style={s.photoImg} />
                        ) : (
                          <Avatar name={fullName} size="xl" />
                        )}
                      </View>
                      <Text style={s.cardName}>{fullName || "Tu Nombre"}</Text>
                      {profile?.destinationCity && (
                        <View style={s.cityRow}>
                          <Ionicons name="location-sharp" size={12} color={accent} />
                          <Text style={[s.cityText, { color: accent }]}>
                            {profile.destinationCity}{profile.destinationCountry ? `, ${profile.destinationCountry}` : ""}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Stats row */}
                    <View style={s.statsRow}>
                      <View style={s.statItem}>
                        <Text style={[s.statNum, { color: accent }]}>{profile?.friendCount ?? 0}</Text>
                        <Text style={s.statLabel}>Amigos</Text>
                      </View>
                      <View style={[s.statDivider, { backgroundColor: `${accent}30` }]} />
                      <View style={s.statItem}>
                        <Text style={[s.statNum, { color: accent }]}>{profile?.eventCount ?? 0}</Text>
                        <Text style={s.statLabel}>Eventos</Text>
                      </View>
                      <View style={[s.statDivider, { backgroundColor: `${accent}30` }]} />
                      <View style={s.statItem}>
                        <Text style={[s.statNum, { color: accent }]}>{profile?.languages?.length ?? 0}</Text>
                        <Text style={s.statLabel}>Idiomas</Text>
                      </View>
                    </View>

                    {/* Bottom label */}
                    <View style={s.frontBottom}>
                      <Ionicons name="sync-outline" size={12} color={colors.text.tertiary} />
                      <Text style={s.tapHint}>Toca para voltear</Text>
                    </View>

                    {/* Border */}
                    <View style={[s.cardBorder, { borderColor: `${accent}20` }]} />
                  </LinearGradient>
                </Animated.View>

                {/* Back */}
                <Animated.View style={[s.cardFace, s.cardBack, backAnimStyle]}>
                  <LinearGradient
                    colors={theme.colors}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={s.cardGradient}
                  >
                    <View style={s.shimmerLine} />

                    <View style={s.backContent}>
                      <Text style={[s.backLabel, { color: accent }]}>SOBRE MÍ</Text>
                      <Text style={s.backBio}>
                        {profile?.bio || "Aún sin bio. ¡Cuéntale al mundo quién eres!"}
                      </Text>

                      {/* Interests */}
                      {profile?.interests && profile.interests.length > 0 && (
                        <View style={s.backSection}>
                          <Text style={[s.backLabel, { color: accent }]}>INTERESES</Text>
                          <View style={s.tagWrap}>
                            {profile.interests.slice(0, 6).map((i) => (
                              <View key={typeof i === "object" ? (i as any).id : i} style={[s.tag, { borderColor: `${accent}40` }]}>
                                <Text style={s.tagText}>
                                  {typeof i === "object" ? (i as any).name : i}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Languages */}
                      {profile?.languages && profile.languages.length > 0 && (
                        <View style={s.backSection}>
                          <Text style={[s.backLabel, { color: accent }]}>IDIOMAS</Text>
                          <View style={s.tagWrap}>
                            {profile.languages.slice(0, 4).map((l) => (
                              <View key={typeof l === "object" ? (l as any).id : l} style={[s.tag, { borderColor: `${accent}40` }]}>
                                <Text style={s.tagText}>
                                  {typeof l === "object" ? (l as any).name || (l as any).language : l}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Mobility */}
                      {profile?.mobilityStartDate && (
                        <View style={s.backSection}>
                          <Text style={[s.backLabel, { color: accent }]}>MOVILIDAD</Text>
                          <Text style={s.backMobility}>
                            {profile.mobilityStartDate}  →  {profile.mobilityEndDate ?? "Actualidad"}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Share */}
                    <TouchableOpacity onPress={handleShare} style={[s.shareBtn, { backgroundColor: accent }]}>
                      <Ionicons name="share-social-outline" size={16} color="#0A1628" />
                      <Text style={s.shareBtnText}>Compartir tarjeta</Text>
                    </TouchableOpacity>

                    <View style={s.frontBottom}>
                      <Ionicons name="sync-outline" size={12} color={colors.text.tertiary} />
                      <Text style={s.tapHint}>Toca para voltear</Text>
                    </View>

                    <View style={[s.cardBorder, { borderColor: `${accent}20` }]} />
                  </LinearGradient>
                </Animated.View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      </Animated.View>

      {/* Theme Dots */}
      <Animated.View entering={FadeInDown.delay(400)} style={s.selector}>
        <Text style={s.selectorLabel}>Tema</Text>
        <View style={s.dots}>
          {THEMES.map((t, i) => (
            <TouchableOpacity
              key={t.name}
              onPress={() => setThemeIdx(i)}
              style={[s.dot, { backgroundColor: t.colors[1] }, themeIdx === i && { borderColor: accent, borderWidth: 2 }]}
            />
          ))}
        </View>
      </Animated.View>

      {/* Accent Dots */}
      <Animated.View entering={FadeInDown.delay(500)} style={s.selector}>
        <Text style={s.selectorLabel}>Acento</Text>
        <View style={s.dots}>
          {ACCENTS.map((c, i) => (
            <TouchableOpacity
              key={c}
              onPress={() => setAccentIdx(i)}
              style={[s.dot, { backgroundColor: c }, accentIdx === i && { borderColor: "#FFF", borderWidth: 2 }]}
            />
          ))}
        </View>
      </Animated.View>
    </ScreenBackground>
  );
}

/* ═══ Styles ═══ */
const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingBottom: 8 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontFamily: typography.families.subheading, fontSize: typography.sizes.h4.fontSize, color: colors.text.primary },
  // Card
  cardArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardFace: { position: "absolute", width: CARD_W, height: CARD_H, borderRadius: 20, overflow: "hidden" },
  cardBack: {},
  cardGradient: { flex: 1, padding: 24, justifyContent: "space-between" },
  cardBorder: { ...StyleSheet.absoluteFillObject, borderRadius: 20, borderWidth: 1 },
  shimmerLine: { position: "absolute", width: 200, height: 1, opacity: 0.4 },
  // Front
  logoRow: { alignItems: "flex-start" },
  logoText: { fontFamily: typography.families.heading, fontSize: 18, letterSpacing: 4 },
  logoSub: { fontFamily: typography.families.body, fontSize: 8, color: colors.text.tertiary, letterSpacing: 2, marginTop: 2 },
  frontCenter: { alignItems: "center" },
  photoRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 2.5, padding: 3, justifyContent: "center", alignItems: "center" },
  photoImg: { width: 90, height: 90, borderRadius: 45 },
  cardName: { fontFamily: typography.families.heading, fontSize: 22, color: colors.text.primary, marginTop: 14, textAlign: "center" },
  cityRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  cityText: { fontFamily: typography.families.body, fontSize: 12 },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  statItem: { alignItems: "center" },
  statNum: { fontFamily: typography.families.heading, fontSize: 20 },
  statLabel: { fontFamily: typography.families.body, fontSize: 10, color: colors.text.secondary, marginTop: 2 },
  statDivider: { width: 1, height: 24 },
  frontBottom: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  tapHint: { fontFamily: typography.families.body, fontSize: 10, color: colors.text.tertiary },
  // Back
  backContent: { flex: 1, gap: 14 },
  backLabel: { fontFamily: typography.families.bodyMedium, fontSize: 10, letterSpacing: 1.5, marginBottom: 4 },
  backBio: { fontFamily: typography.families.body, fontSize: 13, color: colors.text.secondary, lineHeight: 19 },
  backSection: {},
  tagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  tagText: { fontFamily: typography.families.body, fontSize: 11, color: colors.text.primary },
  backMobility: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.text.secondary },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 20, marginBottom: 8 },
  shareBtnText: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: "#0A1628" },
  // Selectors
  selector: { flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingVertical: 6, gap: 12 },
  selectorLabel: { fontFamily: typography.families.body, fontSize: 10, color: colors.text.tertiary, width: 40 },
  dots: { flexDirection: "row", gap: 8 },
  dot: { width: 24, height: 24, borderRadius: 12 },
});
