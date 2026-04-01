import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Pressable,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard, Chip, LoadingSpinner, Divider } from "@/design-system/components";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { useProfileStore } from "@/store";
import type { ProfileStackParamList } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 110;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

type Nav = StackNavigationProp<ProfileStackParamList, "ProfileMain">;

export default function ProfileScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [scrollY] = useState(() => new Animated.Value(0));

  const {
    profile,
    isLoadingProfile,
    photos,
    fetchProfile,
  } = useProfileStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  }, [fetchProfile]);

  // ── Animated header ─────────────────────────────────
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const nameTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  if (isLoadingProfile && !profile) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.background.start, colors.background.end]}
          style={StyleSheet.absoluteFill}
        />
        <LoadingSpinner size={48} />
      </View>
    );
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : "Usuario";
  const location = [profile?.destinationCity, profile?.destinationCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      {/* Collapsible header */}
      <Animated.View style={[styles.header, { height: headerHeight, paddingTop: insets.top }]}>
        <LinearGradient
          colors={["rgba(0,51,153,0.9)", "rgba(26,26,46,0.95)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Profile photo */}
        <Animated.View style={[styles.avatarContainer, { opacity: imageOpacity }]}>
          {profile?.profilePhotoUrl ? (
            <Image
              source={{ uri: profile.profilePhotoUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>
                {profile?.firstName?.[0]?.toUpperCase() ?? "?"}
                {profile?.lastName?.[0]?.toUpperCase() ?? ""}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Name and location */}
        <Animated.View
          style={[styles.headerInfo, { transform: [{ translateY: nameTranslateY }] }]}
        >
          <Text style={styles.displayName}>{displayName}</Text>
          {location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* Edit button */}
        <Pressable
          style={[styles.editButton, { top: insets.top + spacing.sm }]}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Ionicons name="create-outline" size={16} color={colors.text.primary} />
          <Text style={styles.editButtonText}>Editar</Text>
        </Pressable>
      </Animated.View>

      {/* Scrollable content */}
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: HEADER_MAX_HEIGHT + spacing.md },
        ]}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.eu.star}
            progressViewOffset={HEADER_MAX_HEIGHT}
          />
        }
      >
        {/* Stats row */}
        <View style={styles.statsRow}>
          <StatCard icon="people-outline" value={profile?.friendCount ?? 0} label="Amigos" />
          <StatCard icon="calendar-outline" value={profile?.eventCount ?? 0} label="Eventos" />
          <StatCard
            icon="camera-outline"
            value={photos.length}
            label="Fotos"
            onPress={() => navigation.navigate("EditPhotos")}
          />
        </View>

        {/* Bio */}
        {profile?.bio ? (
          <GlassCard variant="surface" style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </GlassCard>
        ) : null}

        {/* University info */}
        {(profile?.homeUniversity || profile?.hostUniversity) && (
          <GlassCard variant="surface" style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="school-outline" size={16} color={colors.eu.star} />
                <Text style={styles.sectionTitle}>Universidad</Text>
              </View>
            </View>
            {profile?.homeUniversity && (
              <View style={styles.uniRow}>
                <Text style={styles.uniLabel}>Origen</Text>
                <Text style={styles.uniName}>
                  {profile.homeUniversity.name}
                </Text>
                <Text style={styles.uniLocation}>
                  {profile.homeUniversity.city}, {profile.homeUniversity.country}
                </Text>
              </View>
            )}
            {profile?.homeUniversity && profile?.hostUniversity && (
              <Divider style={styles.divider} />
            )}
            {profile?.hostUniversity && (
              <View style={styles.uniRow}>
                <Text style={styles.uniLabel}>Destino</Text>
                <Text style={styles.uniName}>
                  {profile.hostUniversity.name}
                </Text>
                <Text style={styles.uniLocation}>
                  {profile.hostUniversity.city}, {profile.hostUniversity.country}
                </Text>
              </View>
            )}
            {profile?.mobilityStartDate && profile?.mobilityEndDate && (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.mobilityDates}>
                  {profile.mobilityStartDate} → {profile.mobilityEndDate}
                </Text>
              </>
            )}
          </GlassCard>
        )}

        {/* Interests */}
        <GlassCard variant="surface" style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="sparkles-outline" size={16} color={colors.eu.star} />
              <Text style={styles.sectionTitle}>Intereses</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("Interests")}>
              <Text style={styles.editLink}>Editar</Text>
            </Pressable>
          </View>
          {profile?.interests && profile.interests.length > 0 ? (
            <View style={styles.chipGrid}>
              {profile.interests.map((interest) => (
                <Chip
                  key={interest.id}
                  label={`${interest.icon ?? ""} ${interest.name}`.trim()}
                  selected
                />
              ))}
            </View>
          ) : (
            <Pressable onPress={() => navigation.navigate("Interests")}>
              <Text style={styles.emptyText}>
                Toca para añadir tus intereses
              </Text>
            </Pressable>
          )}
        </GlassCard>

        {/* Languages */}
        <GlassCard variant="surface" style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="globe-outline" size={16} color={colors.eu.star} />
              <Text style={styles.sectionTitle}>Idiomas</Text>
            </View>
            <Pressable onPress={() => navigation.navigate("Languages")}>
              <Text style={styles.editLink}>Editar</Text>
            </Pressable>
          </View>
          {profile?.languages && profile.languages.length > 0 ? (
            <View style={styles.langList}>
              {profile.languages.map((lang) => (
                <View key={lang.id} style={styles.langRow}>
                  <Text style={styles.langName}>{lang.name}</Text>
                  <View style={styles.langBadge}>
                    <Text style={styles.langLevel}>{lang.proficiencyLevel}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Pressable onPress={() => navigation.navigate("Languages")}>
              <Text style={styles.emptyText}>
                Toca para añadir tus idiomas
              </Text>
            </Pressable>
          )}
        </GlassCard>

        {/* Photos gallery */}
        {photos.length > 0 && (
          <GlassCard variant="surface" style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="images-outline" size={16} color={colors.eu.star} />
                <Text style={styles.sectionTitle}>Fotos</Text>
              </View>
              <Pressable onPress={() => navigation.navigate("EditPhotos")}>
                <Text style={styles.editLink}>Ver todas</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoScroll}
            >
              {photos.map((photo) => (
                <Image
                  key={photo.id}
                  source={{ uri: photo.photoUrl }}
                  style={styles.photoThumb}
                />
              ))}
            </ScrollView>
          </GlassCard>
        )}

        <View style={{ height: spacing.xxxl }} />
      </Animated.ScrollView>
    </View>
  );
}

// ── StatCard component ──────────────────────────────

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function StatCard({
  icon,
  value,
  label,
  onPress,
}: {
  icon: IoniconsName;
  value: number;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.statCard}>
      <GlassCard variant="elevated" padding="sm" style={styles.statInner}>
        <Ionicons name={icon} size={22} color={colors.eu.star} style={{ marginBottom: spacing.xxs }} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </GlassCard>
    </Pressable>
  );
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarContainer: {
    marginBottom: spacing.sm,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: "rgba(255, 204, 0, 0.5)",
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 204, 0, 0.1)",
    borderWidth: 2.5,
    borderColor: "rgba(255, 204, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: typography.families.heading,
    fontSize: 34,
    color: colors.eu.star,
  },
  headerInfo: {
    alignItems: "center",
  },
  displayName: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  editButton: {
    position: "absolute",
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  editButtonText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  // Stats — modern design
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statCard: { flex: 1 },
  statInner: { alignItems: "center" },
  statValue: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
  // Sections
  section: { marginBottom: spacing.md },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  editLink: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
  },
  // Bio
  bioText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    lineHeight: typography.sizes.body.lineHeight,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // University
  uniRow: { marginBottom: spacing.xs },
  uniLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.small.fontSize,
    color: colors.eu.star,
    marginBottom: spacing.xxs,
  },
  uniName: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.primary,
  },
  uniLocation: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.secondary,
  },
  divider: { marginVertical: spacing.sm },
  mobilityDates: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
  },
  // Chips
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  emptyText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.disabled,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
  // Languages
  langList: { gap: spacing.sm, marginTop: spacing.xs },
  langRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  langName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  langBadge: {
    backgroundColor: "rgba(255,204,0,0.12)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,204,0,0.25)",
  },
  langLevel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.small.fontSize,
    color: colors.eu.star,
    textTransform: "capitalize",
  },
  // Photos
  photoScroll: { gap: spacing.sm, paddingVertical: spacing.xs },
  photoThumb: {
    width: 100,
    height: 100,
    borderRadius: radii.md,
  },
});
