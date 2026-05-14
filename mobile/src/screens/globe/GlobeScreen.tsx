import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import InteractiveGlobe, {
  COUNTRY_FLAGS,
  type InteractiveGlobeRef,
} from "@/components/InteractiveGlobe";
import { useGlobeStore } from "@/store/useGlobeStore";
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  animation,
} from "@/design-system/tokens";
import type { CountryPin } from "@/types/globe";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.52;

// ── Continent color palette ──────────────────────────────────
const CONTINENT_COLORS: Record<string, string> = {
  // Europa
  Spain: "#E63946", Italy: "#FF6B35", France: "#457B9D",
  Germany: "#1D3557", Portugal: "#E9C46A", Netherlands: "#F4A261",
  Poland: "#E76F51", "Czech Republic": "#264653", Austria: "#2A9D8F",
  Denmark: "#E9C46A", Belgium: "#F4D35E", Finland: "#3A86FF",
  Ireland: "#57CC99", Sweden: "#FFBE0B", Greece: "#3D7EAA",
  Romania: "#7B2D8B", Hungary: "#FF595E", Croatia: "#4CC9F0",
  Norway: "#4361EE", Slovakia: "#E63946", Slovenia: "#2A9D8F",
  Bulgaria: "#FF6B35", Latvia: "#E63946", Lithuania: "#F4D35E",
  Estonia: "#3A86FF", Malta: "#FF595E", Cyprus: "#F4A261",
  Switzerland: "#E63946", Turkey: "#E63946", Serbia: "#4361EE",
  Iceland: "#3A86FF",
  // Africa & Middle East
  Morocco: "#E9C46A", Tunisia: "#E9C46A", Egypt: "#F4A261",
  Jordan: "#E9C46A", Lebanon: "#E63946", Israel: "#457B9D",
  "South Africa": "#2A9D8F", Kenya: "#57CC99", Senegal: "#E9C46A",
  Ghana: "#FFD700", Ethiopia: "#57CC99", Cameroon: "#57CC99",
  // Americas
  Mexico: "#E63946", Brazil: "#57CC99", Argentina: "#3A86FF",
  Colombia: "#FFD700", Chile: "#E63946", Peru: "#FF595E",
  Ecuador: "#F4D35E", "United States": "#457B9D", Canada: "#E63946",
  // Asia-Pacífico
  Japan: "#E63946", "South Korea": "#457B9D", China: "#E63946",
  India: "#FF6B35", Australia: "#FF6B35", "New Zealand": "#57CC99",
  Thailand: "#457B9D", Malaysia: "#E63946", Singapore: "#E63946",
  Vietnam: "#E63946", Indonesia: "#E63946",
  Georgia: "#E63946", Armenia: "#E63946",
  Kazakhstan: "#3A86FF", Uzbekistan: "#57CC99",
  Ukraine: "#457B9D", Moldova: "#3A86FF",
  Others: "#8FA3BC",
};

export default function GlobeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Store (individual selectors to avoid Hermes proxy issues)
  const countryPins     = useGlobeStore((s) => s.countryPins);
  const selectedCountry = useGlobeStore((s) => s.selectedCountry);
  const loading         = useGlobeStore((s) => s.loading);
  const error           = useGlobeStore((s) => s.error);
  const nightMode       = useGlobeStore((s) => s.nightMode);
  const autoRotate      = useGlobeStore((s) => s.autoRotate);
  const favorites       = useGlobeStore((s) => s.favoriteCountries);

  const fetchStats      = useGlobeStore((s) => s.fetchStats);
  const selectCountry   = useGlobeStore((s) => s.selectCountry);
  const clearSelection  = useGlobeStore((s) => s.clearSelection);
  const toggleNightMode = useGlobeStore((s) => s.toggleNightMode);
  const toggleAutoRotate = useGlobeStore((s) => s.toggleAutoRotate);
  const toggleFavorite  = useGlobeStore((s) => s.toggleFavorite);

  // Globe imperative ref
  const globeRef = useRef<InteractiveGlobeRef>(null);

  // UI state
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [activeTab, setActiveTab]         = useState<"universities" | "info">("universities");

  // Animations
  const panelAnim     = useRef(new Animated.Value(PANEL_HEIGHT + 80)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  // Fetch on mount (merges with static worldwide data)
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Sync auto-rotate / night mode with globe ref
  useEffect(() => { globeRef.current?.setAutoRotate(autoRotate); }, [autoRotate]);
  useEffect(() => { globeRef.current?.setNightMode(nightMode); }, [nightMode]);

  // Panel animation
  useEffect(() => {
    if (selectedCountry) {
      setActiveTab("universities");
      Animated.spring(panelAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 160,
        useNativeDriver: true,
      }).start();
      if (selectedCountry.latitude !== undefined) {
        globeRef.current?.flyTo(selectedCountry.latitude, selectedCountry.longitude);
      }
    } else {
      Animated.timing(panelAnim, {
        toValue: PANEL_HEIGHT + 80,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedCountry, panelAnim]);

  // Search animation
  useEffect(() => {
    if (searchVisible) {
      Animated.parallel([
        Animated.timing(searchOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(headerOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      setSearchQuery("");
      Animated.parallel([
        Animated.timing(searchOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(headerOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [searchVisible, searchOpacity, headerOpacity]);

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return countryPins
      .filter(
        (p) =>
          p.country.toLowerCase().includes(q) ||
          p.universities.some((u) => u.city.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [searchQuery, countryPins]);

  // Stats
  const totalStudents = useMemo(
    () => countryPins.reduce((s, p) => s + p.studentCount, 0),
    [countryPins],
  );
  const totalUniversities = useMemo(
    () => countryPins.reduce((s, p) => s + p.universities.length, 0),
    [countryPins],
  );

  // ── Handlers ──────────────────────────────────────
  const handlePinSelected = useCallback(
    (pin: CountryPin) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      selectCountry(pin);
    },
    [selectCountry],
  );

  const handleClosePanel = useCallback(() => clearSelection(), [clearSelection]);

  const handleToggleNightMode = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleNightMode();
  }, [toggleNightMode]);

  const handleToggleAutoRotate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleAutoRotate();
  }, [toggleAutoRotate]);

  const handleResetView = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    globeRef.current?.resetView();
    clearSelection();
  }, [clearSelection]);

  const handleToggleSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchVisible((v) => !v);
  }, []);

  const handleSelectFromSearch = useCallback(
    (pin: CountryPin) => {
      setSearchVisible(false);
      setSearchQuery("");
      selectCountry(pin);
    },
    [selectCountry],
  );

  const handleToggleFavorite = useCallback(
    (country: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleFavorite(country);
    },
    [toggleFavorite],
  );

  const handleOpenDrawer = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.dispatch(DrawerActions.openDrawer());
  }, [navigation]);

  const bgColors = nightMode
    ? (["#010208", "#020510"] as const)
    : (["#0a1628", "#061020"] as const);

  return (
    <View style={styles.container}>
      <LinearGradient colors={bgColors} style={StyleSheet.absoluteFill} />

      {/* Globe fills entire screen */}
      <View style={styles.globeContainer}>
        {loading && countryPins.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.eu.star} />
            <Text style={styles.loaderText}>Cargando el globo…</Text>
          </View>
        ) : (
          <InteractiveGlobe
            ref={globeRef}
            pins={countryPins}
            selectedCountry={selectedCountry}
            onPinSelected={handlePinSelected}
            nightMode={nightMode}
          />
        )}
      </View>

      {/* ── Top header area ── */}
      <View style={[styles.topArea, { paddingTop: insets.top }]}>
        {/* Title row */}
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          {/* Hamburger button — opens drawer */}
          <Pressable
            style={styles.hamburgerBtn}
            onPress={handleOpenDrawer}
            hitSlop={10}
          >
            <View style={styles.hamburgerLine} />
            <View style={[styles.hamburgerLine, styles.hamburgerLineMid]} />
            <View style={styles.hamburgerLine} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Explorar Erasmus</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {countryPins.length > 0
                ? `${countryPins.length} destinos · ${totalUniversities} universidades`
                : "Cargando…"}
            </Text>
          </View>

          <Pressable style={styles.iconBtn} onPress={handleToggleSearch} hitSlop={8}>
            <Ionicons name="search" size={20} color={colors.text.primary} />
          </Pressable>
        </Animated.View>

        {/* Search bar */}
        {searchVisible && (
          <Animated.View style={[styles.searchRow, { opacity: searchOpacity, top: insets.top }]}>
            <View style={styles.searchInputWrap}>
              <Ionicons name="search" size={16} color={colors.text.secondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Buscar país, ciudad o universidad…"
                placeholderTextColor={colors.text.secondary}
                autoFocus
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
                </Pressable>
              )}
            </View>
            <Pressable style={styles.searchCancel} onPress={handleToggleSearch}>
              <Text style={styles.searchCancelText}>Cancelar</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Search results dropdown */}
        {searchVisible && searchResults.length > 0 && (
          <Animated.View style={[styles.searchResults, { opacity: searchOpacity, top: insets.top + 56 }]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {searchResults.map((pin) => (
                <Pressable
                  key={pin.country}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectFromSearch(pin)}
                >
                  <Text style={styles.searchResultFlag}>{COUNTRY_FLAGS[pin.country] ?? "🌍"}</Text>
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultCountry}>{pin.country}</Text>
                    <Text style={styles.searchResultMeta}>
                      {pin.universities.length} univ. · {pin.studentCount.toLocaleString()} EraMixers
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* No results */}
        {searchVisible && searchQuery.length > 1 && searchResults.length === 0 && (
          <Animated.View style={[styles.searchResults, styles.searchNoResults, { opacity: searchOpacity, top: insets.top + 56 }]}>
            <Text style={styles.noResultsText}>Sin resultados para "{searchQuery}"</Text>
          </Animated.View>
        )}
      </View>

      {/* Stats bar */}
      {!selectedCountry && !searchVisible && countryPins.length > 0 && (
        <View style={[styles.statsBar, { top: insets.top + 72 }]}>
          <StatChip icon="earth" label={`${countryPins.length}`} sublabel="destinos" />
          <View style={styles.statsBarDivider} />
          <StatChip icon="school" label={totalUniversities.toString()} sublabel="univs." />
          <View style={styles.statsBarDivider} />
          <StatChip icon="people" label={totalStudents.toLocaleString()} sublabel="EraMixers" />
        </View>
      )}

      {/* Error banner */}
      {error && (
        <View style={[styles.errorBanner, { top: insets.top + 100 }]}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.status.error} />
          <Text style={styles.errorText} numberOfLines={2}>{error}</Text>
          <Pressable onPress={fetchStats} style={styles.retryBtn}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {/* FAB controls (right side) */}
      <View style={[styles.fabColumn, { top: insets.top + 100 }]}>
        <FABButton icon={nightMode ? "moon" : "sunny"} onPress={handleToggleNightMode} active={nightMode} />
        <FABButton icon="refresh"  onPress={handleToggleAutoRotate}  active={autoRotate} />
        <FABButton icon="locate"   onPress={handleResetView}          active={false} />
      </View>

      {/* Hint */}
      {!selectedCountry && !searchVisible && (
        <View style={[styles.hintRow, { bottom: insets.bottom + 16 }]}>
          <Text style={styles.hintText}>Arrastra · Pellizca · Toca un destino</Text>
        </View>
      )}

      {/* Country detail panel (bottom sheet) */}
      <Animated.View
        style={[
          styles.panel,
          {
            height: PANEL_HEIGHT,
            paddingBottom: insets.bottom + spacing.sm,
            transform: [{ translateY: panelAnim }],
          },
        ]}
        pointerEvents={selectedCountry ? "auto" : "none"}
      >
        {selectedCountry != null && (
          <CountryPanel
            pin={selectedCountry}
            isFavorite={favorites.includes(selectedCountry.country)}
            onClose={handleClosePanel}
            onToggleFavorite={handleToggleFavorite}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
      </Animated.View>
    </View>
  );
}
// ── Stat chip ────────────────────────────────────────

interface StatChipProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
}

function StatChip({ icon, label, sublabel }: StatChipProps) {
  return (
    <View style={scStyles.chip}>
      <Ionicons name={icon} size={13} color={colors.eu.star} />
      <Text style={scStyles.label}>{label}</Text>
      <Text style={scStyles.sublabel}>{sublabel}</Text>
    </View>
  );
}

const scStyles = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 4 },
  label: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.primary,
  },
  sublabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.secondary,
  },
});

// ── FAB button ────────────────────────────────────────

interface FABButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active: boolean;
}

function FABButton({ icon, onPress, active }: FABButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        fabStyles.btn,
        active && fabStyles.btnActive,
        pressed && fabStyles.btnPressed,
      ]}
      onPress={onPress}
      hitSlop={6}
    >
      <Ionicons name={icon} size={19} color={active ? colors.eu.star : colors.text.secondary} />
    </Pressable>
  );
}

const fabStyles = StyleSheet.create({
  btn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(10,22,40,0.85)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  btnActive: {
    backgroundColor: "rgba(255,215,0,0.12)",
    borderColor: colors.eu.star + "60",
  },
  btnPressed: { transform: [{ scale: 0.92 }], opacity: 0.8 },
});

// ── Country panel ────────────────────────────────────

interface CountryPanelProps {
  pin: CountryPin;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (country: string) => void;
  activeTab: "universities" | "info";
  onTabChange: (tab: "universities" | "info") => void;
}

function CountryPanel({
  pin,
  isFavorite,
  onClose,
  onToggleFavorite,
  activeTab,
  onTabChange,
}: CountryPanelProps): React.JSX.Element {
  const flag = COUNTRY_FLAGS[pin.country] ?? "🌍";
  const accentColor = CONTINENT_COLORS[pin.country] ?? colors.eu.star;

  const sortedUnis = useMemo(
    () => [...pin.universities].sort((a, b) => b.studentCount - a.studentCount),
    [pin.universities],
  );

  const topCity = useMemo(() => {
    const cityMap: Record<string, number> = {};
    pin.universities.forEach((u) => { cityMap[u.city] = (cityMap[u.city] ?? 0) + u.studentCount; });
    return Object.entries(cityMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [pin.universities]);

  return (
    <View style={cpStyles.root}>
      <View style={cpStyles.handle} />

      {/* Hero row */}
      <View style={cpStyles.heroRow}>
        <View style={[cpStyles.flagContainer, { borderColor: accentColor + "50" }]}>
          <Text style={cpStyles.flag}>{flag}</Text>
        </View>
        <View style={cpStyles.heroInfo}>
          <Text style={cpStyles.countryName}>{pin.country}</Text>
          <View style={cpStyles.badgeRow}>
            <View style={[cpStyles.badge, { backgroundColor: accentColor + "22", borderColor: accentColor + "44" }]}>
              <Ionicons name="people" size={11} color={accentColor} />
              <Text style={[cpStyles.badgeText, { color: accentColor }]}>{pin.studentCount} EraMixers</Text>
            </View>
            <View style={[cpStyles.badge]}>
              <Ionicons name="school" size={11} color={colors.eu.star} />
              <Text style={cpStyles.badgeText}>{pin.universities.length} univs.</Text>
            </View>
          </View>
        </View>
        <Pressable
          style={[cpStyles.favBtn, isFavorite && cpStyles.favBtnActive]}
          onPress={() => onToggleFavorite(pin.country)}
          hitSlop={8}
        >
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#FF4466" : colors.text.secondary} />
        </Pressable>
        <Pressable style={cpStyles.closeBtn} onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={18} color={colors.text.secondary} />
        </Pressable>
      </View>

      {/* Quick info row */}
      <View style={cpStyles.quickRow}>
        <QuickStat icon="location" label="Ciudad top" value={topCity} />
        <QuickStat icon="language" label="Idioma" value={getLang(pin.country)} />
        <QuickStat icon="wallet"   label="Coste vida" value={getCostShort(pin.country)} />
      </View>

      {/* Tabs */}
      <View style={cpStyles.tabRow}>
        <Pressable
          style={[cpStyles.tab, activeTab === "universities" && cpStyles.tabActive]}
          onPress={() => onTabChange("universities")}
        >
          <Text style={[cpStyles.tabText, activeTab === "universities" && cpStyles.tabTextActive]}>Universidades</Text>
        </Pressable>
        <Pressable
          style={[cpStyles.tab, activeTab === "info" && cpStyles.tabActive]}
          onPress={() => onTabChange("info")}
        >
          <Text style={[cpStyles.tabText, activeTab === "info" && cpStyles.tabTextActive]}>Información</Text>
        </Pressable>
      </View>

      {/* Tab content */}
      {activeTab === "universities" ? (
        <ScrollView style={cpStyles.scrollArea} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {sortedUnis.map((uni) => (
            <View key={uni.id} style={cpStyles.uniCard}>
              <View style={[cpStyles.uniRank, { backgroundColor: accentColor + "20" }]}>
                <Ionicons name="school" size={13} color={accentColor} />
              </View>
              <View style={cpStyles.uniInfo}>
                <Text style={cpStyles.uniName} numberOfLines={1}>{uni.name}</Text>
                <Text style={cpStyles.uniCity}>{uni.city}</Text>
              </View>
              <View style={cpStyles.uniBadge}>
                <Text style={cpStyles.uniBadgeNum}>{uni.studentCount}</Text>
                <Text style={cpStyles.uniBadgeLabel}>est.</Text>
              </View>
            </View>
          ))}
          {sortedUnis.length === 0 && <Text style={cpStyles.emptyText}>Aún no hay universidades en este país</Text>}
          <View style={{ height: 8 }} />
        </ScrollView>
      ) : (
        <ScrollView style={cpStyles.scrollArea} showsVerticalScrollIndicator={false}>
          <CountryInfoTab pin={pin} accentColor={accentColor} />
          <View style={{ height: 8 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ── Quick stat ────────────────────────────────────────

function QuickStat({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={qsStyles.root}>
      <Ionicons name={icon} size={14} color={colors.eu.star} />
      <Text style={qsStyles.value}>{value}</Text>
      <Text style={qsStyles.label}>{label}</Text>
    </View>
  );
}

const qsStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  value: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary,
  },
  label: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.secondary,
  },
});

// ── Country info tab ──────────────────────────────────

function CountryInfoTab({ pin, accentColor }: { pin: CountryPin; accentColor: string }) {
  const rows = [
    { icon: "people-outline"   as const, label: "Estudiantes EraMix", value: pin.studentCount.toString() },
    { icon: "school-outline"   as const, label: "Universidades",      value: pin.universities.length.toString() },
    { icon: "earth-outline"    as const, label: "Programa Erasmus+",  value: "Activo ✔" },
    { icon: "language-outline" as const, label: "Lengua oficial",     value: getLang(pin.country) },
    { icon: "wallet-outline"   as const, label: "Coste de vida",      value: getCostOfLiving(pin.country) },
    { icon: "sunny-outline"    as const, label: "Clima",              value: getClimate(pin.country) },
  ];

  return (
    <View style={itStyles.root}>
      {rows.map((row) => (
        <View key={row.label} style={itStyles.row}>
          <View style={[itStyles.iconWrap, { backgroundColor: accentColor + "18" }]}>
            <Ionicons name={row.icon} size={15} color={accentColor} />
          </View>
          <Text style={itStyles.label}>{row.label}</Text>
          <Text style={itStyles.value}>{row.value}</Text>
        </View>
      ))}
      <View style={itStyles.tipsBox}>
        <Text style={itStyles.tipsTitle}>💡 Consejo Erasmus</Text>
        <Text style={itStyles.tipsText}>{getErasmusTip(pin.country)}</Text>
      </View>
    </View>
  );
}

const itStyles = StyleSheet.create({
  root: { gap: spacing.xs },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  iconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  label: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  value: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.primary,
  },
  tipsBox: {
    marginTop: spacing.md,
    backgroundColor: "rgba(255,215,0,0.06)",
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 0.5,
    borderColor: "rgba(255,215,0,0.15)",
  },
  tipsTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
    marginBottom: spacing.xs,
  },
  tipsText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

// CountryPanel style sheet
const cpStyles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.lg },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginTop: spacing.sm, marginBottom: spacing.md,
  },
  heroRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm, gap: spacing.sm },
  flagContainer: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5, alignItems: "center", justifyContent: "center",
  },
  flag: { fontSize: 30 },
  heroInfo: { flex: 1 },
  countryName: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary, marginBottom: 4,
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
  },
  badgeText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.eu.star,
  },
  favBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)",
  },
  favBtnActive: { backgroundColor: "rgba(255,68,102,0.12)", borderColor: "rgba(255,68,102,0.3)" },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  quickRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.md, padding: 3, marginBottom: spacing.sm,
  },
  tab: { flex: 1, paddingVertical: spacing.sm - 2, alignItems: "center", borderRadius: radii.sm },
  tabActive: { backgroundColor: "rgba(255,255,255,0.10)" },
  tabText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize, color: colors.text.secondary,
  },
  tabTextActive: { fontFamily: typography.families.bodyMedium, color: colors.text.primary },
  scrollArea: { flex: 1 },
  uniCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.md, padding: spacing.sm + 2, marginBottom: spacing.xs,
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.07)",
  },
  uniRank: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: spacing.sm },
  uniInfo: { flex: 1 },
  uniName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize, color: colors.text.primary,
  },
  uniCity: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize, color: colors.text.secondary, marginTop: 2,
  },
  uniBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,204,0,0.10)",
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    marginLeft: spacing.sm, minWidth: 42,
  },
  uniBadgeNum: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.body.fontSize, color: colors.eu.star,
  },
  uniBadgeLabel: {
    fontFamily: typography.families.body, fontSize: 9, color: colors.text.secondary,
  },
  emptyText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize, color: colors.text.secondary,
    textAlign: "center", marginTop: spacing.lg,
  },
});

// ── Country data helpers ──────────────────────────────

function getLang(country: string): string {
  const map: Record<string, string> = {
    Spain: "Español", Italy: "Italiano", France: "Francés",
    Germany: "Alemán", Portugal: "Portugués", Netherlands: "Holandés",
    Poland: "Polaco", "Czech Republic": "Checo", Austria: "Alemán",
    Denmark: "Danés", Belgium: "Neerlandés", Finland: "Finés",
    Ireland: "Inglés", Sweden: "Sueco", Greece: "Griego",
    Romania: "Rumano", Hungary: "Húngaro", Croatia: "Croata",
    Norway: "Noruego", Slovakia: "Eslovaco", Slovenia: "Esloveno",
    Bulgaria: "Búlgaro", Latvia: "Letón", Lithuania: "Lituano",
    Estonia: "Estonio", Malta: "Maltés/Inglés", Cyprus: "Griego/Inglés",
    Switzerland: "Alemán/Francés/Ital.", Turkey: "Turco", Serbia: "Serbio",
    Iceland: "Islandés",
    Morocco: "Árabe/Francés", Tunisia: "Árabe/Francés", Egypt: "Árabe",
    Jordan: "Árabe", Lebanon: "Árabe/Francés", Israel: "Hebreo/Árabe",
    Mexico: "Español", Brazil: "Portugués", Argentina: "Español",
    Colombia: "Español", Chile: "Español", Peru: "Español",
    Ecuador: "Español", "United States": "Inglés", Canada: "Inglés/Francés",
    Japan: "Japonés", "South Korea": "Coreano", China: "Chino Mandarín",
    India: "Hindi/Inglés", Australia: "Inglés", "New Zealand": "Inglés/Maorí",
    Thailand: "Tailandés", Malaysia: "Malayo", Singapore: "Inglés/Chino",
    Vietnam: "Vietnamita", Indonesia: "Indonesio",
    Georgia: "Georgiano", Armenia: "Armenio",
    "South Africa": "Inglés/Afrikáans", Kenya: "Inglés/Suajili",
    Senegal: "Francés", Ghana: "Inglés", Ethiopia: "Amhárico",
    Cameroon: "Francés/Inglés", Ukraine: "Ucraniano", Moldova: "Rumano",
    Kazakhstan: "Kazajo/Ruso", Uzbekistan: "Uzbeko",
  };
  return map[country] ?? "Variado";
}

function getCostShort(country: string): string {
  const high = ["Norway", "Denmark", "Finland", "Sweden", "Ireland", "Netherlands",
                "Switzerland", "Singapore", "Australia", "New Zealand", "Iceland",
                "United States", "Canada", "Japan", "Israel"];
  const low  = ["Poland", "Czech Republic", "Hungary", "Romania", "Croatia", "Greece",
                "Bulgaria", "Latvia", "Lithuania", "Estonia", "Slovakia", "Serbia",
                "Morocco", "Tunisia", "Egypt", "Vietnam", "Indonesia", "India",
                "Thailand", "Malaysia", "Peru", "Ecuador", "Colombia", "Armenia",
                "Georgia", "Moldova", "Ukraine", "Kazakhstan", "Uzbekistan",
                "Ethiopia", "Kenya", "Senegal", "Ghana", "Cameroon"];
  if (high.includes(country)) return "Alto €€€";
  if (low.includes(country))  return "Bajo €";
  return "Medio €€";
}

function getCostOfLiving(country: string): string {
  const high = ["Norway", "Denmark", "Finland", "Sweden", "Ireland", "Netherlands",
                "Switzerland", "Singapore", "Australia", "New Zealand", "Iceland",
                "United States", "Canada", "Japan", "Israel"];
  const low  = ["Poland", "Czech Republic", "Hungary", "Romania", "Croatia", "Greece",
                "Bulgaria", "Latvia", "Lithuania", "Estonia", "Slovakia", "Serbia",
                "Morocco", "Tunisia", "Egypt", "Vietnam", "Indonesia", "India",
                "Thailand", "Malaysia", "Peru", "Ecuador", "Colombia", "Armenia",
                "Georgia", "Moldova", "Ukraine", "Kazakhstan", "Uzbekistan",
                "Ethiopia", "Kenya", "Senegal", "Ghana", "Cameroon"];
  if (high.includes(country)) return "Alto (€€€€)";
  if (low.includes(country))  return "Bajo (€)";
  return "Medio (€€)";
}

function getClimate(country: string): string {
  const warm = ["Spain", "Italy", "Greece", "Portugal", "Croatia", "Cyprus", "Malta",
                "Morocco", "Tunisia", "Turkey", "Mexico", "Colombia", "Ecuador",
                "Thailand", "Malaysia", "Singapore", "Vietnam", "Indonesia",
                "Kenya", "Ghana", "Senegal", "Cameroon", "Ethiopia"];
  const cold = ["Norway", "Finland", "Sweden", "Denmark", "Iceland", "Estonia",
                "Latvia", "Lithuania", "Canada"];
  const hot  = ["Egypt", "Jordan", "Lebanon", "Israel", "India"];
  if (warm.includes(country)) return "Mediterráneo / Tropical ☀️";
  if (cold.includes(country)) return "Frío ❄️";
  if (hot.includes(country))  return "Cálido / Árido 🌵";
  return "Templado 🌤️";
}

function getErasmusTip(country: string): string {
  const tips: Record<string, string> = {
    Spain: "Aprovecha las salidas, tapas y el ambiente universitario en ciudades como Sevilla o Valencia.",
    Italy: "Visita museos con tu carné estudiante. Roma, Florencia y Milán son imprescindibles.",
    France: "La CAF ofrece ayudas para el alquiler. Regístrate al llegar para ahorrar.",
    Germany: "El semesterbeitrag incluye transporte. Explora la ciudad en bicicleta.",
    Portugal: "Lisboa y Oporto tienen una gran comunidad Erasmus.",
    Netherlands: "Necesitas bicicleta. Regístrala en el municipio para evitar multas.",
    Poland: "Muy barata. El złoty te dará margen para viajar por Europa.",
    Greece: "Planifica viajes a las islas los fines de semana.",
    Japan: "Aprende unas frases básicas en japonés. El transporte en tren es increíble.",
    "South Korea": "Seúl tiene barrios estudiantiles vibrantes como Hongdae y Sinchon.",
    China: "Instala una VPN antes de llegar. Aprende a usar WeChat para todo.",
    Morocco: "Negocia en los mercados y practica el árabe o francés.",
    Turkey: "Estambul es un cruce de culturas. Explora barrios históricos como Karaköy.",
    Brazil: "El portugués brasileño es diferente al europeo, disfruta aprendiendo.",
    Mexico: "UNAM tiene uno de los campus más impresionantes del mundo.",
    "United States": "Cada ciudad es diferente. Aprovecha las actividades del campus.",
    Canada: "Montreal combina francés e inglés en una ciudad universitaria única.",
    Australia: "El sistema de salud OSHC cubre a estudiantes internacionales.",
    India: "Vacúnate y ten curiosidad — India cambiará tu visión del mundo.",
    Singapore: "Cara, pero segura y con conexiones aéreas excelentes al sudeste asiático.",
    "South Africa": "Explora la diversidad cultural. Ciudad del Cabo tiene campus espectaculares.",
  };
  return tips[country] ?? "Disfruta la experiencia, conoce gente de todo el mundo y sal de tu zona de confort.";
}


// ── Main screen styles ────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a1628" },
  globeContainer: { ...StyleSheet.absoluteFillObject },
  loaderContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#020408" },
  loaderText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  // Top area
  topArea: { position: "absolute", left: 0, right: 0, top: 0, zIndex: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(10,22,40,0.82)",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: 9,
  },
  hamburgerLine: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.text.primary,
  },
  hamburgerLineMid: { width: 13 },
  headerCenter: { flex: 1, paddingHorizontal: spacing.sm },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.text.primary,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "rgba(10,22,40,0.7)",
    alignItems: "center", justifyContent: "center",
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.12)",
  },
  // Stats bar
  statsBar: {
    position: "absolute",
    left: spacing.lg, right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(10,22,40,0.72)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm - 2,
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
    gap: spacing.md, zIndex: 15,
  },
  statsBarDivider: { width: 1, height: 14, backgroundColor: "rgba(255,255,255,0.12)" },
  // Error
  errorBanner: {
    position: "absolute",
    left: spacing.lg, right: spacing.lg,
    backgroundColor: "rgba(229,62,62,0.12)",
    borderRadius: radii.md, padding: spacing.md,
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    borderWidth: 0.5, borderColor: "rgba(229,62,62,0.3)",
    zIndex: 20,
  },
  errorText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.status.error,
  },
  retryBtn: {
    backgroundColor: "rgba(229,62,62,0.15)",
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radii.sm,
  },
  retryText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.status.error,
  },
  // FABs
  fabColumn: { position: "absolute", right: spacing.md, zIndex: 20, alignItems: "center" },
  // Hint
  hintRow: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 10 },
  hintText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: "rgba(255,255,255,0.28)",
    letterSpacing: 0.3,
  },
  // Search
  searchRow: {
    position: "absolute",
    left: spacing.lg, right: spacing.lg,
    flexDirection: "row", alignItems: "center",
    gap: spacing.sm, zIndex: 30,
  },
  searchInputWrap: {
    flex: 1, flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(15,25,50,0.97)",
    borderRadius: radii.lg, paddingHorizontal: spacing.md, height: 46,
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.15)", gap: spacing.sm,
  },
  searchIcon: { marginRight: 2 },
  searchInput: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    height: "100%",
    ...(Platform.OS === "android" ? { paddingVertical: 0 } : {}),
  },
  searchCancel: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  searchCancelText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
  },
  searchResults: {
    position: "absolute",
    left: spacing.lg, right: spacing.lg,
    backgroundColor: "rgba(12,20,40,0.97)",
    borderRadius: radii.lg, maxHeight: 280,
    borderWidth: 0.5, borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden", zIndex: 30,
  },
  searchNoResults: { padding: spacing.lg, alignItems: "center" },
  noResultsText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  searchResultItem: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
    borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.06)",
  },
  searchResultFlag: { fontSize: 22 },
  searchResultInfo: { flex: 1 },
  searchResultCountry: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize, color: colors.text.primary,
  },
  searchResultMeta: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize, color: colors.text.secondary, marginTop: 2,
  },
  // Bottom panel
  panel: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(10,16,32,0.97)",
    borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl,
    borderTopWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
    zIndex: 30,
  },
});
