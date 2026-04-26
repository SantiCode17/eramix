/**
 * ════════════════════════════════════════════════════
 *  LiveLocationScreen — Real-time Location Sharing
 *  MapView + STOMP WebSocket + Full Backend Integration
 *  European Glass DS
 * ════════════════════════════════════════════════════
 */
import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { useAuthStore } from "@/store";
import { useWebSocket } from "@/hooks/useWebSocket";
import * as locationApi from "@/api/locationService";
import type { LiveLocationResponse } from "@/api/locationService";
import { handleError } from "@/utils/errorHandler";

const { width: SW, height: SH } = Dimensions.get("window");

/* ─── Duration options ─── */
const DURATION_OPTIONS = [
  { label: "15 min", minutes: 15, icon: "time-outline" as const },
  { label: "30 min", minutes: 30, icon: "time-outline" as const },
  { label: "1 hora", minutes: 60, icon: "hourglass-outline" as const },
  { label: "2 horas", minutes: 120, icon: "hourglass-outline" as const },
];

/* ─── Dark map style ─── */
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0D1B2A" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0D1B2A" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4A5568" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1B2838" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1E3A5F" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0A1628" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#111D32" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#111D32" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0F1E30" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1E3A5F" }] },
];

/* ─── Helpers ─── */
const formatCountdown = (totalSec: number): string => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

/* ─── Friend Marker Component ─── */
function FriendMarker({ friend }: { friend: LiveLocationResponse }) {
  return (
    <View style={st.friendMarkerContainer}>
      {friend.profilePhotoUrl ? (
        <Image source={{ uri: friend.profilePhotoUrl }} style={st.friendMarkerPhoto} />
      ) : (
        <View style={[st.friendMarkerPhoto, st.friendMarkerPlaceholder]}>
          <Text style={st.friendMarkerInitial}>
            {friend.firstName?.charAt(0)?.toUpperCase() ?? "?"}
          </Text>
        </View>
      )}
      <View style={st.friendMarkerLabel}>
        <Text style={st.friendMarkerName} numberOfLines={1}>
          {friend.firstName}
        </Text>
      </View>
    </View>
  );
}

/* ═══════════════════════════════════════════ */
export default function LiveLocationScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const mapRef = useRef<MapView>(null);

  // ── Hide tab bar ──
  useLayoutEffect(() => {
    const parent = navigation.getParent?.();
    parent?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      parent?.setOptions({
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(4,6,26,0.92)",
          borderTopWidth: 0,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 0,
          shadowOpacity: 0,
        },
      });
    };
  }, [navigation, insets.bottom]);

  // ── State ──
  const [isSharing, setIsSharing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [remainingSec, setRemainingSec] = useState(0);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [friendLocations, setFriendLocations] = useState<LiveLocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationWatchRef = useRef<Location.LocationSubscription | null>(null);

  // ── Pulse animation ──
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 0 }),
        withTiming(2.5, { duration: 2000, easing: Easing.out(Easing.ease) }),
      ),
      -1,
      false,
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 0 }),
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // ── WebSocket: listen for friend location updates ──
  const { send: wsSend, isConnected } = useWebSocket({
    subscriptions: ["/user/queue/location"],
    onMessage: (_dest, body) => {
      const update = body as LiveLocationResponse;
      setFriendLocations((prev) => {
        if (!update.active) {
          return prev.filter((f) => f.userId !== update.userId);
        }
        const exists = prev.findIndex((f) => f.userId === update.userId);
        if (exists >= 0) {
          const next = [...prev];
          next[exists] = update;
          return next;
        }
        return [...prev, update];
      });
    },
    autoConnect: true,
  });

  // ── Request permission & get initial location ──
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a tu ubicación para esta funcionalidad.",
          [{ text: "OK", onPress: () => navigation.goBack() }],
        );
        setLoading(false);
        return;
      }
      setLocationPermission(true);

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setMyLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLoading(false);
    })();
  }, []);

  // ── Fetch initial data: my status + friend locations ──
  useEffect(() => {
    if (!locationPermission) return;

    (async () => {
      try {
        const [status, friends] = await Promise.all([
          locationApi.getMyStatus(),
          locationApi.getFriendLocations(),
        ]);

        if (status?.active && status.expiresAt) {
          const remaining = Math.max(
            0,
            Math.floor((new Date(status.expiresAt).getTime() - Date.now()) / 1000),
          );
          if (remaining > 0) {
            setIsSharing(true);
            setRemainingSec(remaining);
          }
        }

        setFriendLocations(friends ?? []);
      } catch (e) {
        // Silent — first load
      }
    })();
  }, [locationPermission]);

  // ── Timer countdown ──
  useEffect(() => {
    if (isSharing && remainingSec > 0) {
      timerRef.current = setInterval(() => {
        setRemainingSec((prev) => {
          if (prev <= 1) {
            handleStopSharing();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSharing]);

  // ── Start continuous location watching when sharing ──
  useEffect(() => {
    if (isSharing && locationPermission) {
      (async () => {
        locationWatchRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          (loc) => {
            const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
            setMyLocation(coords);

            // Send update via WebSocket
            wsSend("/app/location.update", {
              latitude: coords.latitude,
              longitude: coords.longitude,
            });
          },
        );
      })();
    }

    return () => {
      if (locationWatchRef.current) {
        locationWatchRef.current.remove();
        locationWatchRef.current = null;
      }
    };
  }, [isSharing, locationPermission]);

  // ── Start sharing ──
  const handleStartSharing = useCallback(async () => {
    if (!myLocation) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await locationApi.startSharing({
        latitude: myLocation.latitude,
        longitude: myLocation.longitude,
        durationMinutes: selectedDuration,
      });
      setIsSharing(true);
      setRemainingSec(selectedDuration * 60);
      setPanelExpanded(false);
    } catch (e) {
      handleError(e, "LiveLocation.startSharing");
      Alert.alert("Error", "No se pudo iniciar el uso compartido de ubicación");
    }
  }, [myLocation, selectedDuration]);

  // ── Stop sharing ──
  const handleStopSharing = useCallback(async () => {
    setIsSharing(false);
    setRemainingSec(0);
    setPanelExpanded(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (locationWatchRef.current) {
      locationWatchRef.current.remove();
      locationWatchRef.current = null;
    }

    try {
      await locationApi.stopSharing();
    } catch (e) {
      // Silent
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  // ── Fit map to show all markers ──
  const fitToMarkers = useCallback(() => {
    if (!mapRef.current || !myLocation) return;
    const coords = [
      myLocation,
      ...friendLocations.map((f) => ({ latitude: f.latitude, longitude: f.longitude })),
    ];
    if (coords.length === 1) {
      mapRef.current.animateToRegion({
        ...coords[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 120, right: 60, bottom: 300, left: 60 },
        animated: true,
      });
    }
  }, [myLocation, friendLocations]);

  useEffect(() => {
    if (myLocation && !loading) {
      setTimeout(fitToMarkers, 500);
    }
  }, [myLocation, loading, friendLocations.length]);

  // ── Loading state ──
  if (loading) {
    return (
      <View style={[st.container, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <LinearGradient colors={[DS.background, "#0E1A35"]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={colors.eu.star} />
        <Text style={st.loadingText}>Obteniendo ubicación...</Text>
      </View>
    );
  }

  /* ═══ Render ═══ */
  return (
    <View style={st.container}>
      {/* ════ FULL-SCREEN MAP ════ */}
      {myLocation && (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          customMapStyle={DARK_MAP_STYLE}
          initialRegion={{
            latitude: myLocation.latitude,
            longitude: myLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          mapPadding={{ top: insets.top + 60, right: 0, bottom: panelExpanded ? 340 : 160, left: 0 }}
        >
          {/* My location marker */}
          <Marker
            coordinate={myLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={st.myMarkerOuter}>
              {isSharing && (
                <Animated.View style={[st.myMarkerPulse, pulseStyle]} />
              )}
              <View style={[st.myMarkerDot, isSharing && st.myMarkerDotSharing]} />
            </View>
          </Marker>

          {/* Accuracy circle */}
          <Circle
            center={myLocation}
            radius={50}
            strokeColor="rgba(0,122,255,0.2)"
            fillColor="rgba(0,122,255,0.05)"
          />

          {/* Friend markers */}
          {friendLocations.map((friend) => (
            <Marker
              key={friend.userId}
              coordinate={{ latitude: friend.latitude, longitude: friend.longitude }}
              anchor={{ x: 0.5, y: 1 }}
            >
              <FriendMarker friend={friend} />
            </Marker>
          ))}
        </MapView>
      )}

      {/* ════ TOP BAR ════ */}
      <Animated.View
        entering={FadeIn.delay(200)}
        style={[st.topBar, { top: insets.top + 8 }]}
      >
        <Pressable onPress={() => navigation.goBack()} style={st.topBtn}>
          <Ionicons name="chevron-back" size={22} color="#FFF" />
        </Pressable>

        <View style={st.topCenter}>
          <Text style={st.topTitle}>Live Location</Text>
          {isConnected && <View style={st.connectedDot} />}
        </View>

        <Pressable onPress={fitToMarkers} style={st.topBtn}>
          <Ionicons name="locate-outline" size={20} color="#FFF" />
        </Pressable>
      </Animated.View>

      {/* ════ SHARING STATUS BADGE ════ */}
      {isSharing && (
        <Animated.View entering={FadeInUp.springify()} style={[st.sharingBadge, { top: insets.top + 64 }]}>
          <View style={st.sharingPulseDot} />
          <Text style={st.sharingBadgeText}>Compartiendo • {formatCountdown(remainingSec)}</Text>
        </Animated.View>
      )}

      {/* ════ FRIEND COUNT BADGE ════ */}
      {friendLocations.length > 0 && (
        <Animated.View entering={FadeIn.delay(300)} style={[st.friendCountBadge, { top: insets.top + (isSharing ? 108 : 64) }]}>
          <Ionicons name="people" size={14} color={colors.eu.star} />
          <Text style={st.friendCountText}>
            {friendLocations.length} amigo{friendLocations.length !== 1 ? "s" : ""} compartiendo
          </Text>
        </Animated.View>
      )}

      {/* ════ BOTTOM PANEL ════ */}
      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        style={[st.bottomPanel, { paddingBottom: insets.bottom + 16 }]}
      >
        {/* Handle */}
        <Pressable onPress={() => setPanelExpanded(!panelExpanded)} style={st.handleArea}>
          <View style={st.handleBar} />
        </Pressable>

        {isSharing ? (
          /* ── SHARING STATE ── */
          <View style={st.sharingControls}>
            <View style={st.sharingInfoRow}>
              <View style={st.sharingTimerCircle}>
                <Text style={st.sharingTimerText}>{formatCountdown(remainingSec)}</Text>
                <Text style={st.sharingTimerLabel}>restante</Text>
              </View>
              <View style={st.sharingInfoText}>
                <Text style={st.sharingInfoTitle}>📍 Ubicación activa</Text>
                <Text style={st.sharingInfoSubtitle}>
                  Tus amigos pueden ver dónde estás
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleStopSharing}
              style={({ pressed }) => [
                st.stopButton,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <Ionicons name="stop-circle" size={20} color="#FFF" />
              <Text style={st.stopButtonText}>Dejar de compartir</Text>
            </Pressable>
          </View>
        ) : (
          /* ── IDLE STATE ── */
          <>
            {panelExpanded && (
              <Animated.View entering={FadeIn}>
                <Text style={st.panelTitle}>📍 Compartir ubicación</Text>
                <Text style={st.panelSubtitle}>
                  Solo tus amigos podrán ver dónde estás. Se detiene automáticamente.
                </Text>

                {/* Duration chips */}
                <Text style={st.sectionLabel}>DURACIÓN</Text>
                <View style={st.chipRow}>
                  {DURATION_OPTIONS.map((opt) => {
                    const active = selectedDuration === opt.minutes;
                    return (
                      <Pressable
                        key={opt.minutes}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setSelectedDuration(opt.minutes);
                        }}
                        style={[st.chip, active && st.chipActive]}
                      >
                        {active ? (
                          <LinearGradient
                            colors={[colors.eu.star, colors.eu.orange]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={st.chipGrad}
                          >
                            <Ionicons name={opt.icon} size={14} color="#000" />
                            <Text style={st.chipTextActive}>{opt.label}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={st.chipInner}>
                            <Ionicons name={opt.icon} size={14} color={colors.text.secondary} />
                            <Text style={st.chipText}>{opt.label}</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </Animated.View>
            )}

            {/* Share button */}
            <Pressable
              onPress={handleStartSharing}
              style={({ pressed }) => [
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={[colors.eu.star, colors.eu.orange]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={st.shareButton}
              >
                <Ionicons name="radio-outline" size={20} color="#000" />
                <Text style={st.shareButtonText}>Compartir Ubicación</Text>
              </LinearGradient>
            </Pressable>
          </>
        )}
      </Animated.View>
    </View>
  );
}

/* ═══ Styles — European Glass ═══ */
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.background },

  loadingText: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  /* ── Top bar ── */
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  topBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(13,27,42,0.85)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  topCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(13,27,42,0.85)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  topTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: colors.text.primary,
  },
  connectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00D68F",
  },

  /* ── Badges ── */
  sharingBadge: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(13,27,42,0.90)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "rgba(255,215,0,0.30)",
    zIndex: 10,
  },
  sharingPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
  },
  sharingBadgeText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.eu.star,
  },
  friendCountBadge: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(13,27,42,0.85)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.10)",
    zIndex: 10,
  },
  friendCountText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
  },

  /* ── My marker ── */
  myMarkerOuter: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  myMarkerPulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,122,255,0.3)",
  },
  myMarkerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  myMarkerDotSharing: {
    backgroundColor: colors.eu.star,
    borderColor: "#FFFFFF",
  },

  /* ── Friend marker ── */
  friendMarkerContainer: { alignItems: "center" },
  friendMarkerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.eu.star,
  },
  friendMarkerPlaceholder: {
    backgroundColor: "rgba(13,27,42,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  friendMarkerInitial: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.eu.star,
  },
  friendMarkerLabel: {
    marginTop: 4,
    backgroundColor: "rgba(13,27,42,0.90)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255,215,0,0.25)",
  },
  friendMarkerName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: "#FFF",
    maxWidth: 80,
  },

  /* ── Bottom panel ── */
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(13,27,42,0.95)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 0.5,
    borderColor: "rgba(255,255,255,0.10)",
  },
  handleArea: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.20)",
  },

  /* ── Idle panel ── */
  panelTitle: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: 4,
  },
  panelSubtitle: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  sectionLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: spacing.lg,
  },
  chip: {
    flex: 1,
    borderRadius: radii.full,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  chipActive: { borderWidth: 0 },
  chipGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: radii.full,
  },
  chipInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
  },
  chipText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.secondary,
  },
  chipTextActive: {
    fontFamily: typography.families.subheading,
    fontSize: 13,
    color: "#000",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: radii.lg,
    marginBottom: 4,
  },
  shareButtonText: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: "#000",
  },

  /* ── Sharing controls ── */
  sharingControls: { gap: spacing.md },
  sharingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  sharingTimerCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.eu.star,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,215,0,0.06)",
  },
  sharingTimerText: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    color: colors.eu.star,
  },
  sharingTimerLabel: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
    marginTop: -2,
  },
  sharingInfoText: { flex: 1 },
  sharingInfoTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.text.primary,
  },
  sharingInfoSubtitle: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: "rgba(229,62,62,0.15)",
    borderWidth: 1,
    borderColor: "rgba(229,62,62,0.30)",
    marginBottom: 4,
  },
  stopButtonText: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: "#E53E3E",
  },
});
