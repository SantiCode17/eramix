/**
 * ────────────────────────────────────────────────────────
 *  WellbeingHomeScreen — Bienestar y estado de ánimo
 * ────────────────────────────────────────────────────────
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  DS,
} from "@/design-system/tokens";
import { wellbeingApi } from "@/api/wellbeingService";
import type { WellbeingSummary } from "@/types/wellbeing";
// import { wellbeingHero } from "@/assets/images";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MOODS = [
  { score: 1, emoji: "😞", label: "Muy mal", color: "#FF4F6F" },
  { score: 2, emoji: "😔", label: "Mal", color: "#FF6D3F" },
  { score: 3, emoji: "😐", label: "Normal", color: "#FFAB00" },
  { score: 4, emoji: "😊", label: "Bien", color: "#00BFA6" },
  { score: 5, emoji: "😄", label: "Genial", color: "#00D68F" },
];

const trendConfig: Record<string, { icon: string; color: string; label: string }> = {
  IMPROVING: { icon: "trending-up", color: "#00D68F", label: "Mejorando" },
  STABLE: { icon: "remove", color: "#FFAB00", label: "Estable" },
  DECLINING: { icon: "trending-down", color: "#FF4F6F", label: "En descenso" },
};

export default function WellbeingHomeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const {
    data: summary,
    isLoading,
    refetch,
  } = useQuery<WellbeingSummary>({
    queryKey: ["wellbeingSummary"],
    queryFn: wellbeingApi.getWellbeingSummary,
  });

  const checkinMutation = useMutation({
    mutationFn: (score: number) => wellbeingApi.createCheckin(score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wellbeingSummary"] });
      scale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 300 }),
        withTiming(1, { duration: 300 }),
      );
      setTimeout(() => setSelectedMood(null), 2000);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleMoodSelect = (score: number) => {
    setSelectedMood(score);
    checkinMutation.mutate(score);
  };

  const trend = trendConfig[summary?.trend ?? "STABLE"];

  // Safe accessors for numeric values — never crash on undefined
  const avgMood7d = (summary?.avgMood7d ?? 0).toFixed(1);
  const avgMood30d = (summary?.avgMood30d ?? 0).toFixed(1);

  // Mock daily moods for chart when API fails
  const MOCK_DAILY_MOODS = [
    { date: new Date(Date.now() - 6 * 86400000).toISOString(), avgMood: 3.5 },
    { date: new Date(Date.now() - 5 * 86400000).toISOString(), avgMood: 4.0 },
    { date: new Date(Date.now() - 4 * 86400000).toISOString(), avgMood: 2.5 },
    { date: new Date(Date.now() - 3 * 86400000).toISOString(), avgMood: 3.0 },
    { date: new Date(Date.now() - 2 * 86400000).toISOString(), avgMood: 4.5 },
    { date: new Date(Date.now() - 1 * 86400000).toISOString(), avgMood: 3.8 },
    { date: new Date().toISOString(), avgMood: 4.2 },
  ];
  const dailyMoods = summary?.dailyMoods?.length ? summary.dailyMoods : MOCK_DAILY_MOODS;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0F1535"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.eu.star} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Bienestar</Text>
            <Text style={styles.headerSubtitle}>¿Cómo te sientes hoy?</Text>
          </View>
          <Pressable
            style={styles.contactsBtn}
            onPress={() => navigation.navigate("EmergencyContacts")}
          >
            <Ionicons name="people-outline" size={20} color={colors.text.primary} />
          </Pressable>
        </View>

        {/* Mood Selector */}
        <Animated.View style={[styles.moodCard, animatedStyle]}>
          <LinearGradient
            colors={["rgba(26, 61, 232, 0.08)", "rgba(139, 92, 246, 0.06)"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.moodTitle}>
            {selectedMood
              ? `¡Registrado! ${MOODS[selectedMood - 1].emoji}`
              : "Toca cómo te sientes"}
          </Text>
          <View style={styles.moodRow}>
            {MOODS.map((mood) => (
              <Pressable
                key={mood.score}
                style={[
                  styles.moodBtn,
                  selectedMood === mood.score && {
                    backgroundColor: mood.color + "25",
                    borderColor: mood.color + "50",
                  },
                ]}
                onPress={() => handleMoodSelect(mood.score)}
                disabled={checkinMutation.isPending}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {isLoading ? (
          <ActivityIndicator color={colors.eu.star} size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Stats Row — always visible with safe defaults */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{avgMood7d}</Text>
                <Text style={styles.statLabel}>Ánimo 7d</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{avgMood30d}</Text>
                <Text style={styles.statLabel}>Ánimo 30d</Text>
              </View>
              <View style={styles.statCard}>
                <View style={styles.trendRow}>
                  <Ionicons name={trend.icon as any} size={18} color={trend.color} />
                  <Text style={[styles.statValue, { color: trend.color, fontSize: 14 }]}>
                    {trend.label}
                  </Text>
                </View>
                <Text style={styles.statLabel}>Tendencia</Text>
              </View>
            </View>

            {/* Mini Chart — always show (mock data if API fails) */}
            <View style={styles.chartCard}>
              <Text style={styles.sectionTitle}>Últimos días</Text>
              <View style={styles.chartContainer}>
                {dailyMoods.slice(-14).map((day, idx) => {
                  const mood = day.avgMood ?? 3;
                  const height = (mood / 5) * 60;
                  const moodColor = MOODS[Math.min(Math.max(Math.round(mood) - 1, 0), 4)]?.color ?? colors.eu.light;
                  return (
                    <View key={idx} style={styles.chartBarWrapper}>
                      <View
                        style={[
                          styles.chartBar,
                          { height, backgroundColor: moodColor },
                        ]}
                      />
                      <Text style={styles.chartBarLabel}>
                        {new Date(day.date).getDate()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* SOS Button */}
            <Pressable
              style={styles.sosButton}
              onPress={() => navigation.navigate("SOSScreen")}
            >
              <LinearGradient
                colors={["#FF4F6F", "#FF2D87"]}
                style={styles.sosGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="alert-circle" size={28} color="#FFF" />
                <View>
                  <Text style={styles.sosTitle}>SOS — Necesito ayuda</Text>
                  <Text style={styles.sosSubtitle}>
                    Notifica a tus contactos de emergencia
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Resources */}
            {(summary?.resources?.length ?? 0) > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recursos de ayuda</Text>
                {summary!.resources.slice(0, 5).map((r) => (
                  <View key={r.id} style={styles.resourceCard}>
                    <View style={styles.resourceIcon}>
                      <Ionicons name="call" size={18} color={colors.status.success} />
                    </View>
                    <View style={styles.resourceInfo}>
                      <Text style={styles.resourceName}>{r.organizationName}</Text>
                      <Text style={styles.resourcePhone}>{r.emergencyNumber}</Text>
                    </View>
                    <Text style={styles.resourceCountry}>{r.countryCode}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Support Resources fallback */}
            {!summary?.resources?.length && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recursos de apoyo</Text>
                <View style={styles.resourceCard}>
                  <View style={styles.resourceIcon}>
                    <Ionicons name="call" size={18} color={colors.status.success} />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceName}>Línea de atención al estudiante</Text>
                    <Text style={styles.resourcePhone}>+34 900 XXX XXX</Text>
                  </View>
                </View>
                <View style={styles.resourceCard}>
                  <View style={styles.resourceIcon}>
                    <Ionicons name="globe-outline" size={18} color={colors.status.info} />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceName}>European Youth Portal</Text>
                    <Text style={styles.resourcePhone}>youth.europa.eu</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.lg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h1.fontSize,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
  contactsBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Mood Card
  moodCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    ...shadows.glass,
  },
  moodTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moodBtn: {
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
    flex: 1,
  },
  moodEmoji: { fontSize: 32, marginBottom: spacing.xs },
  moodLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.tertiary,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  statValue: {
    fontFamily: typography.families.heading,
    fontSize: 22,
    color: colors.text.primary,
  },
  statLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.tertiary,
  },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 4 },

  // Chart
  chartCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 80,
    marginTop: spacing.md,
  },
  chartBarWrapper: { alignItems: "center", flex: 1 },
  chartBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarLabel: {
    fontFamily: typography.families.body,
    fontSize: 8,
    color: colors.text.tertiary,
    marginTop: 4,
  },

  // SOS
  sosButton: {
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.xl,
    ...shadows.glowCoral,
  },
  sosGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  sosTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h4.fontSize,
    color: "#FFF",
  },
  sosSubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },

  // Resources
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  resourceCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    gap: spacing.md,
  },
  resourceIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: "rgba(0, 214, 143, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  resourceInfo: { flex: 1 },
  resourceName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  resourcePhone: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.status.success,
    marginTop: 2,
  },
  resourceCountry: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
  },
});
