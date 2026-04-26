/**
 * ────────────────────────────────────────────────────────
 *  BudgetAlertsScreen.tsx — Pantalla de alertas presupuestarias
 * ────────────────────────────────────────────────────────
 */

import React, { useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";

import { financeApi } from "@/api";
import { colors, spacing, radii } from "@/design-system/tokens";
import { ScreenBackground, EmptyState } from "@/design-system/components";
import type { BudgetAlertResponse } from "@/types";

export default function BudgetAlertsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Fetch budget alerts
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["budgetAlerts"],
    queryFn: () => financeApi.getBudgetAlerts(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Acknowledge alert mutation
  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: number) => financeApi.acknowledgeAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgetAlerts"] });
    },
  });

  // Separate acknowledged and unacknowledged alerts
  const { unacknowledged, acknowledged } = useMemo(() => {
    return {
      unacknowledged: alerts.filter((a) => !a.isAcknowledged),
      acknowledged: alerts.filter((a) => a.isAcknowledged),
    };
  }, [alerts]);

  const renderAlert = (alert: BudgetAlertResponse, isAcknowledged: boolean) => {
    const isCritical = alert.alertLevel === "CRITICAL";
    const alertColor = isCritical ? "#EF4444" : "#F59E0B";
    const alertColorLight = isCritical ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)";

    return (
      <View key={alert.id} style={styles.alertCard}>
        <LinearGradient
          colors={[alertColorLight, "rgba(0, 0, 0, 0.02)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.alertContent,
            { borderColor: alertColor },
          ]}
        >
          {/* Header with category and alert level */}
          <View style={styles.alertHeader}>
            <View style={styles.titleContainer}>
              <Text style={[styles.categoryName, { color: colors.text.primary }]}>
                {alert.categoryName}
              </Text>
              <View
                style={[
                  styles.alertBadge,
                  { backgroundColor: alertColor + "20" },
                ]}
              >
                <Text style={[styles.alertBadgeText, { color: alertColor }]}>
                  {isCritical ? "⚠️ CRÍTICA" : "⚡ ATENCIÓN"}
                </Text>
              </View>
            </View>
            {!isAcknowledged && (
              <Pressable
                onPress={() => acknowledgeMutation.mutate(alert.id)}
                disabled={acknowledgeMutation.isPending}
                style={({ pressed }) => [
                  styles.acknowledgeButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                {acknowledgeMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.acknowledgeButtonText}>✓</Text>
                )}
              </Pressable>
            )}
          </View>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(alert.progressPercentage, 100)}%`,
                    backgroundColor: alertColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.text.secondary }]}>
              {alert.progressPercentage.toFixed(0)}% utilizado
            </Text>
          </View>

          {/* Amount details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                Gastado:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                €{alert.spentAmount.toFixed(2)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.text.secondary }]}>
                Límite:
              </Text>
              <Text style={[styles.detailValue, { color: colors.text.primary }]}>
                €{alert.limitAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Status footer */}
          {isAcknowledged && (
            <View style={styles.acknowledgedFooter}>
              <Text style={[styles.acknowledgedText, { color: colors.text.secondary }]}>
                ✓ Reconocida el{" "}
                {new Date(alert.createdAt).toLocaleDateString("es-ES", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenBackground>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#FFD700" />
          </View>
        </ScreenBackground>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenBackground>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Alertas Presupuestarias
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {unacknowledged.length === 0 && acknowledged.length === 0 ? (
            <EmptyState title="Sin alertas activas" />
          ) : (
            <>
              {/* Unacknowledged alerts */}
              {unacknowledged.length > 0 && (
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                    Alertas Pendientes
                  </Text>
                  {unacknowledged.map((alert) => renderAlert(alert, false))}
                </View>
              )}

              {/* Acknowledged alerts */}
              {acknowledged.length > 0 && (
                <View style={styles.acknowledgedSection}>
                  <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                    Historial
                  </Text>
                  {acknowledged.map((alert) => renderAlert(alert, true))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </ScreenBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1628",
  },
  headerContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  acknowledgedSection: {
    marginTop: 24,
  },
  alertCard: {
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  alertContent: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radii.lg,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  alertBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
    alignSelf: "flex-start",
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  acknowledgeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  acknowledgeButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
  },
  detailsContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.03)",
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 3,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  acknowledgedFooter: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  acknowledgedText: {
    fontSize: 12,
    fontWeight: "500",
  },
});


