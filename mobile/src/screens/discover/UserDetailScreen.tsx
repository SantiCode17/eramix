import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RouteProp } from "@react-navigation/native";
import { profileApi } from "@/api";
import { friendRequestsApi } from "@/api/discoverService";
import { handleError } from "@/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import { Header, GlassCard, GlassButton, LoadingSpinner, Chip } from "@/design-system";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import type { User, DiscoverStackParamList } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavProp = StackNavigationProp<DiscoverStackParamList, "UserDetail">;
type RouteP = RouteProp<DiscoverStackParamList, "UserDetail">;

export default function UserDetailScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteP>();
  const { userId } = route.params;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await profileApi.getProfile(userId);
      setUser(data);
    } catch (e) {
      handleError(e, "UserDetail.getProfile");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    setSending(true);
    try {
      await friendRequestsApi.send(userId);
      setRequestSent(true);
    } catch (e) {
      handleError(e, "UserDetail.sendFriendRequest");
    } finally {
      setSending(false);
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.background.start, colors.background.end]}
          style={StyleSheet.absoluteFill}
        />
        <Header title="Perfil" onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          <LoadingSpinner size={48} />
        </View>
      </View>
    );
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const destination = [user.destinationCity, user.destinationCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />
      <Header title="" onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero photo */}
        <View style={styles.heroContainer}>
          {user.profilePhotoUrl ? (
            <Image
              source={{ uri: user.profilePhotoUrl }}
              style={styles.heroPhoto}
            />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroInitial}>
                {user.firstName[0]?.toUpperCase()}
              </Text>
            </View>
          )}
          <LinearGradient
            colors={["transparent", colors.background.end]}
            style={styles.heroGradient}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroName}>{fullName}</Text>
            {destination ? (
              <Text style={styles.heroDestination}><Ionicons name="location-outline" size={14} color={colors.eu.star} /> {destination}</Text>
            ) : null}
          </View>
        </View>

        {/* Bio */}
        {user.bio ? (
          <GlassCard variant="surface" padding="md" style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre mí</Text>
            <Text style={styles.bioText}>{user.bio}</Text>
          </GlassCard>
        ) : null}

        {/* University */}
        {(user.homeUniversity || user.hostUniversity) ? (
          <GlassCard variant="surface" padding="md" style={styles.section}>
            <Text style={styles.sectionTitle}>Universidad</Text>
            {user.homeUniversity ? (
              <View style={styles.uniRow}>
                <Ionicons name="home-outline" size={18} color={colors.eu.star} />
                <View>
                  <Text style={styles.uniName}>{user.homeUniversity.name}</Text>
                  <Text style={styles.uniLocation}>
                    {user.homeUniversity.city}, {user.homeUniversity.country}
                  </Text>
                </View>
              </View>
            ) : null}
            {user.hostUniversity ? (
              <View style={[styles.uniRow, { marginTop: spacing.sm }]}>
                <Ionicons name="airplane-outline" size={18} color={colors.eu.star} />
                <View>
                  <Text style={styles.uniName}>{user.hostUniversity.name}</Text>
                  <Text style={styles.uniLocation}>
                    {user.hostUniversity.city}, {user.hostUniversity.country}
                  </Text>
                </View>
              </View>
            ) : null}
          </GlassCard>
        ) : null}

        {/* Interests */}
        {user.interests && user.interests.length > 0 ? (
          <GlassCard variant="surface" padding="md" style={styles.section}>
            <Text style={styles.sectionTitle}>Intereses</Text>
            <View style={styles.chipsGrid}>
              {user.interests.map((interest) => (
                <Chip
                  key={interest.id}
                  label={`${interest.name}`}
                  selected
                  disabled
                />
              ))}
            </View>
          </GlassCard>
        ) : null}

        {/* Languages */}
        {user.languages && user.languages.length > 0 ? (
          <GlassCard variant="surface" padding="md" style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomas</Text>
            <View style={styles.chipsGrid}>
              {user.languages.map((lang) => (
                <View key={lang.id} style={styles.langChip}>
                  <Text style={styles.langName}>{lang.name}</Text>
                  <Text style={styles.langLevel}>{lang.proficiencyLevel}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        ) : null}

        {/* Photos gallery */}
        {user.photos && user.photos.length > 0 ? (
          <GlassCard variant="surface" padding="md" style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosRow}
            >
              {user.photos.map((photo) => (
                <Image
                  key={photo.id}
                  source={{ uri: photo.photoUrl }}
                  style={styles.galleryPhoto}
                />
              ))}
            </ScrollView>
          </GlassCard>
        ) : null}

        {/* Connect button */}
        <View style={styles.connectSection}>
          <GlassButton
            title={requestSent ? "Solicitud enviada ✓" : "Conectar"}
            variant={requestSent ? "secondary" : "primary"}
            size="lg"
            onPress={handleSendRequest}
            disabled={requestSent}
            loading={sending}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  // Hero
  heroContainer: {
    height: SCREEN_WIDTH * 0.9,
    position: "relative",
  },
  heroPhoto: {
    width: "100%",
    height: "100%",
  },
  heroPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.eu.deep,
    alignItems: "center",
    justifyContent: "center",
  },
  heroInitial: {
    fontFamily: typography.families.heading,
    fontSize: 80,
    color: colors.eu.star,
  },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  heroName: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h1.fontSize,
    color: colors.text.primary,
  },
  heroDestination: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Sections
  section: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bioText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    lineHeight: typography.sizes.body.lineHeight,
    color: colors.text.primary,
  },
  // University
  uniRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  uniEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  uniName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  uniLocation: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  // Chips
  chipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  langChip: {
    backgroundColor: "rgba(0, 51, 153, 0.2)",
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: "rgba(0, 51, 153, 0.4)",
  },
  langName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.light,
  },
  langLevel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  // Photos
  photosRow: {
    gap: spacing.sm,
  },
  galleryPhoto: {
    width: 140,
    height: 180,
    borderRadius: radii.md,
  },
  // Connect
  connectSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
});
