import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as eventsApi from "@/api/events";
import { useAuthStore } from "@/store/useAuthStore";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { EventData, EventParticipant, EventsStackParamList } from "@/types/events";

type Route = RouteProp<EventsStackParamList, "EventDetail">;

// ── Participant Avatar ──────────────────────────────

function ParticipantAvatar({ p }: { p: EventParticipant }) {
  const initials = `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();
  return (
    <View style={styles.participantItem}>
      {p.profilePhotoUrl ? (
        <Image source={{ uri: p.profilePhotoUrl }} style={styles.participantAvatar} />
      ) : (
        <View style={styles.participantFallback}>
          <Text style={styles.participantInitials}>{initials}</Text>
        </View>
      )}
      <Text style={styles.participantName} numberOfLines={1}>
        {p.firstName}
      </Text>
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────

export default function EventDetailScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { eventId } = route.params;
  const currentUser = useAuthStore((s) => s.user);

  const [event, setEvent] = useState<EventData | null>(null);
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isCreator = event?.creatorId === currentUser?.id;
  const isJoined = event?.currentUserStatus === "GOING";

  const fetchData = useCallback(async () => {
    try {
      const [ev, parts] = await Promise.all([
        eventsApi.getEvent(eventId),
        eventsApi.getParticipants(eventId),
      ]);
      setEvent(ev);
      setParticipants(parts);
    } catch (e) {
      console.error("[EventDetail]", e);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await eventsApi.joinEvent(eventId, "GOING");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await eventsApi.leaveEvent(eventId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Eliminar evento", "¿Estás seguro?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await eventsApi.deleteEvent(eventId);
            navigation.goBack();
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  if (loading || !event) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={[colors.background.start, colors.background.end]}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator color={colors.eu.star} size="large" />
      </View>
    );
  }

  const dateStr = new Date(event.startDatetime).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const endStr = event.endDatetime
    ? new Date(event.endDatetime).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Cover */}
        <View style={styles.cover}>
          <LinearGradient
            colors={["#1A4DB3", "#003399", "#1A1A2E"]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.coverEmoji}>🎉</Text>
          <LinearGradient
            colors={["transparent", "rgba(26,26,46,0.95)"]}
            style={styles.coverFade}
          />

          {/* Back button */}
          <Pressable
            style={[styles.backBtn, { top: insets.top + spacing.xs }]}
            onPress={() => navigation.goBack()}
            hitSlop={12}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
        </View>

        {/* Content */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.content}>
          {event.category && (
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{event.category}</Text>
            </View>
          )}

          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>📅</Text>
            <Text style={styles.metaText}>
              {dateStr}
              {endStr ? ` – ${endStr}` : ""}
            </Text>
          </View>

          {event.location && (
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text style={styles.metaText}>{event.location}</Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>👥</Text>
            <Text style={styles.metaText}>
              {event.participantCount} participante
              {event.participantCount !== 1 ? "s" : ""}
              {event.maxParticipants ? ` / ${event.maxParticipants} máx.` : ""}
            </Text>
          </View>

          {/* Creator */}
          <View style={styles.creatorRow}>
            <Text style={styles.metaIcon}>👤</Text>
            <Text style={styles.metaText}>
              Creado por {event.creatorFirstName} {event.creatorLastName}
            </Text>
          </View>

          {/* Description */}
          {event.description && (
            <View style={styles.descSection}>
              <Text style={styles.sectionLabel}>Descripción</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>
          )}

          {/* Participants */}
          {participants.length > 0 && (
            <View style={styles.participantsSection}>
              <Text style={styles.sectionLabel}>Participantes</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.participantsList}
              >
                {participants.map((p) => (
                  <ParticipantAvatar key={p.userId} p={p} />
                ))}
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Action Button */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + spacing.md }]}>
        {isCreator ? (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Eliminar evento</Text>
          </Pressable>
        ) : isJoined ? (
          <Pressable
            style={styles.leaveButton}
            onPress={handleLeave}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.leaveButtonText}>✓ Ya estoy apuntado</Text>
            )}
          </Pressable>
        ) : (
          <Pressable style={styles.joinButton} onPress={handleJoin} disabled={actionLoading}>
            <LinearGradient
              colors={[colors.eu.orange, "#FF8B4F"]}
              style={styles.joinButtonGrad}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.joinButtonText}>Apuntarse</Text>
              )}
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { alignItems: "center", justifyContent: "center" },

  // Cover
  cover: { height: 220, justifyContent: "center", alignItems: "center" },
  coverEmoji: { fontSize: 64, opacity: 0.3 },
  coverFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backBtn: {
    position: "absolute",
    left: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { fontSize: 22, color: "#FFF" },

  // Content
  content: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,204,0,0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.eu.star,
  },
  categoryChipText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.eu.star,
    textTransform: "capitalize",
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: 26,
    color: colors.text.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  metaIcon: { fontSize: 16 },
  metaText: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  // Description
  descSection: { marginTop: spacing.md, gap: spacing.xs },
  sectionLabel: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.text.primary,
  },
  description: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },

  // Participants
  participantsSection: { marginTop: spacing.md, gap: spacing.sm },
  participantsList: { gap: spacing.md, paddingRight: spacing.lg },
  participantItem: { alignItems: "center", gap: spacing.xxs, width: 60 },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.glass.whiteMid,
  },
  participantFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.eu.mid,
    alignItems: "center",
    justifyContent: "center",
  },
  participantInitials: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.text.primary,
  },
  participantName: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: "center",
  },

  // Action bar
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: "rgba(26,26,46,0.95)",
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
  joinButton: { borderRadius: radii.xl, overflow: "hidden" },
  joinButtonGrad: {
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: radii.xl,
  },
  joinButtonText: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: "#FFF",
  },
  leaveButton: {
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: radii.xl,
    backgroundColor: colors.glass.whiteMid,
    borderWidth: 1,
    borderColor: colors.status.success,
  },
  leaveButtonText: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.status.success,
  },
  deleteButton: {
    paddingVertical: spacing.md,
    alignItems: "center",
    borderRadius: radii.xl,
    backgroundColor: "rgba(244,67,54,0.15)",
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  deleteButtonText: {
    fontFamily: typography.families.subheading,
    fontSize: 16,
    color: colors.status.error,
  },
});
