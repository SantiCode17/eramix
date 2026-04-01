import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as searchApi from "@/api/search";
import { handleError } from "@/utils/errorHandler";
import { Header } from "@/design-system";
import { colors, typography, spacing, radii } from "@/design-system/tokens";

interface UserResult {
  id: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  bio: string | null;
  destinationCity: string | null;
  destinationCountry: string | null;
}

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
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setSearched(true);
      try {
        const res = await searchApi.searchUsers({
          destinationCity: query.trim(),
          page: 0,
          size: 30,
        });
        setResults(res.content);
      } catch (e) {
        handleError(e, "Search.searchUsers");
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

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
        setResults(data);
      } catch (e) {
        handleError(e, "Search.quickFilter");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const renderItem = useCallback(({ item }: { item: UserResult }) => {
    return (
      <View style={styles.resultCard}>
        {item.profilePhotoUrl ? (
          <Image
            source={{ uri: item.profilePhotoUrl }}
            style={styles.resultAvatar}
          />
        ) : (
          <View style={[styles.resultAvatar, styles.resultAvatarPlaceholder]}>
            <Text style={styles.resultInitial}>
              {item.firstName[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.resultBody}>
          <Text style={styles.resultName} numberOfLines={1}>
            {item.firstName} {item.lastName}
          </Text>
          {(item.destinationCity || item.destinationCountry) && (
            <Text style={styles.resultLocation} numberOfLines={1}>
              📍{" "}
              {[item.destinationCity, item.destinationCountry]
                .filter(Boolean)
                .join(", ")}
            </Text>
          )}
          {item.bio && (
            <Text style={styles.resultBio} numberOfLines={1}>
              {item.bio}
            </Text>
          )}
        </View>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Buscar" />

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ciudad, país..."
          placeholderTextColor={colors.text.disabled}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery("");
              setResults([]);
              setSearched(false);
            }}
            hitSlop={10}
          >
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        )}
      </View>

      {/* Quick filters when no search */}
      {!searched && (
        <View style={styles.quickSection}>
          <Text style={styles.quickTitle}>Explorar por país</Text>
          <View style={styles.quickChips}>
            {QUICK_FILTERS.map((f) => (
              <Pressable
                key={f.value}
                style={styles.quickChip}
                onPress={() => handleQuickFilter(f.type, f.value)}
              >
                <Text style={styles.quickChipText}>{f.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.eu.star} />
        </View>
      ) : searched && results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>No se encontraron resultados</Text>
        </View>
      ) : (
        <FlashList
          data={results}
          keyExtractor={(u) => String(u.id)}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: insets.bottom + spacing.xl,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radii.xl,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.primary,
  },
  clearText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },

  // Quick filters
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
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  quickChipText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
  },

  // Results
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
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
  resultLocation: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  resultBio: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.disabled,
    marginTop: 2,
  },

  // Empty
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.secondary,
  },
});
