/**
 * AnalyticsScreen — Análisis de gastos con gráficos
 * European Glass · Desglose por categoría, comparativas mensuales
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  colors,
  typography,
  spacing,
  radii,
  DS,
} from "@/design-system/tokens";
import { DonutChart } from "@/design-system/components";
import { financeApi } from "@/api/financeService";
import type { LedgerTransaction } from "@/types/finance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CategoryAnalytics {
  name: string;
  total: number;
  percentage: number;
  color: string;
  count: number;
}

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  "Comida": "restaurant",
  "Transporte": "bus",
  "Ocio": "game-controller",
  "Alojamiento": "home",
  "Estudios": "book",
  "Otro": "cube",
  "Restaurante": "restaurant",
  "Supermercado": "cart",
  "Taxi": "car",
};

const CATEGORY_COLORS = [
  "#F59E0B", "#F97316", "#EC4899", "#8B5CF6",
  "#3B82F6", "#10B981", "#06B6D4", "#6366F1",
  "#84CC16", "#EF4444",
];

export default function AnalyticsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().split("T")[0].slice(0, 7)
  );
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: transactions = [],
    isLoading,
    refetch,
  } = useQuery<LedgerTransaction[]>({
    queryKey: ["transactions"],
    queryFn: financeApi.getTransactions,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Analítica del mes actual
  const monthlyAnalytics = useMemo(() => {
    const monthTxs = transactions.filter((tx) =>
      tx.transactionDate.startsWith(selectedMonth) &&
      tx.transactionType === "EXPENSE"
    );

    const byCategory: Record<string, { total: number; count: number }> = {};
    let totalExpenses = 0;

    monthTxs.forEach((tx) => {
      if (!byCategory[tx.categoryName]) {
        byCategory[tx.categoryName] = { total: 0, count: 0 };
      }
      byCategory[tx.categoryName].total += Math.abs(tx.amount);
      byCategory[tx.categoryName].count += 1;
      totalExpenses += Math.abs(tx.amount);
    });

    const categories: CategoryAnalytics[] = Object.entries(byCategory)
      .map(([name, data], idx) => ({
        name,
        total: data.total,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total);

    return { categories, totalExpenses };
  }, [transactions, selectedMonth]);

  // Comparativa con mes anterior
  const monthComparison = useMemo(() => {
    const currentYear = parseInt(selectedMonth.split("-")[0]);
    const currentMonth = parseInt(selectedMonth.split("-")[1]);

    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }

    const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;

    const currentTxs = transactions.filter(
      (tx) =>
        tx.transactionDate.startsWith(selectedMonth) &&
        tx.transactionType === "EXPENSE"
    );
    const prevTxs = transactions.filter(
      (tx) =>
        tx.transactionDate.startsWith(prevMonthStr) &&
        tx.transactionType === "EXPENSE"
    );

    const currentTotal = currentTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const prevTotal = prevTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return { currentTotal, prevTotal, prevMonthStr };
  }, [transactions, selectedMonth]);

  const getIconForCategory = (
    categoryName: string
  ): React.ComponentProps<typeof Ionicons>["name"] => {
    return (CATEGORY_ICONS[categoryName] || "cube") as React.ComponentProps<
      typeof Ionicons
    >["name"];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatMonthLabel = (monthStr: string): string => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return new Intl.DateTimeFormat("es-ES", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-");
    let prevMonth = parseInt(month) - 1;
    let prevYear = parseInt(year);
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    setSelectedMonth(`${prevYear}-${String(prevMonth).padStart(2, "0")}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-");
    let nextMonth = parseInt(month) + 1;
    let nextYear = parseInt(year);
    if (nextMonth === 13) {
      nextMonth = 1;
      nextYear += 1;
    }
    const today = new Date();
    const maxMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const candidateMonth = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
    if (candidateMonth <= maxMonth) {
      setSelectedMonth(candidateMonth);
    }
  };

  const { categories, totalExpenses } = monthlyAnalytics;
  const { currentTotal, prevTotal } = monthComparison;
  const trend = currentTotal >= prevTotal ? "up" : "down";
  const trendDiff = Math.abs(currentTotal - prevTotal);
  const trendPercent = prevTotal > 0 ? (trendDiff / prevTotal) * 100 : 0;

  const generateInsights = (
    cats: CategoryAnalytics[],
    curr: number,
    prev: number,
    month: string
  ): Array<{ title: string; description: string; icon: any; color: string }> => {
    const insights: Array<{ title: string; description: string; icon: any; color: string }> = [];

    // Highest spending category
    if (cats.length > 0) {
      const highest = cats[0];
      insights.push({
        title: "Categoría principal",
        description: `Gastaste más en ${highest.name}: ${formatCurrency(highest.total)} (${highest.percentage.toFixed(0)}%)`,
        icon: "trending-up-outline",
        color: highest.color,
      });
    }

    // Trend insight
    if (trend === "up") {
      insights.push({
        title: "Gasto aumentó",
        description: `Este mes gastaste un ${trendPercent.toFixed(1)}% más que el mes anterior`,
        icon: "alert-circle-outline",
        color: colors.status.error,
      });
    } else if (trendPercent > 0) {
      insights.push({
        title: "Ahorro logrado",
        description: `¡Excelente! Gastaste un ${trendPercent.toFixed(1)}% menos que el mes anterior`,
        icon: "checkmark-circle-outline",
        color: colors.status.success,
      });
    }

    // Daily average
    const daysInMonth = new Date(parseInt(month.split("-")[0]), parseInt(month.split("-")[1]), 0).getDate();
    const dailyAvg = curr / daysInMonth;
    insights.push({
      title: "Promedio diario",
      description: `Gastas alrededor de ${formatCurrency(dailyAvg)} por día`,
      icon: "calendar-outline",
      color: colors.eu.star,
    });

    // Budget projection
    const today = new Date();
    const currentDay = today.getDate();
    const projectedMonth = (curr / currentDay) * daysInMonth;
    insights.push({
      title: "Proyección mensual",
      description: `Al ritmo actual, gastarás aproximadamente ${formatCurrency(projectedMonth)} este mes`,
      icon: "calculator-outline",
      color: "#3B82F6",
    });

    return insights;
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0F1535"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.eu.star}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.title}>Análisis</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <Pressable onPress={handlePrevMonth} hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={colors.eu.star} />
          </Pressable>
          <View style={styles.monthLabel}>
            <Text style={styles.monthText}>{formatMonthLabel(selectedMonth)}</Text>
          </View>
          <Pressable
            onPress={handleNextMonth}
            hitSlop={8}
            disabled={
              selectedMonth >=
              `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
            }
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={
                selectedMonth >=
                `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
                  ? colors.text.tertiary
                  : colors.eu.star
              }
            />
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator
            color={colors.eu.star}
            size="large"
            style={{ marginTop: 100 }}
          />
        ) : categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={56} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Sin gastos este mes</Text>
            <Text style={styles.emptySubtext}>
              No tienes gastos registrados en {formatMonthLabel(selectedMonth).toLowerCase()}
            </Text>
          </View>
        ) : (
          <>
            {/* Donut Chart Visualization */}
            <View style={styles.chartContainer}>
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={["rgba(26, 61, 232, 0.15)", "rgba(59, 107, 255, 0.08)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.chartContent}>
                <DonutChart
                  data={categories.map((cat) => ({
                    name: cat.name,
                    value: cat.total,
                    color: cat.color,
                    percentage: cat.percentage,
                  }))}
                  total={totalExpenses}
                />
              </View>
            </View>

            {/* Categories Breakdown */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Gastos por categoría</Text>
              {categories.map((cat, idx) => (
                <Animated.View
                  key={cat.name}
                  style={styles.categoryItem}
                  entering={FadeInDown.delay(idx * 50)}
                >
                  <View style={styles.categoryInfo}>
                    <View
                      style={[
                        styles.categoryColorDot,
                        { backgroundColor: cat.color },
                      ]}
                    />
                    <View style={styles.categoryDetails}>
                      <View style={styles.categoryNameRow}>
                        <Ionicons
                          name={getIconForCategory(cat.name)}
                          size={18}
                          color={cat.color}
                        />
                        <Text style={styles.categoryName}>{cat.name}</Text>
                      </View>
                      <Text style={styles.categoryCount}>
                        {cat.count} {cat.count === 1 ? "gasto" : "gastos"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.categoryStats}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(cat.total)}
                    </Text>
                    <Text style={styles.categoryPercentage}>
                      {cat.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Insights Section */}
            <View style={styles.insightsSection}>
              <Text style={styles.sectionTitle}>Insights</Text>
              {generateInsights(categories, currentTotal, prevTotal, selectedMonth).map((insight, idx) => (
                <Animated.View
                  key={idx}
                  style={styles.insightCard}
                  entering={FadeInDown.delay(idx * 50)}
                >
                  <View style={[styles.insightIcon, { backgroundColor: `${insight.color}20` }]}>
                    <Ionicons name={insight.icon} size={20} color={insight.color} />
                  </View>
                  <View style={styles.insightContent}>
                    <Text style={styles.insightTitle}>{insight.title}</Text>
                    <Text style={styles.insightDescription}>{insight.description}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Monthly Comparison */}
            <View style={styles.comparisonSection}>
              <Text style={styles.sectionTitle}>Comparación mensual</Text>
              <View style={styles.comparisonCard}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <LinearGradient
                  colors={["rgba(26, 61, 232, 0.15)", "rgba(59, 107, 255, 0.08)"]}
                  style={StyleSheet.absoluteFill}
                />

                <View style={styles.comparisonRow}>
                  <View style={styles.comparisonItem}>
                    <Text style={styles.comparisonLabel}>Este mes</Text>
                    <Text style={styles.comparisonValue}>
                      {formatCurrency(currentTotal)}
                    </Text>
                  </View>

                  <View style={styles.comparisonDivider} />

                  <View
                    style={[
                      styles.comparisonItem,
                      styles.comparisonTrend,
                    ]}
                  >
                    <View
                      style={[
                        styles.trendBadge,
                        {
                          backgroundColor:
                            trend === "up"
                              ? "rgba(239, 68, 68, 0.15)"
                              : "rgba(16, 185, 129, 0.15)",
                        },
                      ]}
                    >
                      <Ionicons
                        name={trend === "up" ? "arrow-up" : "arrow-down"}
                        size={16}
                        color={trend === "up" ? colors.status.error : colors.status.success}
                      />
                      <Text
                        style={[
                          styles.trendText,
                          {
                            color:
                              trend === "up"
                                ? colors.status.error
                                : colors.status.success,
                          },
                        ]}
                      >
                        {trendPercent.toFixed(1)}%
                      </Text>
                    </View>
                    <Text style={styles.comparisonLabel}>Vs. mes anterior</Text>
                    <Text style={styles.comparisonValue}>
                      {formatCurrency(prevTotal)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.comparisonMessage}>
                  {trend === "up"
                    ? `Gastaste ${formatCurrency(trendDiff)} más que el mes anterior`
                    : `Ahorraste ${formatCurrency(trendDiff)} respecto al mes anterior`}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.text.primary,
  },

  // Month Selector
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  monthLabel: {
    flex: 1,
    alignItems: "center",
  },
  monthText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
    textTransform: "capitalize",
  },

  // Chart
  chartContainer: {
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: spacing.lg,
  },
  chartContent: {
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  pieChart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.lg,
  },
  pieCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
    position: "relative",
  },
  pieSegment: {
    position: "absolute",
  },
  pieCenter: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DS.background,
    alignItems: "center",
    justifyContent: "center",
    top: 40,
    left: 40,
  },
  pieCenterLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
  },
  pieCenterValue: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },

  // Categories
  categoriesSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  categoryItem: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: spacing.sm,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryName: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  categoryCount: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  categoryStats: {
    gap: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radii.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: radii.full,
  },
  categoryAmount: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  categoryPercentage: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
  },

  // Insights
  insightsSection: {
    marginBottom: spacing.xl,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  insightDescription: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  // Comparison
  comparisonSection: {
    marginBottom: spacing.xl,
  },
  comparisonCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    padding: spacing.lg,
  },
  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  comparisonItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  comparisonTrend: {
    backgroundColor: "rgba(255,215,0,0.05)",
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  comparisonDivider: {
    width: 1,
    height: 60,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: spacing.lg,
  },
  comparisonLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
  },
  comparisonValue: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
  },
  trendText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.bodySmall.fontSize,
  },
  comparisonMessage: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },

  // Empty
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
  },
  emptySubtext: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    textAlign: "center",
    maxWidth: 300,
  },
});
