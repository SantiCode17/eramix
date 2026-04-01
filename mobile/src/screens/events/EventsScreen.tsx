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
import { Ionicons } from "@expo/vector-icons";
import * as eventsApi from "@/api/events";
import { handleError } from "@/utils/errorHandler";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import type { EventData, EventsStackParamList } from "@/types/events";

type Nav = StackNavigationProp<EventsStackParamList, "EventsList">;
const { width: SCREEN_W } = Dimensions.get("window");

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const CATEGORIES: { label: string; value: string; icon: IoniconsName }[] = [
  { label: "Todos", value: "", icon: "apps-outline" },
  { label: "Fiesta", value: "fiesta", icon: "musical-notes-outline" },
  { label: "Académico", value: "academico", icon: "school-outline" },
  { label: "Deporte", value: "deporte", icon: "football-outline" },
  { label: "Comida", value: "comida", icon: "restaurant-outline" },
  { label: "Música", value: "musica", icon: "headset-outline" },
  { label: "Viaje", value: "viaje", icon: "airplane-outline" },
  { label: "Cultura", value: "cultura", icon: "color-palette-outline" },
];

// ── Category icon helper ────────────────────────────
const getCategoryIcon = (category?: string): IoniconsName => {
  const found = CATEGORIES.find((c) => c.value === category);
  return found?.icon ?? "calendar-outline";
};

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
          <Ionicons
            name={getCategoryIcon(event.category ?? undefined)}
            size={40}
            color="rgba(255,255,255,0.2)"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.cardFade}
          />
          {/* Category badge */}
          {event.category && (
            <View style={styles.categoryBadge}>
              <Ionicons
                name={getCategoryIcon(event.category)}
                size={12}
                color="rgba(255,255,255,0.9)"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.categoryBadgeText}>{event.category}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.cardDateRow}>
            <Ionicons name="time-outline" size={13} color={colors.eu.star} />
            <Text style={styles.cardDate}>{dateStr}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.cardLocation}>
              <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
              <Text style={styles.cardLocationText} numberOfLines={1}>
                {event.location ?? "Sin ubicación"}
              </Text>
            </View>
            <View style={styles.participantsBadge}>
              <Ionicons name="people-outline" size={14} color={colors.text.secondary} />
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
            <Ionicons
              name={event.currentUserStatus === "GOING" ? "checkmark-circle" : "star"}
              size={13}
              color="#FFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.joinedText}>
              {event.currentUserStatus === "GOING" ? "Apuntado" : "Interesado"}
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
            colors={[colors.eu.star, "#FFD633"]}
            style={styles.createButtonGrad}
          >
            <Ionicons name="add" size={22} color="#000" />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.value;
          return (
            <Pressable
              key={cat.value}
              onPress={() => handleCategoryPress(cat.value)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={active ? colors.eu.star : colors.text.secondary}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Events list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.eu.star} size="large" />
        </View>
      ) : events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={56} color="rgba(255,255,255,0.15)" />
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
    letterSpacing: -0.5,
  },
  createButton: { borderRadius: 20, overflow: "hidden" },
  createButtonGrad: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Chips — modern underline style
  chipRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  chipActive: {
    backgroundColor: "rgba(255, 204, 0, 0.12)",
    borderColor: "rgba(255, 204, 0, 0.3)",
  },
  chipText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.eu.star,
  },

  // Card — modern design
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  cardCover: {
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  categoryBadgeText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    textTransform: "capitalize",
  },
  cardInfo: {
    padding: spacing.md,
    gap: 6,
  },
  cardTitle: {
    fontFamily: typography.families.subheading,
    fontSize: 17,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  cardDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
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
  participantsText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.text.secondary,
  },
  joinedIndicator: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 4,
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
  emptyTitle: {
    fontFamily: typography.families.heading,
    fontSize: 22,
    color: colors.text.primary,
    marginTop: spacing.sm,
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
