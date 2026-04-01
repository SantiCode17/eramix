import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as eventsApi from "@/api/events";
import { handleError } from "@/utils/errorHandler";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import type { EventData, EventsStackParamList } from "@/types/events";

type Nav = StackNavigationProp<EventsStackParamList, "EventsList">;
const { width: SCREEN_W } = Dimensions.get("window");

const CATEGORIES = [
  { label: "Todos", value: "" },
  { label: "🎉 Fiesta", value: "fiesta" },
  { label: "🎓 Académico", value: "academico" },
  { label: "⚽ Deporte", value: "deporte" },
  { label: "🍕 Comida", value: "comida" },
  { label: "🎵 Música", value: "musica" },
  { label: "✈️ Viaje", value: "viaje" },
  { label: "🎨 Cultura", value: "cultura" },
];

// ── Event Card ──────────────────────────────────────

function EventCard({
  event,
  index,
  onPress,
}: {
  event: EventData;
  index: number;
  onPress: () => void;
}) {
  const dateStr = new Date(event.startDatetime).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const categoryEmoji =
    CATEGORIES.find((c) => c.value === event.category)?.label.charAt(0) ?? "📅";

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        {/* Cover image placeholder with gradient */}
        <View style={styles.cardCover}>
          <LinearGradient
            colors={["#1A4DB3", "#003399", "#1A1A2E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.cardCoverEmoji}>{categoryEmoji}</Text>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.cardFade}
          />
          {/* Category badge */}
          {event.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{event.category}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <Text style={styles.cardDate}>{dateStr}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.cardLocation}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.cardLocationText} numberOfLines={1}>
                {event.location ?? "Sin ubicación"}
              </Text>
            </View>
            <View style={styles.participantsBadge}>
              <Text style={styles.participantsIcon}>👥</Text>
              <Text style={styles.participantsText}>
                {event.participantCount}
                {event.maxParticipants ? `/${event.maxParticipants}` : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Joined status */}
        {event.currentUserStatus && (
          <View style={styles.joinedIndicator}>
            <Text style={styles.joinedText}>
              {event.currentUserStatus === "GOING" ? "✓ Apuntado" : "★ Interesado"}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// ── Main Screen ─────────────────────────────────────

export default function EventsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchEvents = useCallback(
    async (cat?: string) => {
      try {
        const result = await eventsApi.getUpcomingEvents(
          cat || undefined,
          0,
          50,
        );
        setEvents(result.content);
      } catch (e) {
        handleError(e, "Events.getUpcoming");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchEvents(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      fetchEvents(selectedCategory);
    });
    return unsub;
  }, [navigation, selectedCategory]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryPress = useCallback((value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(value);
    setLoading(true);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.headerTitle}>Eventos</Text>
        <Pressable
          style={styles.createButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate("CreateEvent");
          }}
        >
          <LinearGradient
            colors={[colors.eu.orange, "#FF8B4F"]}
            style={styles.createButtonGrad}
          >
            <Text style={styles.createButtonText}>＋</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.value}
            onPress={() => handleCategoryPress(cat.value)}
            style={[
              styles.chip,
              selectedCategory === cat.value && styles.chipActive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === cat.value && styles.chipTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Events list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.eu.star} size="large" />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyTitle}>No hay eventos</Text>
          <Text style={styles.emptySubtitle}>
            ¡Crea uno y empieza la fiesta Erasmus!
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.eu.star}
              colors={[colors.eu.star]}
            />
          }
        >
          {events.map((event, i) => (
            <EventCard
              key={event.id}
              event={event}
              index={i}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate("EventDetail", { eventId: event.id });
              }}
            />
          ))}
          <View style={{ height: insets.bottom + 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    color: colors.text.primary,
  },
  createButton: { borderRadius: 20, overflow: "hidden" },
  createButtonGrad: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: {
    fontSize: 22,
    color: "#FFF",
    fontWeight: "700",
  },

  // Chips
  chipRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  chipActive: {
    backgroundColor: "rgba(255, 204, 0, 0.2)",
    borderColor: colors.eu.star,
  },
  chipText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.eu.star,
  },

  // Card
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: "hidden",
    ...shadows.glass,
  },
  cardPressed: { opacity: 0.85 },
  cardCover: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  cardCoverEmoji: { fontSize: 48, opacity: 0.4 },
  cardFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  categoryBadge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
  },
  categoryBadgeText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: colors.text.primary,
    textTransform: "capitalize",
  },
  cardInfo: {
    padding: spacing.md,
    gap: spacing.xxs,
  },
  cardTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 17,
    color: colors.text.primary,
  },
  cardDate: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.eu.star,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  cardLocation: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  locationIcon: { fontSize: 14 },
  cardLocationText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },
  participantsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  participantsIcon: { fontSize: 14 },
  participantsText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.text.secondary,
  },
  joinedIndicator: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: "rgba(76, 175, 80, 0.85)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
  },
  joinedText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: "#FFF",
  },

  // States
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: {
    fontFamily: typography.families.heading,
    fontSize: 22,
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: spacing.xxl,
  },
  listContent: { paddingTop: spacing.xs },
});
