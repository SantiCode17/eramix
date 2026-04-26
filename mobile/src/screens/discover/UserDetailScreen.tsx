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
import Animated, { FadeInDown } from "react-native-reanimated";
import { profileApi } from "@/api";
import { friendRequestsApi } from "@/api/discoverService";
import { handleError } from "@/utils/errorHandler";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import { Ionicons } from "@expo/vector-icons";
import { Header, GlassCard, GlassButton, LoadingSpinner, Chip } from "@/design-system";
import { colors, typography, spacing, radii, shadows, DS } from "@/design-system/tokens";
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
          colors={[DS.background, "#0E1A35", "#0F1535"]}
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
        colors={[DS.background, "#0E1A35", "#0F1535"]}
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
              source={{ uri: resolveMediaUrl(user.profilePhotoUrl) }}
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
            colors={["transparent", "#0D1238"]}
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
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassCard variant="surface" padding="md" style={styles.section}>
              <Text style={styles.sectionTitle}>Sobre mí</Text>
              <Text style={styles.bioText}>{user.bio}</Text>
            </GlassCard>
          </Animated.View>
        ) : null}

        {/* University */}
        {(user.homeUniversity || user.hostUniversity) ? (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassCard variant="surface" padding="md" style={styles.section}>
              <Text style={styles.sectionTitle}>Universidad</Text>
              {user.homeUniversity ? (
                <View style={styles.uniRow}>
                  <View style={styles.uniIconWrap}>
                    <Ionicons name="home-outline" size={16} color={colors.eu.star} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.uniName}>{user.homeUniversity.name}</Text>
                    <Text style={styles.uniLocation}>
                      {user.homeUniversity.city}, {user.homeUniversity.country}
                    </Text>
                  </View>
                </View>
              ) : null}
              {user.hostUniversity ? (
                <View style={[styles.uniRow, { marginTop: spacing.sm }]}>
                  <View style={styles.uniIconWrap}>
                    <Ionicons name="airplane-outline" size={16} color={colors.eu.star} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.uniName}>{user.hostUniversity.name}</Text>
                    <Text style={styles.uniLocation}>
                      {user.hostUniversity.city}, {user.hostUniversity.country}
                    </Text>
                  </View>
                </View>
              ) : null}
            </GlassCard>
          </Animated.View>
        ) : null}

        {/* Interests */}
        {user.interests && user.interests.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(300).springify()}>
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
          </Animated.View>
        ) : null}

        {/* Languages */}
        {user.languages && user.languages.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(400).springify()}>
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
          </Animated.View>
        ) : null}

        {/* Photos gallery */}
        {user.photos && user.photos.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(500).springify()}>
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
                    source={{ uri: resolveMediaUrl(photo.photoUrl) }}
                    style={styles.galleryPhoto}
                  />
                ))}
              </ScrollView>
            </GlassCard>
          </Animated.View>
        ) : null}

        {/* Connect button */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.connectSection}>
          <GlassButton
            title={requestSent ? "Solicitud enviada ✓" : "Conectar"}
            variant={requestSent ? "secondary" : "primary"}
            size="lg"
            onPress={handleSendRequest}
            disabled={requestSent}
            loading={sending}
          />
        </Animated.View>
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
    backgroundColor: "rgba(19,34,64,0.55)",
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
    gap: spacing.sm,
  },
  uniIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(19,34,64,0.55)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
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
    backgroundColor: "rgba(19,34,64,0.45)",
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(19,34,64,0.70)",
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
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
  },
  // Connect
  connectSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
});
