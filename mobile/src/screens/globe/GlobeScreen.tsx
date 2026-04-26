import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import InteractiveGlobe, {
  COUNTRY_FLAGS,
} from "@/components/InteractiveGlobe";
import { useGlobeStore } from "@/store/useGlobeStore";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import type { CountryPin } from "@/types/globe";
import { pluralize } from "@/utils/pluralize";
// import { globeDecoracion } from "@/assets/images";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.42;

/**
 * GlobeScreen — Interactive 3D Earth with country pins showing
 * Erasmus student distribution. Tapping a pin opens a bottom
 * sheet with country details and university list.
 */
export default function GlobeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const {
    countryPins,
    selectedCountry,
    loading,
    error,
    fetchStats,
    selectCountry,
    clearSelection,
  } = useGlobeStore();

  const [nightAmount, setNightAmount] = useState(0);
  const [panelAnim] = useState(() => new Animated.Value(PANEL_HEIGHT + 50));
  const isPanelOpen = useRef(false);

  // Fetch data on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Animate panel on selection
  useEffect(() => {
    if (selectedCountry) {
      isPanelOpen.current = true;
      Animated.spring(panelAnim, {
        toValue: 0,
        damping: 18,
        stiffness: 140,
        useNativeDriver: true,
      }).start();
    } else {
      isPanelOpen.current = false;
      Animated.timing(panelAnim, {
        toValue: PANEL_HEIGHT + 50,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedCountry, panelAnim]);

  const handlePinSelected = useCallback(
    (pin: CountryPin) => {
      selectCountry(pin);
    },
    [selectCountry],
  );

  const handleClosePanel = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleDayNightChange = useCallback((amount: number) => {
    setNightAmount(amount);
  }, []);

  // Dynamic background colors based on day/night
  const bgStart = lerpColor("#0a1628", "#020408", nightAmount);
  const bgEnd = lerpColor("#081020", "#010205", nightAmount);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[bgStart, bgEnd]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative overlay */}
      <View style={styles.decorWrap} pointerEvents="none">
        {/* <Image
          source={globeDecoracion}
          style={styles.decorImage}
          resizeMode="contain"
        /> */}
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.headerTitle}>Explorar</Text>
        <Text style={styles.headerSubtitle}>
          {countryPins.length > 0
            ? `${pluralize(countryPins.length, "país", "países")} · ${pluralize(
                countryPins.reduce((s, p) => s + p.studentCount, 0),
                "estudiante",
                "estudiantes",
              )}`
            : "Cargando datos…"}
        </Text>
      </View>

      {/* Globe */}
      <View style={styles.globeContainer}>
        {loading && countryPins.length === 0 ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.eu.star} />
            <Text style={styles.loaderText}>Cargando globo…</Text>
          </View>
        ) : (
          <InteractiveGlobe
            pins={countryPins}
            onPinSelected={handlePinSelected}
            onDayNightChange={handleDayNightChange}
          />
        )}
      </View>

      {/* Error message */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}><Ionicons name="alert-circle-outline" size={14} color={colors.status.error} /> {error}</Text>
          <Pressable onPress={fetchStats}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {/* Zoom hint */}
      <View style={[styles.hintContainer, { bottom: insets.bottom + 16 }]}>
        <Text style={styles.hintText}>
          Arrastra para rotar · Pellizca para zoom · Toca un pin
        </Text>
      </View>

      {/* Country info bottom sheet */}
      <Animated.View
        style={[
          styles.panel,
          {
            height: PANEL_HEIGHT,
            paddingBottom: insets.bottom + spacing.md,
            transform: [{ translateY: panelAnim }],
          },
        ]}
      >
        {selectedCountry && (
          <CountryPanel
            pin={selectedCountry}
            onClose={handleClosePanel}
          />
        )}
      </Animated.View>
    </View>
  );
}

// ── Country info panel content ──────────────────────

interface CountryPanelProps {
  pin: CountryPin;
  onClose: () => void;
}

function CountryPanel({ pin, onClose }: CountryPanelProps): React.JSX.Element {
  const flag = COUNTRY_FLAGS[pin.country] ?? "🏳️";

  return (
    <View style={styles.panelContent}>
      {/* Handle bar */}
      <View style={styles.handleBar} />

      {/* Header row */}
      <View style={styles.panelHeader}>
        <View style={styles.panelTitleRow}>
          <Text style={styles.panelFlag}>{flag}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.panelCountry}>{pin.country}</Text>
            <Text style={styles.panelStudentCount}>
              {pin.studentCount}{" "}
              {pin.studentCount === 1 ? "estudiante" : "estudiantes"} EraMix
            </Text>
          </View>
        </View>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      {/* Universities list */}
      <Text style={styles.sectionTitle}>Universidades</Text>
      <ScrollView
        style={styles.uniList}
        showsVerticalScrollIndicator={false}
      >
        {pin.universities.map((uni) => (
          <View key={uni.id} style={styles.uniCard}>
            <View style={styles.uniInfo}>
              <Text style={styles.uniName} numberOfLines={1}>
                {uni.name}
              </Text>
              <Text style={styles.uniCity}>{uni.city}</Text>
            </View>
            <View style={styles.uniBadge}>
              <Text style={styles.uniBadgeText}>
                {uni.studentCount}
              </Text>
              <Text style={styles.uniBadgeLabel}>
                {uni.studentCount === 1 ? "est." : "est."}
              </Text>
            </View>
          </View>
        ))}
        {pin.universities.length === 0 && (
          <Text style={styles.emptyText}>
            Aún no hay universidades registradas en este país
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

// ── Color interpolation helper ──────────────────────

function lerpColor(a: string, b: string, t: number): string {
  const clamp = Math.max(0, Math.min(1, t));
  const parse = (hex: string) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  };
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  const r = Math.round(ar + (br - ar) * clamp);
  const g = Math.round(ag + (bg - ag) * clamp);
  const bv = Math.round(ab + (bb - ab) * clamp);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bv.toString(16).padStart(2, "0")}`;
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorWrap: {
    position: "absolute",
    top: 40,
    right: -20,
    width: 120,
    height: 120,
    opacity: 0.15,
    zIndex: 1,
  },
  decorImage: {
    width: "100%",
    height: "100%",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  globeContainer: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorBanner: {
    position: "absolute",
    top: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: "rgba(244,67,54,0.15)",
    borderRadius: radii.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(244,67,54,0.3)",
  },
  errorText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.status.error,
    flex: 1,
  },
  retryText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
    marginLeft: spacing.md,
  },
  hintContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  hintText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: "rgba(255,255,255,0.35)",
  },

  // ── Panel ──────────────────────────────────────
  panel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15, 15, 30, 0.95)",
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    ...shadows.glass,
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  panelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
  },
  panelFlag: {
    fontSize: 40,
  },
  panelCountry: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
  },
  panelStudentCount: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
    marginTop: spacing.xxs,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  uniList: {
    flex: 1,
  },
  uniCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  uniInfo: {
    flex: 1,
  },
  uniName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.primary,
  },
  uniCity: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  uniBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,204,0,0.12)",
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: spacing.sm,
  },
  uniBadgeText: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.eu.star,
  },
  uniBadgeLabel: {
    fontFamily: typography.families.body,
    fontSize: 9,
    color: colors.text.secondary,
  },
  emptyText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
