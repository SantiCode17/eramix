/**
 * EventsScreen — European Glass Design System
 * Pantalla principal de eventos Erasmus.
 *
 * Layout:
 *   Header ("Eventos" + subtitulo) + boton crear [+]
 *   Chips categorias (scroll H) — pill glass / active gold
 *   Featured carousel horizontal (170px cards + countdown + pbar)
 *   Gradient divider
 *   Event cards lista vertical (cover 150px + info + footer)
 *
 * Estados: loading (skeletons) | empty (EmptyState) | data
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  RefreshControl,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import Animated, {
  FadeInDown,
  FadeIn,
  FadeInRight,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import * as eventsApi from "@/api/events";
import { handleError } from "@/utils/errorHandler";
import {
  colors,
  typography,
  spacing,
  radii,
  DS,
  TAB_BAR_HEIGHT,
} from "@/design-system/tokens";
import {
  EmptyState,
  GradientDivider,
  ScreenBackground,
} from "@/design-system";
import { CategoryTab } from "@/components";
import type { EventData, EventsStackParamList } from "@/types/events";

// --- Constants ---

type Nav = StackNavigationProp<EventsStackParamList, "EventsList">;
type IonName = React.ComponentProps<typeof Ionicons>["name"];

const { width: SCREEN_W } = Dimensions.get("window");
const FEATURED_CARD_W = SCREEN_W * 0.62;
const FEATURED_CARD_H = 170;
const COVER_H = 150;

// --- Category data ---

interface Category {
  label: string;
  value: string;
  icon: IonName;
  gradient: [string, string];
}

const CATEGORIES: Category[] = [
  { label: "Todos",     value: "",          icon: "apps-outline",            gradient: ["#1A2D4D", "#0D1F3C"] },
  { label: "Fiesta",    value: "fiesta",    icon: "musical-notes-outline",   gradient: ["#1A2D4D", "#2A1A3D"] },
  { label: "Academico", value: "academico", icon: "school-outline",          gradient: ["#132240", "#1A3050"] },
  { label: "Deporte",   value: "deporte",   icon: "football-outline",        gradient: ["#0D2818", "#132D20"] },
  { label: "Comida",    value: "comida",    icon: "restaurant-outline",      gradient: ["#2D1A0D", "#3D2010"] },
  { label: "Musica",    value: "musica",    icon: "headset-outline",         gradient: ["#2D0D1A", "#3D1020"] },
  { label: "Viaje",     value: "viaje",     icon: "airplane-outline",        gradient: ["#0D1A2D", "#102030"] },
  { label: "Cultura",   value: "cultura",   icon: "color-palette-outline",   gradient: ["#2D2A0D", "#3D3510"] },
];

const findCategory = (val?: string | null): Category =>
  CATEGORIES.find((c) => c.value === val) ?? CATEGORIES[0];

// --- Helpers ---

/** Human-readable countdown: "En 2d 5h", "En 45min", "Ahora" */
const getCountdown = (iso: string): { label: string; urgent: boolean } => {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return { label: "Ahora", urgent: true };
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return { label: `En ${mins}min`, urgent: mins < 30 };
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return { label: `En ${hrs}h ${mins % 60}min`, urgent: hrs < 3 };
  const days = Math.floor(hrs / 24);
  return { label: `En ${days}d ${hrs % 24}h`, urgent: false };
};

const fillPercent = (ev: EventData): number =>
  ev.maxParticipants && ev.maxParticipants > 0
    ? Math.min(100, Math.round(((ev.participantCount ?? 0) / ev.maxParticipants) * 100))
    : 0;

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

// --- Sub-Components ---

/* Countdown Chip */
function CountdownChip({ iso, style }: { iso: string; style?: object }) {
  const cd = getCountdown(iso);
  return (
    <View style={[st.countdownChip, cd.urgent && st.countdownChipUrgent, style]}>
      <Ionicons
        name="time-outline"
        size={11}
        color={cd.urgent ? "#FF6D3F" : "rgba(255,215,0,0.9)"}
      />
      <Text style={[st.countdownText, cd.urgent && st.countdownTextUrgent]}>
        {cd.label}
      </Text>
    </View>
  );
}

/* Participant Progress Bar */
function ParticipantBar({ event }: { event: EventData }) {
  const pct = fillPercent(event);
  if (!event.maxParticipants || event.maxParticipants <= 0) return null;

  const barColors: [string, string] =
    pct > 85 ? ["#FF6D3F", "#FF6B2B"] : ["#FFD700", "#FF6B2B"];

  return (
    <View style={st.pBarRow}>
      <View style={st.pBarTrack}>
        <LinearGradient
          colors={barColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[st.pBarFill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={st.pBarLabel}>
        {event.participantCount ?? 0}/{event.maxParticipants}
      </Text>
    </View>
  );
}

/* Featured Card (horizontal carousel) */
function FeaturedCard({
  event,
  index,
  onPress,
}: {
  event: EventData;
  index: number;
  onPress: () => void;
}) {
  const cat = findCategory(event.category);

  return (
    <Animated.View entering={FadeInRight.delay(index * 80).duration(400).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [st.featuredCard, pressed && st.pressedScale]}
      >
        {/* Background gradient */}
        <LinearGradient
          colors={cat.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={st.glassOverlay} />

        {/* Decorative watermark */}
        <Ionicons
          name={cat.icon}
          size={40}
          color="rgba(255,255,255,0.07)"
          style={st.watermarkIcon}
        />

        {/* Countdown */}
        <CountdownChip iso={event.startDatetime} />

        {/* Content at bottom */}
        <View style={st.featuredContent}>
          <Text style={st.featuredTitle} numberOfLines={2}>
            {event.title}
          </Text>

          <View style={st.metaRow}>
            <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.55)" />
            <Text style={st.metaText} numberOfLines={1}>
              {event.location ?? "TBA"}
            </Text>
          </View>

          <ParticipantBar event={event} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* Event Card (vertical list) */
function EventCard({
  event,
  index,
  onPress,
}: {
  event: EventData;
  index: number;
  onPress: () => void;
}) {
  const cat = findCategory(event.category);
  const dateStr = formatDate(event.startDatetime);

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [st.card, pressed && st.pressedScaleSm]}
      >
        {/* Cover */}
        <View style={st.cardCover}>
          <LinearGradient
            colors={cat.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={st.glassOverlay} />

          {/* Category watermark */}
          <Ionicons
            name={cat.icon}
            size={56}
            color="rgba(255,255,255,0.08)"
            style={st.cardWatermark}
          />

          {/* Bottom fade */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={st.cardFade}
          />

          {/* Top highlight line */}
          <View style={st.cardHighlight} />

          {/* Countdown chip */}
          <CountdownChip
            iso={event.startDatetime}
            style={{
              top: 12,
              left: event.currentUserStatus ? 12 : undefined,
              right: event.currentUserStatus ? undefined : 12,
            }}
          />

          {/* Category badge */}
          {event.category ? (
            <View
              style={[
                st.categoryBadge,
                event.currentUserStatus
                  ? { top: 44, left: 12 }
                  : { top: 12, left: 12 },
              ]}
            >
              <Ionicons
                name={cat.icon}
                size={11}
                color="rgba(255,255,255,0.9)"
                style={{ marginRight: 4 }}
              />
              <Text style={st.categoryBadgeText}>{event.category}</Text>
            </View>
          ) : null}

          {/* Joined/interested indicator */}
          {event.currentUserStatus ? (
            <View style={st.joinedBadge}>
              <Ionicons
                name={event.currentUserStatus === "GOING" ? "checkmark-circle" : "star"}
                size={12}
                color="#FFF"
                style={{ marginRight: 3 }}
              />
              <Text style={st.joinedText}>
                {event.currentUserStatus === "GOING" ? "Apuntado" : "Interesado"}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Info */}
        <View style={st.cardInfo}>
          <Text style={st.cardTitle} numberOfLines={2}>
            {event.title}
          </Text>

          {/* Date row */}
          <View style={st.cardDateRow}>
            <View style={st.cardDateDot}>
              <Ionicons name="time-outline" size={12} color={colors.eu.star} />
            </View>
            <Text style={st.cardDateText}>{dateStr}</Text>
          </View>

          {/* Footer: location + participants */}
          <View style={st.cardFooter}>
            <View style={st.cardLocation}>
              <Ionicons name="location-outline" size={13} color={colors.text.secondary} />
              <Text style={st.cardLocationText} numberOfLines={1}>
                {event.location ?? "Sin ubicacion"}
              </Text>
            </View>

            <View style={st.participantPill}>
              <Ionicons name="people-outline" size={13} color={colors.text.secondary} />
              <Text style={st.participantPillText}>
                {event.participantCount}
                {event.maxParticipants ? `/${event.maxParticipants}` : ""}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* Skeleton loader */
function SkeletonCards() {
  return (
    <View style={st.skeletonWrap}>
      {[0, 1, 2].map((i) => (
        <Animated.View
          key={i}
          entering={FadeIn.delay(i * 120).duration(400)}
          style={st.skeletonCard}
        >
          <View style={st.skeletonCover} />
          <View style={st.skeletonBody}>
            <View style={[st.skeletonLine, { width: "70%" }]} />
            <View style={[st.skeletonLine, { width: "45%", marginTop: 8 }]} />
            <View style={[st.skeletonLine, { width: "55%", marginTop: 8 }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

// --- Main Screen ---

export default function EventsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  // State
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "attendees" | "nearby" | "week">("recent");

  // Data fetching
  const fetchEvents = useCallback(async (cat?: string, sort?: string) => {
    try {
      // TODO: Pasar sortBy al backend: GET /v1/events?category=...&sortBy=...
      const result = await eventsApi.getUpcomingEvents(cat || undefined, 0, 50);
      setEvents(result.content);
    } catch (e) {
      handleError(e, "Events.getUpcoming");
      setEvents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(selectedCategory, sortBy);
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      fetchEvents(selectedCategory, sortBy);
    });
    return unsub;
  }, [navigation, selectedCategory, sortBy]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents(selectedCategory, sortBy);
  }, [selectedCategory, sortBy]);

  const handleCategoryPress = useCallback((value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(value);
    setLoading(true);
  }, []);

  /** Top 5 soonest events -> featured carousel */
  const featured = useMemo(
    () =>
      [...events]
        .sort((a, b) => new Date(a.startDatetime).getTime() - new Date(b.startDatetime).getTime())
        .slice(0, 5),
    [events],
  );

  const navigateToEvent = useCallback(
    (id: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate("EventDetail", { eventId: id });
    },
    [navigation],
  );

  // Render
  return (
    <ScreenBackground>
      {/* Header */}
      <Animated.View
        entering={FadeIn.delay(50)}
        style={[st.header, { paddingTop: insets.top + spacing.sm }]}
      >
        <View>
          <Text style={st.headerTitle}>Eventos</Text>
          <Text style={st.headerSub}>Descubre lo que pasa</Text>
        </View>

        <View style={st.headerActions}>
          <Pressable
            style={({ pressed }) => [
              st.createBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.9 }] },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("CreateEvent");
            }}
          >
            <LinearGradient
              colors={["#FFD700", "#FF6B2B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={st.createBtnGrad}
            >
              <Ionicons name="add" size={22} color="#06081A" />
            </LinearGradient>
          </Pressable>
        </View>
      </Animated.View>

      {/* Category chips */}
      <View style={{ flexGrow: 0, paddingBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.chipRow}
          style={{ flexGrow: 0 }}
        >
          {CATEGORIES.map((cat, i) => {
          const active = selectedCategory === cat.value;
          return (
            <Animated.View
              key={cat.value || "__all"}
              entering={FadeInRight.delay(i * 40).duration(350)}
            >
              <CategoryTab
                label={cat.label}
                icon={cat.icon}
                active={active}
                onPress={() => handleCategoryPress(cat.value)}
              />
            </Animated.View>
          );
        })}
      </ScrollView>
      </View>

      {/* Content: loading / empty / data */}
      {loading ? (
        <SkeletonCards />
      ) : events.length === 0 ? (
        <View style={st.emptyWrap} pointerEvents="box-none">
          <EmptyState
            icon="calendar-outline"
            title="No hay eventos"
            message={"Crea uno y empieza la\nfiesta Erasmus!"}
            ctaLabel="Crear evento"
            ctaGradient
            onCtaPress={() => navigation.navigate("CreateEvent")}
            style={{ flex: 0 }}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={st.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.eu.star}
              colors={[colors.eu.star]}
            />
          }
        >
          {/* All events list */}
          {events.map((ev, i) => (
            <EventCard
              key={ev.id}
              event={ev}
              index={i}
              onPress={() => navigateToEvent(ev.id)}
            />
          ))}

          {/* Bottom safe area spacer */}
          <View style={{ height: insets.bottom + TAB_BAR_HEIGHT + 16 }} />
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

// --- Styles ---

const st = StyleSheet.create({
  /* Shared */
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  pressedScale: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  pressedScaleSm: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: typography.families.heading,
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: typography.families.body,
    color: "rgba(255,255,255,0.45)",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  inviteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  createBtn: {
    borderRadius: 20,
    overflow: "hidden",
  },
  createBtnGrad: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Category chips */
  chipRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 6,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  chipActive: {
    backgroundColor: colors.eu.star,
    borderColor: colors.eu.star,
  },
  chipLabel: {
    fontSize: 14,
    fontFamily: typography.families.bodyMedium,
    color: "rgba(255,255,255,0.65)",
  },
  chipLabelActive: {
    color: "#06081A",
    fontFamily: typography.families.subheading,
    fontWeight: "700",
  },

  /* Section header */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: typography.families.subheading,
    color: "#FFFFFF",
  },

  /* Featured carousel */
  carouselContent: {
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  featuredCard: {
    width: FEATURED_CARD_W,
    height: FEATURED_CARD_H,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
    position: "relative",
  },
  featuredContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  featuredTitle: {
    fontSize: 15,
    fontFamily: typography.families.subheading,
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    flex: 1,
  },
  watermarkIcon: {
    position: "absolute",
    right: 12,
    bottom: 12,
  },

  /* Countdown chip */
  countdownChip: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.25)",
  },
  countdownChipUrgent: {
    borderColor: "rgba(255,109,63,0.5)",
    backgroundColor: "rgba(255,109,63,0.15)",
  },
  countdownText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,215,0,0.9)",
  },
  countdownTextUrgent: {
    color: "#FF6D3F",
  },

  /* Participant bar */
  pBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  pBarFill: {
    height: 5,
    borderRadius: 3,
  },
  pBarLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    minWidth: 30,
    textAlign: "right",
  },

  /* Event card (vertical list) */
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radii.xl,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  cardCover: {
    height: COVER_H,
    position: "relative",
  },
  cardWatermark: {
    position: "absolute",
    right: 16,
    bottom: 16,
    opacity: 0.6,
  },
  cardFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  cardHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  categoryBadge: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    textTransform: "capitalize",
  },
  joinedBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,200,120,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,200,120,0.4)",
  },
  joinedText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFF",
  },
  cardInfo: {
    padding: spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: typography.families.subheading,
    color: "#FFFFFF",
    marginBottom: 6,
    lineHeight: 22,
  },
  cardDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardDateDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,215,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  cardDateText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLocation: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  cardLocationText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  participantPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  participantPillText: {
    fontSize: 11,
    color: colors.text.secondary,
    marginLeft: 4,
  },

  /* Empty state */
  emptyWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: TAB_BAR_HEIGHT,
  },

  /* Skeleton loading */
  skeletonWrap: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  skeletonCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  skeletonCover: {
    height: 120,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  skeletonBody: {
    padding: spacing.md,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  /* List content */
  listContent: {
    paddingTop: 4,
    paddingBottom: spacing.md,
  },

  /* Filter row */
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  filterChipActive: {
    borderColor: colors.eu.star,
    backgroundColor: colors.eu.star,
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: typography.families.body,
    color: colors.text.secondary,
  },
  filterChipTextActive: {
    color: colors.eu.deep,
    fontWeight: "600",
  },
});
