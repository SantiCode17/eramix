/**
 * ────────────────────────────────────────────────────────
 *  FinanceHomeScreen — Dashboard financiero Erasmus
 * ────────────────────────────────────────────────────────
 */

import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  DS,
} from "@/design-system/tokens";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { financeApi } from "@/api/financeService";
import type { FinancialSummary, LedgerTransaction } from "@/types/finance";
// import { financeHero } from "@/assets/images";

export default function FinanceHomeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const {
    data: summary,
    isLoading: loadingSummary,
    refetch: refetchSummary,
  } = useQuery<FinancialSummary>({
    queryKey: ["financeSummary"],
    queryFn: financeApi.getFinancialSummary,
  });

  const {
    data: transactions,
    isLoading: loadingTx,
    refetch: refetchTx,
  } = useQuery<LedgerTransaction[]>({
    queryKey: ["transactions"],
    queryFn: financeApi.getTransactions,
  });

  const {
    data: pendingAlertsCount = 0,
    refetch: refetchAlertsCount,
  } = useQuery<number>({
    queryKey: ["pendingAlertsCount"],
    queryFn: financeApi.getPendingAlertsCount,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchSummary(), refetchTx(), refetchAlertsCount()]);
    } catch (error) {
      console.warn("[Finance] Re-fetch failed:", error);
    }
    setRefreshing(false);
  }, [refetchSummary, refetchTx, refetchAlertsCount]);

  const isLoading = loadingSummary || loadingTx;
  const loadingTimedOut = useLoadingTimeout(isLoading, 8000);

  const formatCurrency = (amount: number | null | undefined, currency = "EUR") => {
    if (amount === null || amount === undefined || isNaN(amount)) return "€0,00";
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getDaysLeftInMonth = (): number => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return lastDay.getDate() - now.getDate();
  };

  const getMonthlyBudgetProgress = (): { percentage: number; daysLeft: number } => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dayOfMonth = now.getDate();
    const percentage = (dayOfMonth / daysInMonth) * 100;
    const daysLeft = daysInMonth - dayOfMonth;
    return { percentage, daysLeft };
  };

  const { percentage: monthProgress, daysLeft } = getMonthlyBudgetProgress();

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
            <Text style={styles.headerTitle}>Finanzas</Text>
            <Text style={styles.headerSubtitle}>Tu presupuesto Erasmus</Text>
          </View>
          <View style={styles.headerButtons}>
            <Pressable
              style={styles.settingsButton}
              onPress={() => navigation.navigate("FinanceSettings")}
            >
              <Ionicons name="settings" size={22} color="#FFD700" />
            </Pressable>
            <Pressable
              style={styles.addButton}
              onPress={() => navigation.navigate("AddTransaction")}
            >
              <LinearGradient
                colors={colors.gradient.accent}
                style={styles.addButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="add" size={24} color={colors.text.inverse} />
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* Hero Banner */}
        {/* Removed empty hero to avoid blank space */}

        {isLoading && !loadingTimedOut ? (
          <ActivityIndicator color={colors.eu.star} size="large" style={{ marginTop: 80 }} />
        ) : (
          <>
            {/* Balance Card — always visible with fallback */}
            <View style={styles.balanceCard}>
              <BlurView intensity={30} tint="dark" style={styles.balanceBlur}>
                <LinearGradient
                  colors={["rgba(26, 61, 232, 0.15)", "rgba(59, 107, 255, 0.08)"]}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.balanceLabel}>Balance disponible</Text>
                <Text style={styles.balanceAmount}>
                  {summary ? formatCurrency(summary.balance, summary.baseCurrency || "EUR") : "€0,00"}
                </Text>

                {summary ? (
                  <>
                    <View style={styles.balanceRow}>
                      <View style={styles.balanceStat}>
                        <Ionicons name="arrow-up-circle" size={18} color={colors.status.success} />
                        <Text style={styles.balanceStatLabel}>Ingresos</Text>
                        <Text style={[styles.balanceStatValue, { color: colors.status.success }]}>
                          {formatCurrency(summary.totalIncome)}
                        </Text>
                      </View>
                      <View style={styles.balanceDivider} />
                      <View style={styles.balanceStat}>
                        <Ionicons name="arrow-down-circle" size={18} color={colors.status.error} />
                        <Text style={styles.balanceStatLabel}>Gastos</Text>
                        <Text style={[styles.balanceStatValue, { color: colors.status.error }]}>
                          {formatCurrency(summary.totalExpenses)}
                        </Text>
                      </View>
                    </View>

                    {/* Monthly Progress Bar */}
                    <View style={styles.monthlyProgressSection}>
                      <View style={styles.monthlyProgressHeader}>
                        <Text style={styles.monthlyProgressLabel}>Progreso del mes</Text>
                        <Text style={styles.daysLeftBadge}>{daysLeft} días</Text>
                      </View>
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${Math.min(monthProgress, 100)}%`,
                              backgroundColor:
                                monthProgress > 80
                                  ? colors.status.error
                                  : monthProgress > 50
                                  ? colors.status.warning
                                  : colors.eu.star,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.round(monthProgress)}% del mes transcurrido
                      </Text>
                    </View>

                    {/* Burn Rate */}
                    <View style={styles.burnRateContainer}>
                      <Ionicons name="flame-outline" size={16} color={colors.eu.star} />
                      <Text style={styles.burnRateText}>
                        {formatCurrency(summary.burnRatePerDay)}/día · ~{summary.estimatedDaysLeft} días restantes
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.balanceHint}>
                    Sin presupuesto configurado — Añade tu primera transacción
                  </Text>
                )}
              </BlurView>
            </View>

            {/* Alerts */}
            {summary?.alerts && summary.alerts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Alertas</Text>
                {summary.alerts
                  .filter((a) => !a.isAcknowledged)
                  .slice(0, 3)
                  .map((alert) => (
                    <Pressable
                      key={alert.id}
                      style={styles.alertCard}
                      onPress={() => financeApi.acknowledgeAlert(alert.id)}
                    >
                      <View style={styles.alertIcon}>
                        <Ionicons
                          name="warning"
                          size={20}
                          color={colors.status.warning}
                        />
                      </View>
                      <Text style={styles.alertText} numberOfLines={2}>
                        {alert.message}
                      </Text>
                      <Ionicons
                        name="close-circle-outline"
                        size={20}
                        color={colors.text.tertiary}
                      />
                    </Pressable>
                  ))}
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <Pressable
                style={styles.quickAction}
                onPress={() => navigation.navigate("GrantsOverview")}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(255,215,0,0.10)" }]}>
                  <Ionicons name="school" size={22} color="#FFD700" />
                </View>
                <Text style={styles.quickActionLabel}>Becas</Text>
              </Pressable>
              <Pressable
                style={styles.quickAction}
                onPress={() => navigation.navigate("TransactionHistory")}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(255,215,0,0.10)" }]}>
                  <Ionicons name="list" size={22} color="#FFD700" />
                </View>
                <Text style={styles.quickActionLabel}>Historial</Text>
              </Pressable>
              <Pressable
                style={styles.quickAction}
                onPress={() => navigation.navigate("Analytics")}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: "rgba(255,215,0,0.10)" }]}>
                  <Ionicons name="analytics" size={22} color="#FFD700" />
                </View>
                <Text style={styles.quickActionLabel}>Análisis</Text>
              </Pressable>
            </View>

            {/* Budget — Wide Button */}
            <Pressable
              style={styles.budgetWideButton}
              onPress={() => navigation.navigate("Budgets")}
            >
              <LinearGradient
                colors={["rgba(255,215,0,0.12)", "rgba(255,215,0,0.04)"]}
                style={styles.budgetWideGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.budgetWideLeft}>
                  <View style={styles.budgetWideIcon}>
                    <Ionicons name="wallet" size={24} color="#FFD700" />
                  </View>
                  <View>
                    <Text style={styles.budgetWideTitle}>Presupuestos</Text>
                    <Text style={styles.budgetWideSubtitle}>Gestiona y controla tus límites de gasto</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,215,0,0.6)" />
              </LinearGradient>
            </Pressable>

            {/* Recent Transactions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Últimas transacciones</Text>
                <Pressable onPress={() => navigation.navigate("TransactionHistory")}>
                  <Text style={styles.seeAll}>Ver todo</Text>
                </Pressable>
              </View>

              {transactions && transactions.length > 0 ? (
                transactions.slice(0, 8).map((tx) => {
                  // If categoryIcon is an Ionicons name (contains "-"), render as icon; else as emoji
                  const isIoniconName = tx.categoryIcon && tx.categoryIcon.includes("-");
                  return (
                  <Pressable 
                    key={tx.id} 
                    style={styles.txItem}
                    onPress={() =>
                      navigation.navigate("TransactionDetail", { transaction: tx })
                    }
                  >
                    <View style={styles.txIconContainer}>
                      {isIoniconName ? (
                        <Ionicons name={tx.categoryIcon as any} size={20} color="#FFD700" />
                      ) : (
                        <Text style={styles.txIcon}>{tx.categoryIcon || "💳"}</Text>
                      )}
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txDescription} numberOfLines={1}>
                        {tx.description}
                      </Text>
                      <Text style={styles.txCategory}>{tx.categoryName}</Text>
                    </View>
                    <Text
                      style={[
                        styles.txAmount,
                        { color: tx.amount >= 0 ? colors.status.success : colors.status.error },
                      ]}
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {formatCurrency(tx.amount, tx.currency)}
                    </Text>
                  </Pressable>
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={48} color={colors.text.tertiary} />
                  <Text style={styles.emptyText}>Sin transacciones aún</Text>
                  <Text style={styles.emptySubtext}>
                    Añade tu primera transacción para empezar a controlar tus gastos
                  </Text>
                </View>
              )}
            </View>
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
  headerButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: radii.xl,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: { borderRadius: radii.xl },
  addButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
  },

  // Balance Card
  balanceCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    ...shadows.glass,
  },
  balanceBlur: {
    padding: spacing.lg,
    overflow: "hidden",
    borderRadius: radii.xl,
  },
  balanceLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontFamily: typography.families.heading,
    fontSize: 38,
    color: colors.text.primary,
    letterSpacing: -1,
  },
  balanceRow: {
    flexDirection: "row",
    marginTop: spacing.lg,
    alignItems: "center",
  },
  balanceStat: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  balanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  balanceStatLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
  },
  balanceStatValue: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
  },
  burnRateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  burnRateText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  balanceHint: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    textAlign: "center",
  },

  // Alerts
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 171, 0, 0.08)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 171, 0, 0.15)",
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: "rgba(255, 171, 0, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary,
  },

  // Quick Actions
  quickActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },

  // Section
  section: { marginBottom: spacing.xl },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  seeAll: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.eu.star,
  },

  // Transaction Item
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    gap: spacing.md,
  },
  txIconContainer: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  txIcon: { fontSize: 20 },
  txInfo: { flex: 1 },
  txDescription: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  txCategory: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  txAmount: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.secondary,
  },
  emptySubtext: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    textAlign: "center",
    maxWidth: 280,
  },

  // Monthly Progress
  monthlyProgressSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  monthlyProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  monthlyProgressLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  daysLeftBadge: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
    backgroundColor: "rgba(255,215,0,0.12)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    overflow: "hidden",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radii.full,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: "100%",
    borderRadius: radii.full,
  },
  progressText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    textAlign: "center",
  },
  alertBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  alertBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  // Budget Wide Button
  budgetWideButton: {
    marginBottom: spacing.xl,
    borderRadius: radii.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.20)",
  },
  budgetWideGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
  },
  budgetWideLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  budgetWideIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,215,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  budgetWideTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  budgetWideSubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
