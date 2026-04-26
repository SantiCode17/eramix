/**
 * ════════════════════════════════════════════════════════════════
 *  ProfileScreen — Galactic Premium Design v2
 *  Tinder-inspired hero cover · Glassmorphic sections · Smooth
 *  entry animations · Profile completeness ring · EU Gold accents
 *  Connected to backend · Refreshes profile data on focus
 * ════════════════════════════════════════════════════════════════
 */
import React, { useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { useAuthStore } from "@/store/useAuthStore";
import { profileApi } from "@/api/profileService";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import {
  colors,
  typography,
  spacing,
  radii,
  DS,
  TAB_BAR_HEIGHT,
} from "@/design-system/tokens";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const COVER_H = SCREEN_H * 0.48;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/* ── Circular progress ring ── */
function CompletenessRing({
  percent,
  size = 56,
  strokeWidth = 3.5,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.eu.star}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function ProfileScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [refreshing, setRefreshing] = useState(false);

  /* ── Refresh profile from API on screen focus ── */
  useFocusEffect(
    useCallback(() => {
      profileApi
        .getMyProfile()
        .then((freshUser) => updateUser(freshUser))
        .catch(() => {});
    }, [updateUser])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const freshUser = await profileApi.getMyProfile();
      updateUser(freshUser);
    } catch {}
    setRefreshing(false);
  }, [updateUser]);

  /* ── cover photo ── */
  const coverPhoto = useMemo(() => {
    if (user?.photos?.[0]?.photoUrl) return resolveMediaUrl(user.photos[0].photoUrl);
    if (user?.profilePhotoUrl) return resolveMediaUrl(user.profilePhotoUrl);
    return null;
  }, [user?.photos, user?.profilePhotoUrl]);

  /* ── age from DOB ── */
  const age = useMemo(() => {
    if (!user?.dateOfBirth) return null;
    const dob = new Date(user.dateOfBirth);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }, [user?.dateOfBirth]);

  /* ── completeness score ── */
  const completeness = useMemo(() => {
    let score = 0;
    if (user?.photos && user.photos.length > 0) score += 15;
    if (user?.bio && user.bio.trim().length > 0) score += 15;
    if (user?.interests && user.interests.length > 0) score += 15;
    if (user?.destinationCity) score += 15;
    if (user?.favoriteSong) score += 10;
    if (user?.height || user?.zodiac || user?.profession) score += 15;
    if (user?.customPrompts && user.customPrompts.length > 5) score += 15;
    return Math.min(score, 100);
  }, [user]);

  const navTo = useCallback(
    (screen: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate(screen);
    },
    [navigation]
  );

  /* ── Photo count ── */
  const photoCount = user?.photos?.length ?? 0;
  const interestCount = user?.interests?.length ?? 0;

  return (
    <View style={s.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 120 }}
        bounces
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.eu.star}
            colors={[colors.eu.star]}
          />
        }
      >
        {/* ═══════════════ HERO COVER ═══════════════ */}
        <View style={[s.coverWrap, { height: COVER_H }]}>
          {coverPhoto ? (
            <Image
              source={{ uri: coverPhoto }}
              style={s.coverImage}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={["#0E1A35", "#1A2742", "#132240"]}
              style={s.coverImage}
            />
          )}

          {/* Gradient overlay */}
          <LinearGradient
            colors={[
              "rgba(10,22,40,0.05)",
              "rgba(10,22,40,0.3)",
              "rgba(10,22,40,0.75)",
              DS.background,
            ]}
            locations={[0, 0.45, 0.75, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Top row — settings + completeness ring */}
          <View style={[s.topRow, { top: insets.top + 8 }]}>
            <Pressable
              style={s.topIconBtn}
              onPress={() => navigation.getParent()?.navigate("Settings")}
            >
              <Ionicons name="settings-outline" size={22} color="#FFF" />
            </Pressable>

            <Pressable
              style={s.completenessBtn}
              onPress={() => navTo("EditProfileHub")}
            >
              <CompletenessRing percent={completeness} size={44} strokeWidth={3} />
              <View style={s.completenessInner}>
                <Text style={s.completenessText}>{completeness}%</Text>
              </View>
            </Pressable>
          </View>

          {/* User info overlay */}
          <Animated.View entering={FadeIn.delay(100).duration(500)} style={s.userInfoOverlay}>
            <View style={s.nameRow}>
              <Text style={s.userName}>
                {user?.firstName}
                {user?.lastName && user.lastName !== "." ? ` ${user.lastName}` : ""}
              </Text>
              {age !== null && <Text style={s.userAge}>, {age}</Text>}
              {user?.isVerified && (
                <View style={s.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="#0A1628" />
                </View>
              )}
            </View>

            {(user?.destinationCity || user?.homeUniversity?.city) && (
              <View style={s.locationRow}>
                <Ionicons name="location" size={13} color="rgba(255,215,0,0.8)" />
                <Text style={s.locationText}>
                  {user?.destinationCity || user?.homeUniversity?.city}
                  {user?.destinationCountry
                    ? `, ${user.destinationCountry}`
                    : user?.homeUniversity?.country
                    ? `, ${user.homeUniversity.country}`
                    : ""}
                </Text>
              </View>
            )}

            {user?.homeUniversity && (
              <View style={s.uniRow}>
                <Ionicons name="school-outline" size={13} color="rgba(255,255,255,0.5)" />
                <Text style={s.uniText}>{user.homeUniversity.name}</Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* ═══════════════ ACTION BUTTONS ═══════════════ */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={s.actionRow}>
          <Pressable
            style={s.primaryBtn}
            onPress={() => navTo("EditProfileHub")}
          >
            <LinearGradient
              colors={["#FFD700", "#FFBA08"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.primaryBtnGrad}
            >
              <Ionicons name="create-outline" size={18} color="#0A1628" />
              <Text style={s.primaryBtnText}>Editar perfil</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={s.secondaryBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navTo("ProfilePreview");
            }}
          >
            <Ionicons name="eye-outline" size={18} color="#FFF" />
            <Text style={s.secondaryBtnText}>Vista previa</Text>
          </Pressable>
        </Animated.View>

        {/* ═══════════════ COMPLETENESS CARD ═══════════════ */}
        {completeness < 100 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={s.progressCard}>
            <LinearGradient
              colors={["rgba(255,215,0,0.06)", "rgba(255,186,8,0.02)"]}
              style={s.progressCardInner}
            >
              <View style={s.progressRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.progressTitle}>Completa tu perfil</Text>
                  <Text style={s.progressSub}>
                    Los perfiles completos reciben 3× más visitas
                  </Text>
                </View>
                <CompletenessRing percent={completeness} size={52} />
                <View style={s.progressRingLabel}>
                  <Text style={s.progressRingText}>{completeness}%</Text>
                </View>
              </View>
              <View style={s.progressBarTrack}>
                <LinearGradient
                  colors={["#FFD700", "#FFBA08", "#FF8C35"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[s.progressBarFill, { width: `${completeness}%` }]}
                />
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* ═══════════════ QUICK SECTIONS ═══════════════ */}
        <View style={s.sectionsWrap}>
          <Text style={s.sectionGroupTitle}>Tu perfil</Text>

          <GlassCard
            icon="person-outline"
            iconColor="#8B5CF6"
            iconBg="rgba(139,92,246,0.12)"
            title="Sobre mí"
            subtitle={user?.bio ? "Bio completada ✓" : "Añade una bio para destacar"}
            onPress={() => navTo("EditAbout")}
            delay={250}
          />

          <GlassCard
            icon="information-circle-outline"
            iconColor="#00D68F"
            iconBg="rgba(0,214,143,0.12)"
            title="Básicos"
            subtitle="Altura, educación, idiomas..."
            onPress={() => navTo("EditBasics")}
            delay={350}
          />

          <GlassCard
            icon="fitness-outline"
            iconColor="#FF8C35"
            iconBg="rgba(255,140,53,0.12)"
            title="Estilo de vida"
            subtitle="Ejercicio, dieta, mascotas..."
            onPress={() => navTo("EditLifestyle")}
            delay={400}
          />

          <GlassCard
            icon="sparkles-outline"
            iconColor="#FF4F6F"
            iconBg="rgba(255,79,111,0.12)"
            title="Mis pasiones"
            subtitle={
              interestCount > 0
                ? `${interestCount} pasiones añadidas`
                : "Añade tus pasiones"
            }
            onPress={() => navTo("EditPassions")}
            delay={450}
          />

          <GlassCard
            icon="musical-notes-outline"
            iconColor="#1DB954"
            iconBg="rgba(29,185,84,0.12)"
            title="Mi canción"
            subtitle={user?.favoriteSong || "Elige tu himno del momento"}
            onPress={() => navTo("EditSong")}
            delay={500}
          />
        </View>

        {/* ═══════════════ STATS ROW ═══════════════ */}
        <Animated.View entering={FadeInDown.delay(550).springify()} style={s.statsRow}>
          <StatPill icon="people" value={user?.friendCount ?? 0} label="Amigos" />
          <View style={s.statDivider} />
          <StatPill icon="calendar" value={user?.eventCount ?? 0} label="Eventos" />
          <View style={s.statDivider} />
          <StatPill
            icon="images"
            value={photoCount}
            label="Fotos"
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

/* ── GlassCard component ── */
function GlassCard({
  icon,
  iconColor,
  iconBg,
  title,
  subtitle,
  onPress,
  highlight,
  delay = 0,
}: {
  icon: any;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  highlight?: boolean;
  delay?: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <AnimatedPressable
        style={[
          s.glassCard,
          highlight && s.glassCardHighlight,
          animStyle,
        ]}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        }}
      >
        <View style={[s.glassIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={s.glassContent}>
          <Text
            style={[s.glassTitle, highlight && { color: "#0A1628" }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text
            style={[s.glassSub, highlight && { color: "rgba(10,22,40,0.6)" }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={highlight ? "rgba(10,22,40,0.4)" : "rgba(255,255,255,0.25)"}
        />
      </AnimatedPressable>
    </Animated.View>
  );
}

/* ── StatPill component ── */
function StatPill({
  icon,
  value,
  label,
}: {
  icon: any;
  value: number;
  label: string;
}) {
  return (
    <View style={s.statPill}>
      <Ionicons name={icon} size={18} color={colors.eu.star} />
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

/* ════════════════ STYLES ════════════════ */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.background },

  /* ── Cover ── */
  coverWrap: { width: "100%", position: "relative" },
  coverImage: { width: "100%", height: "100%" },
  topRow: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  topIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  completenessBtn: { position: "relative", alignItems: "center", justifyContent: "center" },
  completenessInner: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  completenessText: {
    fontFamily: typography.families.bodyBold,
    fontSize: 10,
    color: "#FFF",
  },

  /* ── User info ── */
  userInfoOverlay: {
    position: "absolute",
    bottom: 0,
    left: spacing.lg,
    right: spacing.lg,
    paddingBottom: spacing.sm,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 2, marginBottom: 4 },
  userName: {
    fontFamily: typography.families.heading,
    fontSize: 30,
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  userAge: {
    fontFamily: typography.families.body,
    fontSize: 26,
    color: "rgba(255,255,255,0.85)",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  verifiedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.eu.star,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  locationText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },
  uniRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  uniText: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
  },

  /* ── Action buttons ── */
  actionRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginTop: 16,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: radii.full,
    overflow: "hidden",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  primaryBtnText: {
    fontFamily: typography.families.heading,
    fontSize: 15,
    color: "#0A1628",
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 8,
  },
  secondaryBtnText: {
    fontFamily: typography.families.subheading,
    fontSize: 14,
    color: "#FFF",
  },

  /* ── Progress card ── */
  progressCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.12)",
  },
  progressCardInner: {
    padding: spacing.md,
  },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  progressTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 2,
  },
  progressSub: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  progressRingLabel: {
    position: "absolute",
    right: 0,
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  progressRingText: {
    fontFamily: typography.families.bodyBold,
    fontSize: 13,
    color: colors.eu.star,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 3 },

  /* ── Sections ── */
  sectionsWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionGroupTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },

  /* ── Glass card ── */
  glassCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: spacing.md,
  },
  glassCardHighlight: {
    backgroundColor: colors.eu.star,
    borderColor: "rgba(255,186,8,0.4)",
  },
  glassIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  glassContent: { flex: 1 },
  glassTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 2,
  },
  glassSub: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.tertiary,
  },

  /* ── Stats row ── */
  statsRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  statPill: { flex: 1, alignItems: "center", gap: 4 },
  statValue: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.text.primary,
  },
  statLabel: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
});
