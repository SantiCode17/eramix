/**
 * EventDetailScreen — European Glass Design System
 * ─────────────────────────────────────────────────
 * Fixes:
 *  · Optimistic join/leave: botón se actualiza al instante
 *  · isFull: si el evento está lleno, botón deshabilitado con aviso
 *  · Estado INTERESTED soportado
 * Mejoras visuales:
 *  · Hero cover 320px con overlay multicapa
 *  · Status badges (Completo / Finalizado / Privado)
 *  · Info grid con glass cards
 *  · Barra capacidad con color dinámico (verde → naranja → rojo)
 *  · Avatares superpuestos de participantes
 *  · Action bar glassmorphism con todos los estados
 */

import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import Animated, { FadeIn, FadeInDown, FadeInRight, FadeInUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import * as eventsApi from "@/api/events";
import { apiClient } from "@/api/client";
import { handleError } from "@/utils/errorHandler";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import { useAuthStore } from "@/store/useAuthStore";
import { colors, typography, spacing, radii, borders, DS } from "@/design-system/tokens";
import type { EventData, EventParticipant, EventsStackParamList } from "@/types/events";

type Route = RouteProp<EventsStackParamList, "EventDetail">;
type IonName = React.ComponentProps<typeof Ionicons>["name"];

const { width: SCREEN_W } = Dimensions.get("window");
const COVER_H = 320;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function timeUntil(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Ya empezó";
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(h / 24);
  if (d > 0) return `En ${d} día${d > 1 ? "s" : ""}`;
  if (h > 0) return `En ${h}h`;
  const m = Math.floor(diff / 60_000);
  return `En ${m} min`;
}

function getDuration(start: string, end: string): string {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function capacityColor(pct: number): [string, string] {
  if (pct >= 1) return ["#FF4F6F", "#CC3355"];
  if (pct >= 0.75) return ["#FF9A00", "#FF6B2B"];
  return [colors.eu.star, "#00D68F"];
}

// ─── InfoCard ─────────────────────────────────────────────────────────────────

function InfoCard({ icon, label, value }: { icon: IonName; label: string; value: string }) {
  return (
    <View style={infoSt.card}>
      <View style={infoSt.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.eu.star} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={infoSt.label}>{label}</Text>
        <Text style={infoSt.value} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

const infoSt = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    borderWidth: borders.hairline,
    borderColor: "rgba(255,255,255,0.07)",
    padding: spacing.md,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,215,0,0.08)",
    alignItems: "center", justifyContent: "center",
  },
  label: {
    fontFamily: typography.families.body,
    fontSize: 11, color: colors.text.tertiary,
    textTransform: "uppercase", letterSpacing: 0.5,
  },
  value: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.text.primary },
});

// ─── OverlapAvatars ───────────────────────────────────────────────────────────

function OverlapAvatars({ participants }: { participants: EventParticipant[] }) {
  const shown = participants.slice(0, 5);
  const extra = participants.length - shown.length;
  return (
    <View style={avSt.row}>
      {shown.map((p, i) => {
        const uri = p.profilePhotoUrl ? resolveMediaUrl(p.profilePhotoUrl) : null;
        const initials = `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();
        return (
          <Animated.View
            key={p.userId}
            entering={FadeInRight.delay(i * 40).springify()}
            style={[avSt.wrap, { zIndex: shown.length - i, marginLeft: i === 0 ? 0 : -14 }]}
          >
            {uri ? (
              <Image source={{ uri }} style={avSt.avatar} />
            ) : (
              <LinearGradient colors={["rgba(59,107,255,0.4)", "rgba(19,34,64,0.8)"]} style={[avSt.avatar, avSt.fallback]}>
                <Text style={avSt.initials}>{initials}</Text>
              </LinearGradient>
            )}
          </Animated.View>
        );
      })}
      {extra > 0 && (
        <View style={[avSt.wrap, avSt.extraBubble, { marginLeft: -14, zIndex: 0 }]}>
          <Text style={avSt.extraText}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}

const avSt = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  wrap: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: DS.background, overflow: "hidden" },
  avatar: { width: "100%", height: "100%", resizeMode: "cover" },
  fallback: { alignItems: "center", justifyContent: "center" },
  initials: { fontFamily: typography.families.subheading, fontSize: 13, color: colors.text.primary },
  extraBubble: { backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  extraText: { fontFamily: typography.families.bodyMedium, fontSize: 11, color: colors.text.secondary },
});

// ─── ParticipantRow ───────────────────────────────────────────────────────────

function ParticipantRow({ p, index }: { p: EventParticipant; index: number }) {
  const uri = p.profilePhotoUrl ? resolveMediaUrl(p.profilePhotoUrl) : null;
  const initials = `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();
  const isGoing = p.status === "GOING";
  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()} style={prSt.row}>
      {uri ? (
        <Image source={{ uri }} style={prSt.avatar} />
      ) : (
        <LinearGradient colors={["rgba(59,107,255,0.3)", "rgba(19,34,64,0.6)"]} style={[prSt.avatar, prSt.fallback]}>
          <Text style={prSt.initials}>{initials}</Text>
        </LinearGradient>
      )}
      <View style={{ flex: 1 }}>
        <Text style={prSt.name}>{p.firstName} {p.lastName}</Text>
        <Text style={prSt.statusText}>{isGoing ? "Va a ir" : "Interesado"}</Text>
      </View>
      <View style={[prSt.badge, !isGoing && prSt.badgeInterested]}>
        <Ionicons name={isGoing ? "checkmark-circle" : "star"} size={14} color={isGoing ? "#00D68F" : colors.eu.star} />
      </View>
    </Animated.View>
  );
}

const prSt = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: borders.hairline, borderBottomColor: "rgba(255,255,255,0.04)",
  },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", overflow: "hidden", resizeMode: "cover" },
  fallback: { alignItems: "center", justifyContent: "center" },
  initials: { fontFamily: typography.families.subheading, fontSize: 15, color: colors.text.primary },
  name: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.text.primary },
  statusText: { fontFamily: typography.families.body, fontSize: 12, color: colors.text.tertiary, marginTop: 1 },
  badge: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,214,143,0.1)", alignItems: "center", justifyContent: "center" },
  badgeInterested: { backgroundColor: "rgba(255,215,0,0.1)" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function EventDetailScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { eventId } = route.params;
  const currentUser = useAuthStore((st) => st.user);

  const [event, setEvent] = useState<EventData | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const isCreator = event?.creatorId === currentUser?.id;
  const userStatus = event?.currentUserStatus ?? null;
  const isJoined = userStatus === "GOING";
  const isInterested = userStatus === "INTERESTED";
  const isFull = !!event?.maxParticipants && participants.length >= event.maxParticipants;
  const isPast = event ? new Date(event.startDatetime).getTime() < Date.now() : false;
  const capacityPct = event?.maxParticipants
    ? Math.min(1, participants.length / event.maxParticipants)
    : 0;

  useLayoutEffect(() => {
    const parent = navigation.getParent?.();
    parent?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      parent?.setOptions({
        tabBarStyle: {
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "rgba(4,6,26,0.92)",
          borderTopWidth: 0,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 0, shadowOpacity: 0,
        },
      });
    };
  }, [navigation, insets.bottom]);

  const fetchData = useCallback(async () => {
    try {
      const [ev, parts] = await Promise.all([
        eventsApi.getEvent(eventId),
        eventsApi.getParticipants(eventId),
      ]);
      setEvent(ev);
      setParticipants(parts);
    } catch (e) {
      handleError(e, "EventDetail.fetchData");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Acciones ────────────────────────────────────────────────────────────────

  const handleJoin = async () => {
    if (!event) return;
    setActionLoading(true);
    // Actualización optimista inmediata
    setEvent((prev) => prev ? { ...prev, currentUserStatus: "GOING", participantCount: prev.participantCount + 1 } : prev);
    try {
      await eventsApi.joinEvent(eventId, "GOING");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      fetchData();
    } catch (e) {
      // Revertir
      setEvent((prev) => prev ? { ...prev, currentUserStatus: null, participantCount: Math.max(0, prev.participantCount - 1) } : prev);
      Alert.alert("Error al unirse", "No se pudo completar la acción. Inténtalo de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = () => {
    Alert.alert("Salir del evento", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir", style: "destructive",
        onPress: async () => {
          setActionLoading(true);
          setEvent((prev) => prev ? { ...prev, currentUserStatus: null, participantCount: Math.max(0, prev.participantCount - 1) } : prev);
          try {
            await eventsApi.leaveEvent(eventId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            fetchData();
          } catch (e) {
            setEvent((prev) => prev ? { ...prev, currentUserStatus: "GOING", participantCount: prev.participantCount + 1 } : prev);
            Alert.alert("Error", "No se pudo completar la acción.");
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("Eliminar evento", "Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar", style: "destructive",
        onPress: async () => {
          try {
            await eventsApi.deleteEvent(eventId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            navigation.goBack();
          } catch {
            Alert.alert("Error", "No se pudo eliminar el evento.");
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `${event.title}\n📍 ${event.location ?? "Sin ubicación"}\n🗓 ${formatDate(event.startDatetime)}\n\n¡Únete en Eramix!`,
        title: event.title,
      });
    } catch {}
  };

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading || !event) {
    return (
      <View style={[s.container, s.center]}>
        <LinearGradient colors={[DS.background, "#0E1A35"]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator color={colors.eu.star} size="large" />
        <Text style={s.loadingText}>Cargando evento...</Text>
      </View>
    );
  }

  const coverUri = event?.coverImageUrl ? resolveMediaUrl(event.coverImageUrl) : null;

  const handlePickCover = async () => {
    if (!isCreator) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });
      if (res.canceled || !res.assets[0]?.uri) return;
      const uri = res.assets[0].uri;
      setCoverUploading(true);
      try {
        const ext = uri.split(".").pop()?.toLowerCase() ?? "jpg";
        const form = new FormData();
        form.append("file", { uri, name: `cover.${ext}`, type: ext === "png" ? "image/png" : "image/jpeg" } as any);
        const uploadRes = await apiClient.post<{ data: string }>("/v1/media/upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const newCoverUrl = uploadRes.data.data;
        await eventsApi.updateEvent(event!.id, {
          title: event!.title,
          location: event!.location ?? "",
          startDatetime: event!.startDatetime,
          endDatetime: event!.endDatetime,
          description: event!.description,
          category: event!.category,
          maxParticipants: event!.maxParticipants,
          isPublic: event!.isPublic,
          coverImageUrl: newCoverUrl,
        });
        setEvent((prev) => prev ? { ...prev, coverImageUrl: newCoverUrl } : prev);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        Alert.alert("Error", "No se pudo actualizar la portada.");
      } finally {
        setCoverUploading(false);
      }
    } catch {}
  };
  const [capColorA, capColorB] = capacityColor(capacityPct);

  return (
    <View style={s.container}>
      <LinearGradient colors={[DS.background, "#0E1A35", "#0A0A1E"]} style={StyleSheet.absoluteFill} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      >
        {/* ── Hero Cover ── */}
        <Animated.View entering={FadeIn.duration(500)} style={s.coverWrap}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={s.coverImage} />
          ) : (
            <LinearGradient
              colors={["rgba(255,215,0,0.14)", "rgba(59,107,255,0.18)", "rgba(19,34,64,0.7)"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={s.coverImage}
            >
              <Ionicons name="calendar" size={120} color="rgba(255,255,255,0.05)" style={{ alignSelf: "center", marginTop: 80 }} />
            </LinearGradient>
          )}
          <LinearGradient
            colors={["rgba(10,10,30,0.1)", "rgba(10,10,30,0.35)", DS.background]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* Creator: add / change cover */}
          {isCreator && !coverUri && (
            <Pressable onPress={handlePickCover} style={s.coverAddBtn} disabled={coverUploading}>
              <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
              {coverUploading
                ? <ActivityIndicator size="small" color={colors.eu.star} />
                : <><Ionicons name="image-outline" size={16} color={colors.eu.star} /><Text style={s.coverAddBtnText}>Añadir portada</Text></>
              }
            </Pressable>
          )}
          {isCreator && coverUri && (
            <Pressable onPress={handlePickCover} style={s.coverChangeBadge} disabled={coverUploading}>
              <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
              {coverUploading
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Ionicons name="pencil" size={14} color="#FFF" />
              }
            </Pressable>
          )}

          <View style={[s.topActions, { top: insets.top + spacing.xs }]}>
            <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.7 }]}>
              <BlurView intensity={70} tint="dark" style={s.iconBtnBlur}>
                <Ionicons name="chevron-back" size={20} color="#FFF" />
              </BlurView>
            </Pressable>
            <View style={s.topRight}>
              {isFull && !isPast && (
                <View style={s.badgeFull}>
                  <Ionicons name="lock-closed" size={11} color="#FF4F6F" />
                  <Text style={s.badgeFullText}>Completo</Text>
                </View>
              )}
              {isPast && (
                <View style={s.badgePast}>
                  <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.5)" />
                  <Text style={s.badgePastText}>Finalizado</Text>
                </View>
              )}
              {!event.isPublic && (
                <View style={s.badgePrivate}>
                  <Ionicons name="lock-closed" size={11} color={colors.eu.star} />
                  <Text style={s.badgePrivateText}>Privado</Text>
                </View>
              )}
              <Pressable onPress={handleShare} style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.7 }]}>
                <BlurView intensity={70} tint="dark" style={s.iconBtnBlur}>
                  <Ionicons name="share-outline" size={18} color="#FFF" />
                </BlurView>
              </Pressable>
            </View>
          </View>

          {!isPast && (
            <View style={s.countdownPill}>
              <Ionicons name="time-outline" size={13} color={colors.eu.star} />
              <Text style={s.countdownText}>{timeUntil(event.startDatetime)}</Text>
            </View>
          )}

          {event.category && (
            <View style={s.categoryBadge}>
              <Text style={s.categoryText}>{event.category}</Text>
            </View>
          )}
        </Animated.View>

        {/* ── Título ── */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={s.titleSection}>
          <Text style={s.title}>{event.title}</Text>
          <View style={s.creatorRow}>
            {event.creatorProfilePhotoUrl ? (
              <Image source={{ uri: resolveMediaUrl(event.creatorProfilePhotoUrl) }} style={s.creatorAvatar} />
            ) : (
              <View style={s.creatorAvatarFallback}>
                <Ionicons name="person" size={12} color={colors.text.tertiary} />
              </View>
            )}
            <Text style={s.creatorText}>
              Organizado por{" "}
              <Text style={s.creatorName}>{event.creatorFirstName} {event.creatorLastName}</Text>
            </Text>
          </View>
        </Animated.View>

        {/* ── Info grid ── */}
        <Animated.View entering={FadeInDown.delay(140).springify()} style={s.infoGrid}>
          <View style={s.infoRow}>
            <InfoCard icon="calendar-outline" label="Fecha" value={formatDate(event.startDatetime)} />
          </View>
          <View style={s.infoRow}>
            <InfoCard icon="time-outline" label="Hora" value={formatTime(event.startDatetime)} />
            <InfoCard
              icon="people-outline"
              label="Asistentes"
              value={event.maxParticipants ? `${participants.length} / ${event.maxParticipants}` : `${participants.length}`}
            />
          </View>
          {event.location ? (
            <View style={s.infoRow}>
              <InfoCard icon="location-outline" label="Ubicación" value={event.location} />
            </View>
          ) : null}
          {event.endDatetime ? (
            <View style={s.infoRow}>
              <InfoCard icon="flag-outline" label="Finaliza" value={formatTime(event.endDatetime)} />
              <InfoCard icon="hourglass-outline" label="Duración" value={getDuration(event.startDatetime, event.endDatetime)} />
            </View>
          ) : null}
        </Animated.View>

        {/* ── Barra capacidad ── */}
        {event.maxParticipants ? (
          <Animated.View entering={FadeInDown.delay(180).springify()} style={s.capacitySection}>
            <View style={s.capacityHeader}>
              <Text style={s.capacityLabel}>Ocupación del evento</Text>
              <Text style={[s.capacityPct, isFull && { color: "#FF4F6F" }]}>
                {isFull ? "Completo" : `${Math.round(capacityPct * 100)}%`}
              </Text>
            </View>
            <View style={s.capacityTrack}>
              <LinearGradient
                colors={[capColorA, capColorB]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.capacityFill, { width: `${capacityPct * 100}%` as any }]}
              />
            </View>
            {isFull && (
              <View style={s.fullWarning}>
                <Ionicons name="warning-outline" size={13} color="#FF4F6F" />
                <Text style={s.fullWarningText}>El evento ha alcanzado su capacidad máxima</Text>
              </View>
            )}
          </Animated.View>
        ) : null}

        {/* ── Descripción ── */}
        {event.description ? (
          <Animated.View entering={FadeInDown.delay(220).springify()} style={s.section}>
            <Text style={s.sectionTitle}>Descripción</Text>
            <View style={s.descCard}>
              <Text style={s.descText}>{event.description}</Text>
            </View>
          </Animated.View>
        ) : null}

        {/* ── Participantes ── */}
        <Animated.View entering={FadeInDown.delay(260).springify()} style={s.section}>
          <View style={s.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <Text style={s.sectionTitle}>Participantes</Text>
              <View style={s.countBadge}>
                <Text style={s.countBadgeText}>{participants.length}</Text>
              </View>
            </View>
            {participants.length > 0 && <OverlapAvatars participants={participants} />}
          </View>
          {participants.length > 0 ? (
            <View style={s.participantList}>
              {participants.slice(0, 8).map((p, i) => (
                <ParticipantRow key={p.userId} p={p} index={i} />
              ))}
              {participants.length > 8 && (
                <View style={s.moreParticipants}>
                  <Text style={s.moreText}>+{participants.length - 8} personas más</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={s.noParticipants}>
              <Ionicons name="people-outline" size={28} color={colors.text.disabled} />
              <Text style={s.noParticipantsText}>Sé el primero en unirte</Text>
              <Text style={s.noParticipantsSub}>Aún no hay asistentes confirmados</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Action Bar ── */}
      <Animated.View
        entering={FadeInUp.delay(300).springify()}
        style={[s.actionBar, { paddingBottom: insets.bottom + spacing.sm }]}
      >
        <BlurView intensity={85} tint="dark" style={s.actionBarBlur}>
          <View style={s.actionBarInner}>

            {/* CREADOR */}
            {isCreator ? (
              <View style={s.creatorActions}>
                <View style={s.creatorBadge}>
                  <Ionicons name="star" size={15} color={colors.eu.star} />
                  <Text style={s.creatorBadgeText}>Eres el organizador</Text>
                </View>
                <Pressable onPress={handleDelete} style={({ pressed }) => [s.deleteBtn, pressed && { opacity: 0.8 }]}>
                  <Ionicons name="trash-outline" size={16} color="#FF4F6F" />
                  <Text style={s.deleteBtnText}>Eliminar evento</Text>
                </Pressable>
              </View>

            /* PASADO */
            ) : isPast ? (
              <View style={s.pastBanner}>
                <Ionicons name="time-outline" size={18} color={colors.text.tertiary} />
                <Text style={s.pastBannerText}>Este evento ya ha finalizado</Text>
              </View>

            /* APUNTADO */
            ) : isJoined ? (
              <View style={s.joinedRow}>
                <View style={s.joinedInfo}>
                  <View style={s.joinedCheck}>
                    <Ionicons name="checkmark-circle" size={22} color="#00D68F" />
                  </View>
                  <View>
                    <Text style={s.joinedTitle}>¡Estás apuntado!</Text>
                    <Text style={s.joinedSub}>Te esperamos allí</Text>
                  </View>
                </View>
                <Pressable
                  onPress={handleLeave}
                  disabled={actionLoading}
                  style={({ pressed }) => [s.leaveBtn, pressed && { opacity: 0.75 }, actionLoading && { opacity: 0.5 }]}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#FF4F6F" />
                  ) : (
                    <>
                      <Ionicons name="exit-outline" size={15} color="#FF4F6F" />
                      <Text style={s.leaveBtnText}>Salir</Text>
                    </>
                  )}
                </Pressable>
              </View>

            /* INTERESADO */
            ) : isInterested ? (
              <View style={s.joinedRow}>
                <View style={s.joinedInfo}>
                  <View style={[s.joinedCheck, { backgroundColor: "rgba(255,215,0,0.12)" }]}>
                    <Ionicons name="star" size={20} color={colors.eu.star} />
                  </View>
                  <View>
                    <Text style={s.joinedTitle}>Te interesa</Text>
                    <Text style={s.joinedSub}>¿Confirmas asistencia?</Text>
                  </View>
                </View>
                <Pressable onPress={handleJoin} disabled={actionLoading} style={({ pressed }) => [s.joinBtnSmall, pressed && { opacity: 0.8 }]}>
                  <LinearGradient colors={[colors.eu.star, colors.eu.orange]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.joinBtnSmallGrad}>
                    {actionLoading ? <ActivityIndicator size="small" color="#06081A" /> : <Text style={s.joinBtnSmallText}>Confirmar</Text>}
                  </LinearGradient>
                </Pressable>
              </View>

            /* COMPLETO */
            ) : isFull ? (
              <View style={s.fullBanner}>
                <Ionicons name="lock-closed" size={18} color="#FF4F6F" />
                <View>
                  <Text style={s.fullBannerTitle}>Evento completo</Text>
                  <Text style={s.fullBannerSub}>Ya no hay plazas disponibles</Text>
                </View>
              </View>

            /* UNIRSE */
            ) : (
              <View style={s.joinRow}>
                <View>
                  <Text style={s.joinPromptTitle}>¿Te apuntas?</Text>
                  <Text style={s.joinPromptSub}>
                    {event.maxParticipants
                      ? `Quedan ${event.maxParticipants - participants.length} plazas`
                      : "Evento abierto"}
                  </Text>
                </View>
                <Pressable
                  onPress={handleJoin}
                  disabled={actionLoading}
                  style={({ pressed }) => [s.joinBtn, pressed && { opacity: 0.85 }, actionLoading && { opacity: 0.6 }]}
                >
                  <LinearGradient
                    colors={[colors.eu.star, colors.eu.orange]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.joinBtnGrad}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color="#06081A" />
                    ) : (
                      <>
                        <Ionicons name="hand-right-outline" size={17} color="#06081A" />
                        <Text style={s.joinBtnText}>Unirme</Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </View>
            )}

          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.background },
  center: { alignItems: "center", justifyContent: "center", gap: spacing.sm },
  loadingText: { fontFamily: typography.families.body, fontSize: 14, color: colors.text.tertiary, marginTop: spacing.sm },

  // Cover
  coverWrap: { width: SCREEN_W, height: COVER_H, overflow: "hidden" },
  coverAddBtn: {
    position: "absolute", bottom: 56, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radii.full, overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,215,0,0.3)",
  },
  coverAddBtnText: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.eu.star },
  coverChangeBadge: {
    position: "absolute", bottom: spacing.xl + spacing.lg + 16, right: spacing.md,
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.2)",
  },
  coverImage: { width: "100%", height: "100%", resizeMode: "cover" },
  topActions: {
    position: "absolute", left: spacing.md, right: spacing.md,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  topRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  iconBtn: { borderRadius: 22, overflow: "hidden" },
  iconBtnBlur: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)", overflow: "hidden",
  },
  badgeFull: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,79,111,0.15)", borderWidth: 1, borderColor: "rgba(255,79,111,0.3)",
    borderRadius: radii.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  badgeFullText: { fontFamily: typography.families.bodyMedium, fontSize: 11, color: "#FF4F6F" },
  badgePast: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    borderRadius: radii.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  badgePastText: { fontFamily: typography.families.bodyMedium, fontSize: 11, color: colors.text.tertiary },
  badgePrivate: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,215,0,0.1)", borderWidth: 1, borderColor: "rgba(255,215,0,0.2)",
    borderRadius: radii.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  badgePrivateText: { fontFamily: typography.families.bodyMedium, fontSize: 11, color: colors.eu.star },
  countdownPill: {
    position: "absolute", bottom: spacing.lg, right: spacing.lg,
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(0,0,0,0.55)", borderWidth: 1, borderColor: "rgba(255,215,0,0.2)",
    borderRadius: radii.full, paddingHorizontal: 12, paddingVertical: 6,
  },
  countdownText: { fontFamily: typography.families.bodyMedium, fontSize: 12, color: colors.eu.star },
  categoryBadge: {
    position: "absolute", bottom: spacing.lg, left: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.1)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
    borderRadius: radii.full, paddingHorizontal: 12, paddingVertical: 6,
  },
  categoryText: { fontFamily: typography.families.bodyMedium, fontSize: 12, color: colors.text.primary, textTransform: "capitalize" },

  // Título
  titleSection: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  title: { fontFamily: typography.families.heading, fontSize: 28, color: colors.text.primary, letterSpacing: -0.5, lineHeight: 34 },
  creatorRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 2 },
  creatorAvatar: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  creatorAvatarFallback: { width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center" },
  creatorText: { fontFamily: typography.families.body, fontSize: 13, color: colors.text.tertiary },
  creatorName: { fontFamily: typography.families.bodyMedium, color: colors.text.secondary },

  // Info grid
  infoGrid: { paddingHorizontal: spacing.lg, marginTop: spacing.md, gap: spacing.sm },
  infoRow: { flexDirection: "row", gap: spacing.sm },

  // Capacidad
  capacitySection: { paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm },
  capacityHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  capacityLabel: { fontFamily: typography.families.body, fontSize: 13, color: colors.text.secondary },
  capacityPct: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.eu.star },
  capacityTrack: { height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.07)", overflow: "hidden" },
  capacityFill: { height: "100%", borderRadius: 4 },
  fullWarning: { flexDirection: "row", alignItems: "center", gap: 6 },
  fullWarningText: { fontFamily: typography.families.body, fontSize: 12, color: "#FF4F6F" },

  // Secciones
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  sectionTitle: { fontFamily: typography.families.subheading, fontSize: 17, color: colors.text.primary },
  countBadge: { backgroundColor: "rgba(255,215,0,0.1)", borderRadius: radii.full, paddingHorizontal: 10, paddingVertical: 3 },
  countBadgeText: { fontFamily: typography.families.bodyMedium, fontSize: 12, color: colors.eu.star },

  // Descripción
  descCard: {
    backgroundColor: "rgba(255,255,255,0.03)", borderRadius: radii.lg, padding: spacing.md,
    borderWidth: borders.hairline, borderColor: "rgba(255,255,255,0.06)",
  },
  descText: { fontFamily: typography.families.body, fontSize: 14, color: colors.text.secondary, lineHeight: 22 },

  // Participantes
  participantList: {
    backgroundColor: "rgba(255,255,255,0.02)", borderRadius: radii.lg, paddingHorizontal: spacing.md,
    borderWidth: borders.hairline, borderColor: "rgba(255,255,255,0.06)",
  },
  moreParticipants: { paddingVertical: spacing.md, alignItems: "center" },
  moreText: { fontFamily: typography.families.body, fontSize: 13, color: colors.text.tertiary },
  noParticipants: {
    alignItems: "center", justifyContent: "center", paddingVertical: spacing.xl, gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.02)", borderRadius: radii.lg,
    borderWidth: borders.hairline, borderColor: "rgba(255,255,255,0.06)",
  },
  noParticipantsText: { fontFamily: typography.families.bodyMedium, fontSize: 15, color: colors.text.secondary },
  noParticipantsSub: { fontFamily: typography.families.body, fontSize: 13, color: colors.text.disabled },

  // Action Bar
  actionBar: { position: "absolute", bottom: 0, left: 0, right: 0 },
  actionBarBlur: { overflow: "hidden", borderTopWidth: borders.hairline, borderTopColor: "rgba(255,255,255,0.07)" },
  actionBarInner: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  // Creador
  creatorActions: { gap: spacing.sm, paddingBottom: spacing.sm },
  creatorBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
    backgroundColor: "rgba(255,215,0,0.08)", borderWidth: 1, borderColor: "rgba(255,215,0,0.2)",
    borderRadius: radii.full, paddingHorizontal: 14, paddingVertical: 7,
  },
  creatorBadgeText: { fontFamily: typography.families.bodyMedium, fontSize: 13, color: colors.eu.star },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 13, borderRadius: radii.lg,
    backgroundColor: "rgba(255,79,111,0.08)", borderWidth: 1, borderColor: "rgba(255,79,111,0.2)",
  },
  deleteBtnText: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: "#FF4F6F" },

  // Pasado
  pastBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
    paddingVertical: spacing.md, paddingBottom: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.03)", borderRadius: radii.lg, marginBottom: spacing.sm,
  },
  pastBannerText: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: colors.text.tertiary },

  // Unido
  joinedRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: spacing.sm },
  joinedInfo: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  joinedCheck: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,214,143,0.1)", alignItems: "center", justifyContent: "center" },
  joinedTitle: { fontFamily: typography.families.bodyMedium, fontSize: 15, color: "#00D68F" },
  joinedSub: { fontFamily: typography.families.body, fontSize: 12, color: colors.text.tertiary, marginTop: 1 },
  leaveBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radii.lg,
    backgroundColor: "rgba(255,79,111,0.08)", borderWidth: 1, borderColor: "rgba(255,79,111,0.2)",
  },
  leaveBtnText: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: "#FF4F6F" },

  // Interesado → confirmar
  joinBtnSmall: { borderRadius: radii.lg, overflow: "hidden" },
  joinBtnSmallGrad: { paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radii.lg, alignItems: "center", justifyContent: "center" },
  joinBtnSmallText: { fontFamily: typography.families.bodyBold, fontSize: 14, color: "#06081A" },

  // Completo
  fullBanner: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    paddingVertical: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.lg,
    backgroundColor: "rgba(255,79,111,0.06)", borderRadius: radii.lg, borderWidth: 1, borderColor: "rgba(255,79,111,0.15)",
    marginBottom: spacing.sm,
  },
  fullBannerTitle: { fontFamily: typography.families.bodyMedium, fontSize: 14, color: "#FF4F6F" },
  fullBannerSub: { fontFamily: typography.families.body, fontSize: 12, color: "rgba(255,79,111,0.7)", marginTop: 1 },

  // Unirse
  joinRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: spacing.sm },
  joinPromptTitle: { fontFamily: typography.families.bodyMedium, fontSize: 16, color: colors.text.primary },
  joinPromptSub: { fontFamily: typography.families.body, fontSize: 12, color: colors.text.tertiary, marginTop: 2 },
  joinBtn: { borderRadius: radii.lg, overflow: "hidden" },
  joinBtnGrad: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 26, paddingVertical: 14, borderRadius: radii.lg },
  joinBtnText: { fontFamily: typography.families.bodyBold, fontSize: 16, color: "#06081A" },
});
