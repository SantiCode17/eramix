import React, { useEffect, useState, useCallback, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { searchApi } from "@/api";
import { handleError } from "@/utils/errorHandler";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import { useLocationStore } from "@/store/useLocationStore";
import { Ionicons } from "@expo/vector-icons";
import { GlassButton } from "@/design-system";
import { colors, typography, spacing, radii, shadows, DS } from "@/design-system/tokens";
import { pluralize } from "@/utils/pluralize";
import type { NearbyUserResponse, DiscoverStackParamList } from "@/types";
// import { mapPinPersonaje } from "@/assets/images";

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
  const insets = useSafeAreaInsets();
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
  const mapRef = React.useRef<MapView>(null);

  // Hide the parent tab bar when this screen is focused
  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      parent?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

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
    } catch (e) {
      handleError(e, "NearbyMap.findNearby");
      // Fallback mock markers para modo offline
      setNearbyUsers([
        { id: 9001, firstName: "Luca", lastName: "Rossi", latitude: latitude + 0.008, longitude: longitude + 0.005, distanceKm: 1.2, profilePhotoUrl: null, university: "Politecnico di Milano" },
        { id: 9002, firstName: "Marie", lastName: "Dupont", latitude: latitude - 0.006, longitude: longitude + 0.01, distanceKm: 2.5, profilePhotoUrl: null, university: "Sorbonne" },
        { id: 9003, firstName: "Hans", lastName: "Müller", latitude: latitude + 0.012, longitude: longitude - 0.007, distanceKm: 3.1, profilePhotoUrl: null, university: "TU München" },
        { id: 9004, firstName: "Sofia", lastName: "García", latitude: latitude - 0.003, longitude: longitude - 0.012, distanceKm: 0.8, profilePhotoUrl: null, university: "UCM" },
        { id: 9005, firstName: "Katya", lastName: "Ivanova", latitude: latitude + 0.015, longitude: longitude + 0.002, distanceKm: 4.0, profilePhotoUrl: null, university: "MSU" },
        { id: 9006, firstName: "Pierre", lastName: "Martin", latitude: latitude - 0.01, longitude: longitude + 0.015, distanceKm: 5.3, profilePhotoUrl: null, university: "Sciences Po" },
      ] as unknown as NearbyUserResponse[]);
    } finally {
      setLoadingUsers(false);
    }
  }, [latitude, longitude, radiusKm]);

  // No location permission
  if (!latitude || !longitude) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[DS.background, "#0E1A35"]}
          style={StyleSheet.absoluteFill}
        />
        {/* Floating glass header */}
        <View style={[styles.floatingHeader, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.floatingHeaderTitle}>Mapa cercano</Text>
        </View>
        <View style={styles.centered}>
          {locationLoading ? (
            <ActivityIndicator size="large" color={colors.eu.star} />
          ) : (
            <>
              <Ionicons name="location-outline" size={40} color={colors.eu.star} />
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
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
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
                  source={{ uri: resolveMediaUrl(user.profilePhotoUrl) }}
                  style={styles.markerImage}
                />
              ) : (
                <View style={styles.markerPinImage}>
                  <Ionicons name="person" size={16} color="rgba(255,255,255,0.6)" />
                </View>
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating glass header */}
      <View style={[styles.floatingHeader, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.floatingHeaderTitle}>Mapa cercano</Text>
      </View>

      {/* Radius selector — floating over map */}
      <View style={[styles.radiusBar, { top: insets.top + 60 }]}>
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

      {/* Loading indicator — top right */}
      {loadingUsers ? (
        <View style={[styles.loadingOverlay, { top: insets.top + 60 }]}>
          <ActivityIndicator size="small" color={colors.eu.star} />
        </View>
      ) : null}

      {/* My location FAB */}
      <Pressable
        style={[styles.myLocationFab, { bottom: insets.bottom + 80 }]}
        onPress={() => {
          getCurrentLocation();
          if (latitude && longitude && mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: radiusKm / 50,
              longitudeDelta: radiusKm / 50,
            }, 500);
          }
        }}
      >
        <LinearGradient
          colors={[colors.eu.star, "#FF6D3F"]}
          style={styles.myLocationFabGrad}
        >
          <Ionicons name="navigate" size={20} color="#06081A" />
        </LinearGradient>
      </Pressable>

      {/* Bottom glass panel — count + selected user */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.countBadge}>
          <Ionicons name="people-outline" size={14} color={colors.eu.star} />
          <Text style={styles.countText}>
            {pluralize(nearbyUsers.length, "estudiante cerca", "estudiantes cerca")}
          </Text>
        </View>

        {/* Selected user card */}
        {selectedUser && (
          <Pressable
            style={styles.selectedCard}
            onPress={() =>
              navigation.navigate("UserDetail", { userId: selectedUser.id })
            }
          >
            <View style={styles.selectedLeft}>
              {selectedUser.profilePhotoUrl ? (
                <Image
                  source={{ uri: resolveMediaUrl(selectedUser.profilePhotoUrl) }}
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
                  <Ionicons name="location-outline" size={13} color={colors.eu.star} /> {selectedUser.distanceKm.toFixed(1)} km
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
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.background,
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
  // Floating header
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: "rgba(4,6,26,0.85)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    zIndex: 10,
  },
  floatingHeaderTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Markers
  markerContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.eu.star,
    overflow: "hidden",
  },
  markerImage: {
    width: "100%",
    height: "100%",
  },
  markerPinImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(19,34,64,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Radius bar
  radiusBar: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
    zIndex: 5,
  },
  radiusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: "rgba(4,6,26,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  radiusChipActive: {
    backgroundColor: "rgba(255,204,0,0.22)",
    borderColor: colors.eu.star,
  },
  radiusText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  radiusTextActive: {
    color: colors.eu.star,
  },
  // Loading — top right
  loadingOverlay: {
    position: "absolute",
    right: spacing.sm,
    backgroundColor: "rgba(4,6,26,0.88)",
    borderRadius: radii.full,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    zIndex: 5,
  },
  // My location FAB
  myLocationFab: {
    position: "absolute",
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    zIndex: 5,
  },
  myLocationFabGrad: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  // Bottom panel
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(4,6,26,0.92)",
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.12)",
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  countText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.eu.star,
  },
  // Selected card
  selectedCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
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
    backgroundColor: "rgba(19,34,64,0.55)",
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
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  closeSelected: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  closeText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});
