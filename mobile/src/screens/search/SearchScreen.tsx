import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as searchApi from "@/api/search";
import * as eventsApi from "@/api/events";
import { handleError } from "@/utils/errorHandler";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import { Ionicons } from "@expo/vector-icons";
import { Header, ScreenBackground } from "@/design-system/components";
import { colors, typography, spacing, radii, DS, TAB_BAR_HEIGHT } from "@/design-system/tokens";
import { CategoryTab } from "@/components";

interface UserResult {
  id: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  bio: string | null;
  destinationCity: string | null;
  destinationCountry: string | null;
}

interface EventResult {
  id: number;
  title: string;
  category?: string | null;
  startDatetime: string;
  location?: string | null;
  participantCount?: number;
}

type SearchTab = "all" | "people" | "events";

const TABS: { key: SearchTab; label: string; icon: React.ComponentProps<typeof Ionicons>["name"] }[] = [
  { key: "all", label: "Todo", icon: "search-outline" },
  { key: "people", label: "Personas", icon: "people-outline" },
  { key: "events", label: "Eventos", icon: "calendar-outline" },
];

const QUICK_FILTERS = [
  { label: "🇪🇸 España", type: "country" as const, value: "Spain" },
  { label: "🇫🇷 Francia", type: "country" as const, value: "France" },
  { label: "🇩🇪 Alemania", type: "country" as const, value: "Germany" },
  { label: "🇮🇹 Italia", type: "country" as const, value: "Italy" },
  { label: "🇵🇹 Portugal", type: "country" as const, value: "Portugal" },
  { label: "🇳🇱 Países Bajos", type: "country" as const, value: "Netherlands" },
];

export default function SearchScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [eventResults, setEventResults] = useState<EventResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setUserResults([]);
      setEventResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      try {
        const [usersRes, eventsRes] = await Promise.allSettled([
          searchApi.searchUsers({ destinationCity: query.trim(), page: 0, size: 20 }),
          eventsApi.getUpcomingEvents(undefined, 0, 20),
        ]);

        if (usersRes.status === "fulfilled") setUserResults(usersRes.value.content);
        if (eventsRes.status === "fulfilled") {
          const q = query.trim().toLowerCase();
          setEventResults(
            eventsRes.value.content.filter(
              (e: any) =>
                e.title?.toLowerCase().includes(q) ||
                e.location?.toLowerCase().includes(q) ||
                e.category?.toLowerCase().includes(q),
            ),
          );
        }
      } catch (e) {
        handleError(e, "Search.global");
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const totalResults = userResults.length + eventResults.length;

  const handleQuickFilter = useCallback(
    async (type: "country" | "city", value: string) => {
      setLoading(true);
      setSearched(true);
      setQuery(value);
      try {
        let data: UserResult[];
        if (type === "country") {
          data = await searchApi.findByCountry(value);
        } else {
          data = await searchApi.findByCity(value);
        }
        setUserResults(data);
        setEventResults([]);
      } catch (e) {
        handleError(e, "Search.quickFilter");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    setUserResults([]);
    setEventResults([]);
    setSearched(false);
  }, []);

  const renderUserCard = useCallback(
    (item: UserResult, index: number) => (
      <Animated.View key={`u-${item.id}`} entering={FadeInDown.delay(index * 50).duration(300)}>
        <View style={st.resultCard}>
          {item.profilePhotoUrl ? (
            <Image
              source={{ uri: resolveMediaUrl(item.profilePhotoUrl) }}
              style={st.resultAvatar}
            />
          ) : (
            <View style={[st.resultAvatar, st.resultAvatarPlaceholder]}>
              <Text style={st.resultInitial}>{item.firstName[0]?.toUpperCase()}</Text>
            </View>
          )}
          <View style={st.resultBody}>
            <Text style={st.resultName} numberOfLines={1}>
              {item.firstName} {item.lastName}
            </Text>
            {(item.destinationCity || item.destinationCountry) && (
              <View style={st.resultMetaRow}>
                <Ionicons name="location-outline" size={12} color={colors.eu.star} />
                <Text style={st.resultLocation} numberOfLines={1}>
                  {[item.destinationCity, item.destinationCountry].filter(Boolean).join(", ")}
                </Text>
              </View>
            )}
            {item.bio && (
              <Text style={st.resultBio} numberOfLines={1}>{item.bio}</Text>
            )}
          </View>
          <View style={st.resultTypeBadge}>
            <Ionicons name="person-outline" size={10} color={colors.eu.star} />
          </View>
        </View>
      </Animated.View>
    ),
    [],
  );

  const renderEventCard = useCallback(
    (item: EventResult, index: number) => {
      const dateStr = new Date(item.startDatetime).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <Animated.View key={`e-${item.id}`} entering={FadeInDown.delay(index * 50).duration(300)}>
          <View style={st.resultCard}>
            <View style={[st.resultAvatar, st.eventAvatarBg]}>
              <Ionicons name="calendar-outline" size={22} color={colors.eu.star} />
            </View>
            <View style={st.resultBody}>
              <Text style={st.resultName} numberOfLines={1}>{item.title}</Text>
              <View style={st.resultMetaRow}>
                <Ionicons name="time-outline" size={12} color={colors.eu.star} />
                <Text style={st.resultLocation}>{dateStr}</Text>
              </View>
              {item.location && (
                <View style={st.resultMetaRow}>
                  <Ionicons name="location-outline" size={12} color={colors.text.tertiary} />
                  <Text style={st.resultBio} numberOfLines={1}>{item.location}</Text>
                </View>
              )}
            </View>
            <View style={[st.resultTypeBadge, st.eventBadge]}>
              <Ionicons name="calendar-outline" size={10} color={colors.eu.orange} />
            </View>
          </View>
        </Animated.View>
      );
    },
    [],
  );

  return (
    <ScreenBackground>
      <Header title="Buscar" />

      {/* Search bar */}
      <View style={st.searchBar}>
        <Ionicons name="search-outline" size={20} color={colors.text.secondary} />
        <TextInput
          style={st.searchInput}
          placeholder="Personas, eventos, ciudades..."
          placeholderTextColor={colors.text.disabled}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={10}>
            <Text style={st.clearText}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Category tabs */}
      {searched && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.tabRow}
        >
          {TABS.map((tab, i) => {
            const active = activeTab === tab.key;
            const count =
              tab.key === "all"
                ? totalResults
                : tab.key === "people"
                  ? userResults.length
                  : eventResults.length;
            return (
              <Animated.View key={tab.key} entering={FadeInRight.delay(i * 40).duration(300)}>
                <CategoryTab
                  label={tab.label}
                  icon={tab.icon}
                  active={active}
                  count={count}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveTab(tab.key);
                  }}
                />
              </Animated.View>
            );
          })}
        </ScrollView>
      )}

      {/* Quick filters */}
      {!searched && (
        <View style={st.quickSection}>
          <Text style={st.quickTitle}>Explorar por país</Text>
          <View style={st.quickChips}>
            {QUICK_FILTERS.map((f) => (
              <Pressable
                key={f.value}
                style={st.quickChip}
                onPress={() => handleQuickFilter(f.type, f.value)}
              >
                <Text style={st.quickChipText}>{f.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={st.center}>
          <ActivityIndicator size="large" color={colors.eu.star} />
        </View>
      ) : searched && totalResults === 0 ? (
        <View style={st.center}>
          <View style={st.emptyCircle}>
            <Ionicons name="search-outline" size={40} color={colors.eu.star} />
          </View>
          <Text style={st.emptyText}>No se encontraron resultados</Text>
          <Text style={st.emptyHint}>Prueba con otra búsqueda</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + spacing.md }}
        >
          {(activeTab === "all" || activeTab === "people") && userResults.length > 0 && (
            <View>
              {activeTab === "all" && (
                <View style={st.sectionHeader}>
                  <Ionicons name="people-outline" size={15} color={colors.eu.star} />
                  <Text style={st.sectionTitle}>Personas</Text>
                  <Text style={st.sectionCount}>{userResults.length}</Text>
                </View>
              )}
              {userResults.map((u, i) => renderUserCard(u, i))}
            </View>
          )}

          {(activeTab === "all" || activeTab === "events") && eventResults.length > 0 && (
            <View>
              {activeTab === "all" && (
                <View style={st.sectionHeader}>
                  <Ionicons name="calendar-outline" size={15} color={colors.eu.orange} />
                  <Text style={st.sectionTitle}>Eventos</Text>
                  <Text style={st.sectionCount}>{eventResults.length}</Text>
                </View>
              )}
              {eventResults.map((e, i) => renderEventCard(e, i))}
            </View>
          )}
        </ScrollView>
      )}
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  /* Search */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radii.xl,
    backgroundColor: colors.glass.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.primary,
    marginLeft: spacing.sm,
  },
  clearText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },

  /* Quick filters */
  quickSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  quickTitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  quickChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  quickChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.glass.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
  },
  quickChipText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
  },

  /* Results */
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
  },
  resultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.glass.whiteMid,
  },
  resultAvatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  eventAvatarBg: {
    backgroundColor: "rgba(255,109,63,0.10)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultInitial: {
    fontFamily: typography.families.subheading,
    fontSize: 18,
    color: colors.text.primary,
  },
  resultBody: { flex: 1, marginLeft: spacing.md },
  resultName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: colors.text.primary,
  },
  resultMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  resultLocation: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  resultBio: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.disabled,
    marginTop: 2,
  },
  resultTypeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,215,0,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  eventBadge: {
    backgroundColor: "rgba(255,109,63,0.10)",
  },

  /* Tabs */
  tabRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    flexDirection: "row",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: typography.families.subheading,
    color: colors.text.primary,
    flex: 1,
  },
  sectionCount: {
    fontSize: 12,
    color: colors.text.tertiary,
  },

  /* Empty */
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,215,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.20)",
    marginBottom: spacing.md,
  },
  emptyText: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.secondary,
  },
  emptyHint: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
