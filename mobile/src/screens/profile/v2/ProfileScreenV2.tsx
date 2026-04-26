import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { Avatar, ScreenBackground } from "@/design-system";
import { colors, radii, spacing, typography } from "@/design-system/tokens";
import { useAuthStore } from "@/store/useAuthStore";
import { useMyProfile } from "@/hooks/useProfileQuery";
import { FlipUserCard, FLIP_CARD_HEIGHT } from "@/screens/discover/components";
import type { ProfileStackParamList } from "@/types";
import { toProfileCardUser } from "../utils/profileCardUser";
import ProfilePostsTabV2 from "./ProfilePostsTabV2";
import { getProfileCardSettings, CARD_THEMES, FRAME_OPTIONS } from "../data/cardSettings";
import { getProfilePosts } from "../data/profilePosts";

type NavProp = StackNavigationProp<ProfileStackParamList, "ProfileMain">;
type TabKey = "posts" | "card" | "about";

const TABS: Array<{ key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: "posts", label: "Posts", icon: "grid-outline" },
  { key: "card", label: "Tarjeta", icon: "card-outline" },
  { key: "about", label: "Info", icon: "person-outline" },
];

/* ── Stat pill ── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={s.statItem}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

/* ── Quick-action row button ── */
function ActionBtn({
  icon,
  label,
  onPress,
  primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  const inner = (
    <View style={[s.actionInner, !primary && s.actionInnerSecondary]}>
      <Ionicons name={icon} size={15} color={primary ? "#0A1628" : colors.eu.star} />
      <Text style={[s.actionLabel, primary && s.actionLabelPrimary]}>{label}</Text>
    </View>
  );

  if (primary) {
    return (
      <Pressable style={s.actionBtn} onPress={onPress}>
        <LinearGradient colors={["#FFD700", "#FF8C35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.actionInner}>
          <Ionicons name={icon} size={15} color="#0A1628" />
          <Text style={s.actionLabelPrimary}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return <Pressable style={s.actionBtn} onPress={onPress}>{inner}</Pressable>;
}

/* ═══════════════════════════════════════════════════════════ */
export default function ProfileScreenV2(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavProp>();
  const authUser = useAuthStore((st) => st.user);

  const [tab, setTab] = useState<TabKey>("posts");
  const [refreshing, setRefreshing] = useState(false);

  const profileQuery = useMyProfile();
  const postsQuery = useQuery({ queryKey: ["profilePosts"], queryFn: getProfilePosts });
  const cardSettingsQuery = useQuery({ queryKey: ["profileCardSettings"], queryFn: getProfileCardSettings });

  const profile = profileQuery.data;
  const posts = postsQuery.data ?? [];
  const cardSettings = cardSettingsQuery.data;

  const fullName = `${profile?.firstName ?? authUser?.firstName ?? ""} ${profile?.lastName ?? authUser?.lastName ?? ""}`.trim() || "Usuario";
  const username = (profile?.firstName ?? authUser?.firstName ?? "usuario").toLowerCase();
  const location = [profile?.destinationCity, profile?.destinationCountry].filter(Boolean).join(", ") || "Destino no definido";

  const stats = useMemo(
    () => [
      { label: "posts", value: String(posts.length) },
      { label: "amigos", value: String(profile?.friendCount ?? 0) },
      { label: "eventos", value: String(profile?.eventCount ?? 0) },
    ],
    [posts.length, profile?.friendCount, profile?.eventCount],
  );

  const cardUser = useMemo(() => toProfileCardUser(profile), [profile]);

  const selectedFrame = useMemo(
    () => FRAME_OPTIONS.find((f) => f.id === cardSettings?.frameId) ?? FRAME_OPTIONS[0],
    [cardSettings?.frameId],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([profileQuery.refetch(), postsQuery.refetch(), cardSettingsQuery.refetch()]);
    setRefreshing(false);
  }, [profileQuery, postsQuery, cardSettingsQuery]);

  if (profileQuery.isLoading && !profile) {
    return (
      <ScreenBackground>
        <View style={s.centered}>
          <ActivityIndicator size="large" color={colors.eu.star} />
          <Text style={s.loadingText}>Cargando perfil…</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.eu.star} />}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={[s.header, { paddingTop: insets.top + 6 }]}>
          <Text style={s.username}>@{username}</Text>
          <View style={s.headerActions}>
            <Pressable style={s.headerAction} onPress={() => navigation.navigate("CreatePost", { communityId: 0 })}>
              <Ionicons name="add-circle-outline" size={20} color={colors.text.primary} />
            </Pressable>
            <Pressable style={s.headerAction} onPress={() => navigation.navigate("EditProfile")}>
              <Ionicons name="settings-outline" size={20} color={colors.text.primary} />
            </Pressable>
          </View>
        </View>

        {/* ── Avatar + Stats ── */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={s.topRow}>
          <Avatar name={fullName} uri={profile?.profilePhotoUrl} size="lg" />
          <View style={s.statsRow}>
            {stats.map((item) => (
              <Stat key={item.label} value={item.value} label={item.label} />
            ))}
          </View>
        </Animated.View>

        {/* ── Bio ── */}
        <Animated.View entering={FadeInDown.delay(120).springify()} style={s.bioBlock}>
          <Text style={s.name}>{fullName}</Text>
          <View style={s.locationRow}>
            <Ionicons name="location-outline" size={13} color={colors.eu.star} />
            <Text style={s.location}>{location}</Text>
          </View>
          {profile?.bio ? <Text style={s.bio}>{profile.bio}</Text> : (
            <Text style={s.bioHint}>Añade una bio para presentarte al mundo Erasmus ✨</Text>
          )}
          {!!cardSettings?.badge && (
            <View style={s.badgePill}>
              <Ionicons name="ribbon-outline" size={12} color={colors.eu.star} />
              <Text style={s.badgeText}>{cardSettings.badge}</Text>
            </View>
          )}
        </Animated.View>

        {/* ── Action Buttons ── */}
        <Animated.View entering={FadeInDown.delay(180).springify()} style={s.actionsRow}>
          <ActionBtn icon="create-outline" label="Editar perfil" onPress={() => navigation.navigate("EditProfile")} primary />
          <ActionBtn icon="color-palette-outline" label="Mi tarjeta" onPress={() => navigation.navigate("CardCustomize")} />
          <Pressable style={s.iconButton} onPress={() => navigation.navigate("AugmentedProfile")}>
            <Ionicons name="scan-outline" size={18} color={colors.text.primary} />
          </Pressable>
        </Animated.View>

        {/* ── Tabs ── */}
        <View style={s.tabs}>
          {TABS.map((item) => {
            const active = tab === item.key;
            return (
              <Pressable
                key={item.key}
                style={[s.tab, active && s.tabActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTab(item.key);
                }}
              >
                <Ionicons name={item.icon} size={14} color={active ? colors.eu.star : colors.text.tertiary} />
                <Text style={[s.tabLabel, active && s.tabLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── Posts ── */}
        {tab === "posts" && (
          <ProfilePostsTabV2
            posts={posts}
            onCreatePost={() => navigation.navigate("CreatePost", { communityId: 0 })}
            onOpenPost={(postId) => navigation.navigate("PostDetail", { communityId: 0, postId })}
          />
        )}

        {/* ── Card Preview ── */}
        {tab === "card" && (
          <Animated.View entering={FadeInDown.delay(80).springify()} style={s.cardSection}>
            <View style={s.cardExplainer}>
              <Ionicons name="sparkles-outline" size={14} color={colors.eu.star} />
              <Text style={s.cardExplainerText}>Esta es tu tarjeta oficial — la misma que aparece en Inicio y Discover.</Text>
            </View>
            <View style={[s.cardFrame, { borderColor: selectedFrame.border, shadowColor: selectedFrame.glow }]}>
              <View style={s.cardWrap}>
                <FlipUserCard user={cardUser} />
              </View>
            </View>
            {!!cardSettings?.headline?.trim() && (
              <Text style={[s.headline, { color: cardSettings.accentColor ?? colors.eu.star }]}>"{cardSettings.headline}"</Text>
            )}
            <Pressable
              style={s.editCardBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate("CardCustomize");
              }}
            >
              <LinearGradient colors={["#FFD700", "#FF8C35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.editCardGradient}>
                <Ionicons name="color-palette-outline" size={16} color="#0A1628" />
                <Text style={s.editCardText}>Personalizar tarjeta</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* ── About ── */}
        {tab === "about" && (
          <Animated.View entering={FadeInDown.delay(80).springify()} style={s.aboutSection}>
            <View style={s.aboutCard}>
              <View style={s.aboutIconRow}>
                <Ionicons name="school-outline" size={16} color={colors.eu.star} />
                <Text style={s.aboutCardTitle}>Universidad</Text>
              </View>
              <Text style={s.aboutValue}>{profile?.hostUniversity?.name ?? profile?.homeUniversity?.name ?? "No definida"}</Text>
            </View>
            <View style={s.aboutCard}>
              <View style={s.aboutIconRow}>
                <Ionicons name="language-outline" size={16} color={colors.eu.star} />
                <Text style={s.aboutCardTitle}>Idiomas</Text>
              </View>
              <Text style={s.aboutValue}>{(profile?.languages ?? []).map((l) => l.name).join(", ") || "No definidos"}</Text>
            </View>
            <View style={s.aboutCard}>
              <View style={s.aboutIconRow}>
                <Ionicons name="heart-outline" size={16} color={colors.eu.star} />
                <Text style={s.aboutCardTitle}>Intereses</Text>
              </View>
              <Text style={s.aboutValue}>{(profile?.interests ?? []).map((i) => i.name).join(", ") || "No definidos"}</Text>
            </View>
            <View style={s.aboutCard}>
              <View style={s.aboutIconRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.eu.star} />
                <Text style={s.aboutCardTitle}>Movilidad</Text>
              </View>
              <Text style={s.aboutValue}>
                {profile?.mobilityStartDate
                  ? `${new Date(profile.mobilityStartDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" })} → ${profile?.mobilityEndDate ? new Date(profile.mobilityEndDate).toLocaleDateString("es-ES", { month: "long", year: "numeric" }) : "Sin definir"}`
                  : "Sin definir"}
              </Text>
            </View>

            {/* Quick links */}
            <View style={s.quickLinks}>
              <Pressable style={s.quickLink} onPress={() => navigation.navigate("EditPhotos")}>
                <Ionicons name="images-outline" size={16} color={colors.eu.star} />
                <Text style={s.quickLinkText}>Fotos</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.text.tertiary} />
              </Pressable>
              <Pressable style={s.quickLink} onPress={() => navigation.navigate("Interests")}>
                <Ionicons name="heart-outline" size={16} color={colors.eu.star} />
                <Text style={s.quickLinkText}>Intereses</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.text.tertiary} />
              </Pressable>
              <Pressable style={s.quickLink} onPress={() => navigation.navigate("Languages")}>
                <Ionicons name="language-outline" size={16} color={colors.eu.star} />
                <Text style={s.quickLinkText}>Idiomas</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.text.tertiary} />
              </Pressable>
              <Pressable style={s.quickLink} onPress={() => navigation.navigate("MoodBoard")}>
                <Ionicons name="color-wand-outline" size={16} color={colors.eu.star} />
                <Text style={s.quickLinkText}>Mood Board</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.text.tertiary} />
              </Pressable>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.sm },
  loadingText: { fontFamily: typography.families.body, fontSize: 13, color: colors.text.secondary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  username: {
    fontFamily: typography.families.subheading,
    fontSize: 20,
    color: colors.text.primary,
  },
  headerActions: { flexDirection: "row", gap: spacing.xs },
  headerAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  statsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statValue: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    color: colors.text.primary,
  },
  statLabel: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: "uppercase",
  },
  bioBlock: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 3,
  },
  name: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: colors.text.primary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  bio: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 19,
    marginTop: 4,
  },
  bioHint: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.tertiary,
    lineHeight: 18,
    marginTop: 4,
  },
  badgePill: {
    marginTop: 6,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.24)",
    backgroundColor: "rgba(255,215,0,0.08)",
  },
  badgeText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: colors.eu.star,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  actionInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radii.md,
  },
  actionInnerSecondary: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  actionLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.text.primary,
  },
  actionLabelPrimary: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: "#0A1628",
  },
  iconButton: {
    width: 42,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  tabs: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    flexDirection: "row",
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.04)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
  },
  tabActive: {
    borderColor: "rgba(255,215,0,0.28)",
    backgroundColor: "rgba(255,215,0,0.09)",
  },
  tabLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  tabLabelActive: { color: colors.eu.star },
  cardSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  cardExplainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,215,0,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.15)",
  },
  cardExplainerText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  cardFrame: {
    borderWidth: 1.5,
    borderRadius: radii.xl,
    padding: 6,
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardWrap: {
    width: "100%",
    height: FLIP_CARD_HEIGHT,
  },
  headline: {
    alignSelf: "center",
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    fontStyle: "italic",
  },
  editCardBtn: {
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  editCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: radii.lg,
  },
  editCardText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: "#0A1628",
  },
  aboutSection: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  aboutCard: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: spacing.sm,
    gap: 6,
  },
  aboutIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  aboutCardTitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.text.primary,
  },
  aboutLabel: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: "uppercase",
  },
  aboutValue: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
  quickLinks: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.03)",
    overflow: "hidden",
  },
  quickLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  quickLinkText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.primary,
  },
});
