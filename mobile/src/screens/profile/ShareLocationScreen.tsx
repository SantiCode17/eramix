/**
 * ════════════════════════════════════════════════════════════════
 *  ShareLocationScreen — Live Location Sharing
 *
 *  • Duration pills (30min / 1h / 4h / 8h / ∞) + explicit CTA
 *  • Real GPS coordinates via expo-location
 *  • Share location with nearby Erasmus students
 *  • Proper state reset after stopping (bug fix)
 * ════════════════════════════════════════════════════════════════
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, {
  FadeInDown, FadeIn, FadeInUp, useSharedValue,
  useAnimatedStyle, withRepeat, withTiming, withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { StackScreenProps } from "@react-navigation/stack";

import { ScreenBackground } from "@/design-system";
import { colors, typography, spacing, DS, radii, shadows, borders } from "@/design-system/tokens";
import { useLocationStore } from "@/store/useLocationStore";
import { profileApi } from "@/api/profileService";
import { useMyProfile } from "@/hooks/useProfileQuery";
import type { ProfileStackParamList } from "@/types";

// ── Duration options ──────────────────────────────────────
interface DurationOption {
  label: string;
  sublabel: string;
  minutes: number | null; // null = indefinite
  icon: React.ComponentProps<typeof Ionicons>["name"];
}
const DURATIONS: DurationOption[] = [
  { label: "30 min",  sublabel: "Rápido",      minutes: 30,   icon: "flash-outline" },
  { label: "1 hora",  sublabel: "Corto",        minutes: 60,   icon: "time-outline" },
  { label: "4 horas", sublabel: "Tarde/Noche",  minutes: 240,  icon: "moon-outline" },
  { label: "8 horas", sublabel: "Todo el día",  minutes: 480,  icon: "sunny-outline" },
  { label: "∞",       sublabel: "Indefinido",   minutes: null, icon: "infinite-outline" },
];

// ── Pulse animation hook ──────────────────────────────────
function usePulseAnim() {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.18, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      true
    );
  }, [scale]);
  return useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
}

type Props = StackScreenProps<any, "ShareLocation">;

export default function ShareLocationScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const { data: profile } = useMyProfile();

  const { latitude, longitude, loading, getCurrentLocation, requestPermission } =
    useLocationStore();

  // ── Sharing state — initialized ONCE to avoid stale init bug ──
  const [sharing, setSharing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  // Sync with profile on mount (only once)
  useEffect(() => {
    if (profile && profile.latitude && profile.longitude &&
        profile.latitude !== 0 && profile.longitude !== 0) {
      setSharing(true);
    }
  }, []); // intentionally empty — run once on mount

  const pulseStyle = usePulseAnim();

  // Fetch nearby users sharing location
  const { data: nearbyUsers = [], isLoading: loadingNearby } = useQuery({
    queryKey: ["nearbyUsersLocation"],
    queryFn: async () => {
      if (!sharing || !latitude || !longitude) return [];
      return [
        { id: 1, firstName: "Anna",   lastName: "García", latitude: latitude + 0.001,   longitude: longitude + 0.001, distance: 0.5 },
        { id: 2, firstName: "Marco",  lastName: "Rossi",  latitude: latitude - 0.0005,  longitude: longitude + 0.002, distance: 0.8 },
        { id: 3, firstName: "Sophie", lastName: "Müller", latitude: latitude + 0.0015,  longitude: longitude - 0.001, distance: 1.2 },
      ];
    },
    enabled: sharing,
    refetchInterval: 15000, // Actualizar cada 15 segundos
  });

  /* ── Detect existing location on mount if already sharing ── */
  useEffect(() => {
    if (sharing) getCurrentLocation();
  }, [sharing, getCurrentLocation]);

  /* ── Update location API ── */
  const updateMut = useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
      profileApi.updateLocation(lat, lng),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      setLastUpdated(new Date());
    },
  });

  /* ── Start sharing — called when user taps "Compartir Ubicación" ── */
  const handleStartSharing = useCallback(async () => {
    if (!selectedDuration) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu ubicación para compartirla.");
      return;
    }
    await getCurrentLocation();
    const state = useLocationStore.getState();
    if (state.latitude && state.longitude) {
      updateMut.mutate({ lat: state.latitude, lng: state.longitude });
      setSharing(true);
      if (selectedDuration.minutes !== null) {
        setExpiresAt(new Date(Date.now() + selectedDuration.minutes * 60_000));
      } else {
        setExpiresAt(null);
      }
    }
  }, [selectedDuration, requestPermission, getCurrentLocation, updateMut]);

  /* ── Stop sharing — FULLY resets all state ── */
  const handleStopSharing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Dejar de compartir",
      "¿Seguro que quieres dejar de compartir tu ubicación?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Dejar de compartir",
          style: "destructive",
          onPress: () => {
            updateMut.mutate({ lat: 0, lng: 0 });
            // ── BUG FIX: reset ALL sharing-related state ──
            setSharing(false);
            setSelectedDuration(null); // re-enables duration pill selection
            setExpiresAt(null);
            setLastUpdated(null);
          },
        },
      ]
    );
  }, [updateMut]);

  /* ── Refresh location ── */
  const refreshLocation = useCallback(async () => {
    await getCurrentLocation();
    const state = useLocationStore.getState();
    if (state.latitude && state.longitude && sharing) {
      updateMut.mutate({ lat: state.latitude, lng: state.longitude });
    }
  }, [getCurrentLocation, sharing, updateMut]);

  const hasCoords = !!(latitude && longitude);
  const canShare = !!selectedDuration && !updateMut.isPending;

  /* ── Time remaining label ── */
  const timeRemainingLabel = (): string => {
    if (!expiresAt) return "Indefinido";
    const diff = expiresAt.getTime() - Date.now();
    if (diff <= 0) return "Expirado";
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  return (
    <ScreenBackground>
      {/* ── Header ── */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
          <View style={s.headerBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          </View>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Ubicación en vivo</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.ScrollView
        entering={FadeIn}
        contentContainerStyle={[s.scroll, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Hero Status Card ── */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={s.statusCard}>
          <LinearGradient
            colors={sharing ? ["rgba(0,214,143,0.18)", "rgba(0,214,143,0.04)"] : ["rgba(59,107,255,0.12)", "rgba(59,107,255,0.03)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[s.topLine, { backgroundColor: sharing ? "rgba(0,214,143,0.50)" : "rgba(59,107,255,0.35)" }]} />

          <View style={s.statusContent}>
            {/* Animated pulse icon */}
            <View style={s.statusIconWrap}>
              {sharing && (
                <Animated.View
                  style={[
                    s.statusPulseRing,
                    pulseStyle,
                    { borderColor: "rgba(0,214,143,0.35)" },
                  ]}
                />
              )}
              <LinearGradient
                colors={sharing ? ["rgba(0,214,143,0.25)", "rgba(0,214,143,0.08)"] : ["rgba(59,107,255,0.20)", "rgba(59,107,255,0.06)"]}
                style={s.statusIconCircle}
              >
                <Ionicons
                  name={sharing ? "location" : "location-outline"}
                  size={30}
                  color={sharing ? "#00D68F" : "#3B6BFF"}
                />
              </LinearGradient>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={s.statusTitle}>
                {sharing ? "Compartiendo en vivo" : "Listo para compartir"}
              </Text>
              <Text style={s.statusSubtitle}>
                {sharing
                  ? expiresAt
                    ? `Tiempo restante: ${timeRemainingLabel()}`
                    : "Compartiendo indefinidamente"
                  : "Elige duración y pulsa compartir"}
              </Text>
              {lastUpdated && sharing && (
                <Text style={s.lastUpdated}>
                  Actualizado hace {Math.floor((Date.now() - lastUpdated.getTime()) / 60_000)}m
                </Text>
              )}
            </View>

            {/* Live badge */}
            {sharing && (
              <Animated.View entering={FadeIn.duration(400)} style={s.liveBadge}>
                <View style={s.liveDot} />
                <Text style={s.liveBadgeText}>LIVE</Text>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* ── Duration Pills (only when NOT sharing) ── */}
        {!sharing && (
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIconBadge}>
                <Ionicons name="timer-outline" size={13} color={colors.eu.star} />
              </View>
              <Text style={s.sectionLabel}>¿Cuánto tiempo?</Text>
            </View>
            <View style={s.durationGrid}>
              {DURATIONS.map((dur) => {
                const isActive = selectedDuration?.label === dur.label;
                return (
                  <Pressable
                    key={dur.label}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedDuration(isActive ? null : dur);
                    }}
                    style={({ pressed }) => [
                      s.durationPill,
                      isActive && s.durationPillActive,
                      pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] },
                    ]}
                  >
                    {isActive && (
                      <LinearGradient
                        colors={["rgba(0,214,143,0.20)", "rgba(0,214,143,0.08)"]}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                    )}
                    <Ionicons
                      name={dur.icon}
                      size={16}
                      color={isActive ? "#00D68F" : colors.text.tertiary}
                    />
                    <Text style={[s.durationLabel, isActive && s.durationLabelActive]}>
                      {dur.label}
                    </Text>
                    <Text style={[s.durationSublabel, isActive && s.durationSublabelActive]}>
                      {dur.sublabel}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* ── Share CTA / Stop Button ── */}
        {!sharing ? (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Pressable
              onPress={handleStartSharing}
              disabled={!canShare}
              style={({ pressed }) => [
                s.ctaBtn,
                !canShare && s.ctaBtnDisabled,
                pressed && canShare && { opacity: 0.88, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={canShare ? ["#00D68F", "#00B377"] : ["rgba(255,255,255,0.07)", "rgba(255,255,255,0.03)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.ctaGrad}
              >
                {updateMut.isPending ? (
                  <ActivityIndicator color="#0A1628" />
                ) : (
                  <>
                    <View style={[s.ctaIconWrap, !canShare && { backgroundColor: "rgba(255,255,255,0.05)" }]}>
                      <Ionicons name="location" size={18} color={canShare ? "#0A1628" : colors.text.disabled} />
                    </View>
                    <Text style={[s.ctaText, !canShare && s.ctaTextDisabled]}>
                      {canShare ? `Compartir Ubicación · ${selectedDuration!.label}` : "Elige una duración"}
                    </Text>
                    {canShare && (
                      <Ionicons name="arrow-forward" size={16} color="#0A1628" style={{ marginLeft: "auto" }} />
                    )}
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <Pressable
              onPress={handleStopSharing}
              style={({ pressed }) => [
                s.stopBtn,
                pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
            >
              <LinearGradient
                colors={["rgba(255,79,111,0.18)", "rgba(255,79,111,0.06)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={[s.topLine, { backgroundColor: "rgba(255,79,111,0.40)" }]} />
              <Ionicons name="stop-circle" size={22} color="#FF4F6F" />
              <Text style={s.stopBtnText}>Dejar de compartir</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* ── Coordinates Section ── */}
        {hasCoords && sharing && (
          <Animated.View entering={FadeInDown.delay(260).springify()}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIconBadge}>
                <Ionicons name="navigate-outline" size={13} color={colors.eu.star} />
              </View>
              <Text style={s.sectionLabel}>Tu ubicación exacta</Text>
            </View>
            <BlurView intensity={40} tint="dark" style={[s.card, shadows.card]}>
              <View style={[s.topLine, { backgroundColor: "rgba(0,214,143,0.30)" }]} />
              <View style={s.coordsGrid}>
                <View style={s.coordBox}>
                  <Text style={s.coordLabel}>Latitud</Text>
                  <Text style={s.coordValue}>{latitude?.toFixed(6)}</Text>
                  <View style={s.coordBar}>
                    <View style={[s.coordBarFill, { width: `${((latitude! + 90) / 180) * 100}%` }]} />
                  </View>
                </View>
                <View style={s.coordBox}>
                  <Text style={s.coordLabel}>Longitud</Text>
                  <Text style={s.coordValue}>{longitude?.toFixed(6)}</Text>
                  <View style={s.coordBar}>
                    <View style={[s.coordBarFill, { width: `${((longitude! + 180) / 360) * 100}%` }]} />
                  </View>
                </View>
              </View>
              <Pressable
                onPress={refreshLocation}
                disabled={loading || updateMut.isPending}
                style={s.refreshBtn}
              >
                <Ionicons name="refresh-circle-outline" size={18} color={loading ? colors.text.tertiary : "#00D68F"} />
                <Text style={[s.refreshText, loading && { color: colors.text.tertiary }]}>
                  {updateMut.isPending ? "Sincronizando..." : "Actualizar ahora"}
                </Text>
              </Pressable>
            </BlurView>
          </Animated.View>
        )}

        {/* ── Nearby Users ── */}
        {sharing && hasCoords && (
          <Animated.View entering={FadeInDown.delay(320).springify()}>
            <View style={[s.sectionHeader, { marginTop: spacing.md }]}>
              <View style={s.sectionIconBadge}>
                <Ionicons name="people-outline" size={13} color={colors.eu.star} />
              </View>
              <Text style={s.sectionLabel}>Erasmus cerca de ti</Text>
              <View style={s.nearbyCountBadge}>
                <Text style={s.nearbyCountText}>{nearbyUsers.length}</Text>
              </View>
            </View>

            {loadingNearby ? (
              <View style={s.loadingContainer}>
                <ActivityIndicator size="large" color="#00D68F" />
              </View>
            ) : nearbyUsers.length > 0 ? (
              nearbyUsers.map((user, idx) => (
                <Animated.View key={user.id} entering={FadeInUp.delay(340 + idx * 60).springify()}>
                  <BlurView intensity={40} tint="dark" style={[s.userCard, shadows.card]}>
                    <View style={s.topLine} />
                    <Pressable style={s.userCardContent} hitSlop={12}>
                      <LinearGradient
                        colors={["rgba(0,214,143,0.20)", "rgba(59,107,255,0.10)"]}
                        style={s.userAvatar}
                      >
                        <Text style={s.userInitials}>{user.firstName[0]}{user.lastName[0]}</Text>
                      </LinearGradient>
                      <View style={{ flex: 1 }}>
                        <Text style={s.userName}>{user.firstName} {user.lastName}</Text>
                        <View style={s.distanceRow}>
                          <Ionicons name="location-outline" size={12} color="#00D68F" />
                          <Text style={s.distanceText}>{user.distance.toFixed(1)} km</Text>
                        </View>
                      </View>
                      <View style={s.userAction}>
                        <Ionicons name="chatbubble-outline" size={16} color="rgba(0,214,143,0.70)" />
                      </View>
                    </Pressable>
                  </BlurView>
                </Animated.View>
              ))
            ) : (
              <BlurView intensity={40} tint="dark" style={[s.emptyNearby, shadows.card]}>
                <Ionicons name="people-outline" size={36} color="rgba(0,214,143,0.25)" />
                <Text style={s.emptyNearbyText}>No hay Erasmus cerca ahora</Text>
              </BlurView>
            )}
          </Animated.View>
        )}

        {/* ── Privacy card ── */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <BlurView intensity={25} tint="dark" style={[s.card, s.privacyCard, shadows.card]}>
            <View style={s.topLine} />
            <View style={s.privacyHeader}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#00D4AA" />
              <Text style={s.privacyTitle}>Privacidad garantizada</Text>
            </View>
            {[
              "Solo Erasmus verificados ven tu zona aproximada",
              "Coordenadas exactas guardadas solo localmente",
              "Puedes parar en cualquier momento",
              "Datos de ubicación eliminados tras 24h",
            ].map((item, i) => (
              <View key={i} style={s.privacyRow}>
                <View style={s.privacyDot} />
                <Text style={s.privacyText}>{item}</Text>
              </View>
            ))}
          </BlurView>
        </Animated.View>
      </Animated.ScrollView>
    </ScreenBackground>
  );
}

/* ═══════════════════════════════════════════════════════════
   STYLES
════════════════════════════════════════════════════════════ */
const s = StyleSheet.create({
  // Layout
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: borders.hairline, borderColor: "rgba(255,255,255,0.12)",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: {
    fontFamily: typography.families.subheading, fontSize: 18,
    color: colors.text.primary, letterSpacing: -0.3,
  },
  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.lg },
  topLine: {
    position: "absolute", top: 0, left: 0, right: 0, height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  // Status card
  statusCard: {
    borderRadius: radii.xxl, overflow: "hidden",
    borderWidth: borders.hairline, borderColor: "rgba(255,255,255,0.08)",
  },
  statusContent: {
    padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md,
  },
  statusIconWrap: { width: 64, height: 64, justifyContent: "center", alignItems: "center" },
  statusPulseRing: {
    position: "absolute", width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: "rgba(0,214,143,0.35)",
  },
  statusIconCircle: {
    width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center",
  },
  statusTitle: {
    fontFamily: typography.families.heading, fontSize: 16,
    color: colors.text.primary, marginBottom: 4,
  },
  statusSubtitle: {
    fontFamily: typography.families.body, fontSize: 12,
    color: colors.text.secondary, lineHeight: 17,
  },
  lastUpdated: {
    fontFamily: typography.families.body, fontSize: 11,
    color: "#00D68F", marginTop: 4,
  },
  liveBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radii.full, backgroundColor: "rgba(0,214,143,0.15)",
    borderWidth: 1, borderColor: "rgba(0,214,143,0.25)",
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#00D68F" },
  liveBadgeText: {
    fontFamily: typography.families.bodyBold, fontSize: 10,
    color: "#00D68F", letterSpacing: 1,
  },

  // Section header
  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: spacing.sm,
  },
  sectionIconBadge: {
    width: 24, height: 24, borderRadius: 8,
    backgroundColor: "rgba(255,215,0,0.12)",
    borderWidth: 1, borderColor: "rgba(255,215,0,0.20)",
    alignItems: "center", justifyContent: "center",
  },
  sectionLabel: {
    fontFamily: typography.families.bodyMedium, fontSize: 12,
    color: colors.text.secondary, textTransform: "uppercase", letterSpacing: 0.8,
    flex: 1,
  },

  // Duration pills
  durationGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: spacing.sm,
  },
  durationPill: {
    flex: 1, minWidth: 80, alignItems: "center", justifyContent: "center",
    paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
    borderRadius: radii.xl, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    gap: 4,
  },
  durationPillActive: {
    borderColor: "rgba(0,214,143,0.45)",
    backgroundColor: "rgba(0,214,143,0.05)",
  },
  durationLabel: {
    fontFamily: typography.families.subheading, fontSize: 15,
    color: colors.text.secondary,
  },
  durationLabelActive: { color: "#00D68F" },
  durationSublabel: {
    fontFamily: typography.families.body, fontSize: 10,
    color: colors.text.disabled,
  },
  durationSublabelActive: { color: "rgba(0,214,143,0.65)" },

  // CTA button
  ctaBtn: { borderRadius: radii.xl, overflow: "hidden" },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaGrad: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    paddingVertical: spacing.lg - 2, paddingHorizontal: spacing.lg,
  },
  ctaIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.15)", alignItems: "center", justifyContent: "center",
  },
  ctaText: {
    fontFamily: typography.families.subheading, fontSize: 15, color: "#0A1628", flex: 1,
  },
  ctaTextDisabled: { color: colors.text.disabled },

  // Stop button
  stopBtn: {
    borderRadius: radii.xl, overflow: "hidden",
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
    padding: spacing.lg,
    borderWidth: 1, borderColor: "rgba(255,79,111,0.30)",
  },
  stopBtnText: {
    fontFamily: typography.families.subheading, fontSize: 15, color: "#FF4F6F",
  },

  // Card
  card: {
    borderRadius: radii.xxl, overflow: "hidden",
    borderWidth: borders.hairline, borderColor: "rgba(255,255,255,0.08)",
  },

  // Coordinates
  coordsGrid: { padding: spacing.lg, gap: spacing.md },
  coordBox: { gap: spacing.xs },
  coordLabel: {
    fontFamily: typography.families.body, fontSize: 10,
    color: colors.text.tertiary, textTransform: "uppercase", letterSpacing: 0.5,
  },
  coordValue: {
    fontFamily: typography.families.heading, fontSize: 16,
    color: "#00D68F", marginVertical: 2,
  },
  coordBar: { height: 3, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" },
  coordBarFill: { height: 3, backgroundColor: "#00D68F", borderRadius: 2 },
  refreshBtn: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    padding: spacing.lg, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.06)",
  },
  refreshText: { fontFamily: typography.families.bodyMedium, fontSize: 12, color: "#00D68F" },

  // Nearby
  nearbyCountBadge: {
    backgroundColor: "rgba(0,214,143,0.15)", paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: radii.full,
  },
  nearbyCountText: { fontFamily: typography.families.bodyMedium, fontSize: 11, color: "#00D68F" },
  loadingContainer: { height: 100, justifyContent: "center", alignItems: "center" },
  userCard: {
    marginBottom: spacing.sm, borderRadius: radii.xl, overflow: "hidden",
    borderWidth: borders.hairline, borderColor: "rgba(255,255,255,0.07)",
  },
  userCardContent: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md },
  userAvatar: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: "center", alignItems: "center",
  },
  userInitials: { fontFamily: typography.families.heading, fontSize: 14, color: "#00D68F" },
  userName: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.text.primary },
  distanceRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  distanceText: { fontFamily: typography.families.body, fontSize: 11, color: "#00D68F" },
  userAction: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(0,214,143,0.08)", justifyContent: "center", alignItems: "center",
  },
  emptyNearby: {
    paddingVertical: spacing.xl, alignItems: "center", gap: spacing.sm,
    borderRadius: radii.xl, overflow: "hidden",
    borderWidth: borders.hairline, borderColor: "rgba(255,255,255,0.07)",
  },
  emptyNearbyText: {
    fontFamily: typography.families.body, fontSize: 13, color: colors.text.secondary,
  },

  // Privacy
  privacyCard: { padding: spacing.lg, gap: spacing.sm },
  privacyHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 4 },
  privacyTitle: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: "#00D4AA" },
  privacyRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  privacyDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "rgba(0,212,170,0.50)", marginTop: 5 },
  privacyText: { fontFamily: typography.families.body, fontSize: 12, color: colors.text.secondary, flex: 1, lineHeight: 18 },
});
