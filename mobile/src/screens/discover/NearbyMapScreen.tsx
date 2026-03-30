import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { searchApi } from "@/api";
import { useLocationStore } from "@/store/useLocationStore";
import { Header, GlassButton } from "@/design-system";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import type { NearbyUserResponse, DiscoverStackParamList } from "@/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavProp = StackNavigationProp<DiscoverStackParamList, "NearbyMap">;

// Dark map style
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1A1A2E" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a9a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1A1A2E" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2a4e" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#003399" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#252540" }],
  },
];

export default function NearbyMapScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();
  const {
    latitude,
    longitude,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
    requestPermission,
    permissionStatus,
  } = useLocationStore();

  const [nearbyUsers, setNearbyUsers] = useState<NearbyUserResponse[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<NearbyUserResponse | null>(
    null,
  );
  const [radiusKm, setRadiusKm] = useState(50);

  useEffect(() => {
    initLocation();
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearby();
    }
  }, [latitude, longitude, radiusKm]);

  const initLocation = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      await getCurrentLocation();
    }
  }, [requestPermission, getCurrentLocation]);

  const fetchNearby = useCallback(async () => {
    if (!latitude || !longitude) return;
    setLoadingUsers(true);
    try {
      const users = await searchApi.findNearby(latitude, longitude, radiusKm);
      setNearbyUsers(users);
    } catch {
      // silent
    } finally {
      setLoadingUsers(false);
    }
  }, [latitude, longitude, radiusKm]);

  // No location permission
  if (!latitude || !longitude) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.background.start, colors.background.end]}
          style={StyleSheet.absoluteFill}
        />
        <Header title="Mapa cercano" onBack={() => navigation.goBack()} />
        <View style={styles.centered}>
          {locationLoading ? (
            <ActivityIndicator size="large" color={colors.eu.star} />
          ) : (
            <>
              <Text style={styles.permIcon}>📍</Text>
              <Text style={styles.permTitle}>Ubicación necesaria</Text>
              <Text style={styles.permText}>
                Activa la ubicación para ver estudiantes Erasmus cerca de ti
              </Text>
              <GlassButton
                title="Activar ubicación"
                variant="primary"
                onPress={initLocation}
              />
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />
      <Header title="Mapa cercano" onBack={() => navigation.goBack()} />

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          customMapStyle={DARK_MAP_STYLE}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: radiusKm / 50,
            longitudeDelta: radiusKm / 50,
          }}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {nearbyUsers.map((user) => (
            <Marker
              key={user.id}
              coordinate={{
                // Fuzzy the location slightly for privacy
                latitude: latitude + (user.distanceKm / 111) * (Math.random() - 0.5),
                longitude:
                  longitude +
                  (user.distanceKm / (111 * Math.cos((latitude * Math.PI) / 180))) *
                    (Math.random() - 0.5),
              }}
              onPress={() => setSelectedUser(user)}
            >
              <View style={styles.markerContainer}>
                {user.profilePhotoUrl ? (
                  <Image
                    source={{ uri: user.profilePhotoUrl }}
                    style={styles.markerImage}
                  />
                ) : (
                  <View style={styles.markerPlaceholder}>
                    <Text style={styles.markerInitial}>
                      {user.firstName[0]}
                    </Text>
                  </View>
                )}
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Radius selector */}
        <View style={styles.radiusBar}>
          {[10, 25, 50, 100].map((km) => (
            <Pressable
              key={km}
              onPress={() => setRadiusKm(km)}
              style={[
                styles.radiusChip,
                radiusKm === km && styles.radiusChipActive,
              ]}
            >
              <Text
                style={[
                  styles.radiusText,
                  radiusKm === km && styles.radiusTextActive,
                ]}
              >
                {km} km
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Loading indicator */}
        {loadingUsers ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.eu.star} />
          </View>
        ) : null}

        {/* Count badge */}
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {nearbyUsers.length} estudiante{nearbyUsers.length !== 1 ? "s" : ""}{" "}
            cerca
          </Text>
        </View>
      </View>

      {/* Selected user card */}
      {selectedUser ? (
        <Pressable
          style={styles.selectedCard}
          onPress={() =>
            navigation.navigate("UserDetail", { userId: selectedUser.id })
          }
        >
          <View style={styles.selectedLeft}>
            {selectedUser.profilePhotoUrl ? (
              <Image
                source={{ uri: selectedUser.profilePhotoUrl }}
                style={styles.selectedPhoto}
              />
            ) : (
              <View style={styles.selectedPhotoPlaceholder}>
                <Text style={styles.selectedInitial}>
                  {selectedUser.firstName[0]}
                </Text>
              </View>
            )}
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedName} numberOfLines={1}>
                {selectedUser.firstName} {selectedUser.lastName}
              </Text>
              <Text style={styles.selectedDistance}>
                📍 {selectedUser.distanceKm.toFixed(1)} km •{" "}
                {[selectedUser.destinationCity, selectedUser.destinationCountry]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.closeSelected}
            onPress={() => setSelectedUser(null)}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </Pressable>
      ) : null}
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
    padding: spacing.xl,
  },
  permIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  permTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  permText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  // Map
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  // Markers
  markerContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.eu.star,
    overflow: "hidden",
    ...shadows.glassSmall,
  },
  markerImage: {
    width: "100%",
    height: "100%",
  },
  markerPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.eu.deep,
    alignItems: "center",
    justifyContent: "center",
  },
  markerInitial: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    color: colors.eu.star,
  },
  // Radius bar
  radiusBar: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  radiusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: "rgba(26, 26, 46, 0.85)",
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  radiusChipActive: {
    backgroundColor: "rgba(255, 204, 0, 0.2)",
    borderColor: colors.eu.star,
  },
  radiusText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.secondary,
  },
  radiusTextActive: {
    color: colors.eu.star,
  },
  // Loading
  loadingOverlay: {
    position: "absolute",
    top: spacing.xl + 40,
    alignSelf: "center",
    backgroundColor: "rgba(26, 26, 46, 0.85)",
    borderRadius: radii.full,
    padding: spacing.sm,
  },
  // Count
  countBadge: {
    position: "absolute",
    bottom: spacing.md,
    alignSelf: "center",
    backgroundColor: "rgba(26, 26, 46, 0.9)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  countText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.primary,
  },
  // Selected card
  selectedCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(26, 26, 46, 0.95)",
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  selectedLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  selectedPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.eu.deep,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  selectedInitial: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.eu.star,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  selectedDistance: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  closeSelected: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  closeText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});
