import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import { ScreenBackground, EmptyState } from "@/design-system/components";
import { financeApi } from "@/api";
import type { Budget, SpendingCategory } from "@/types/finance";

interface BudgetWithProgress extends Budget {
  spent: number;
  progress: number;
}

export default function BudgetScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [cycle, setCycle] = useState<"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">("MONTHLY");

  const { data: budgets = [], isLoading, error, refetch } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => financeApi.getBudgets(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["spending-categories"],
    queryFn: () => financeApi.getSpendingCategories(),
    staleTime: 1000 * 60 * 60,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => financeApi.getTransactions(),
    staleTime: 1000 * 60 * 5,
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (budgetData: any) => {
      return financeApi.createBudget({
        categoryId: budgetData.categoryId,
        limitAmount: budgetData.limitAmount,
        cycle: budgetData.cycle,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      resetForm();
      setShowModal(false);
      Alert.alert("Éxito", "Presupuesto creado correctamente");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo crear el presupuesto";
      Alert.alert("Error", errorMessage);
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (budgetId: number) => {
      return financeApi.deleteBudget(budgetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      Alert.alert("Éxito", "Presupuesto eliminado correctamente");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo eliminar el presupuesto";
      Alert.alert("Error", errorMessage);
    },
  });

  const handleDeleteBudget = (budgetId: number) => {
    Alert.alert(
      "Eliminar presupuesto",
      "¿Estás seguro de que deseas eliminar este presupuesto?",
      [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        { text: "Eliminar", onPress: () => deleteBudgetMutation.mutate(budgetId), style: "destructive" },
      ],
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setBudgetAmount("");
    setCycle("MONTHLY");
  };

  const handleAddBudget = () => {
    if (!selectedCategory || !budgetAmount) {
      Alert.alert("Campos requeridos", "Selecciona una categoría e introduce el monto del presupuesto");
      return;
    }

    const numAmount = parseFloat(budgetAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Monto inválido", "Introduce un monto válido para el presupuesto");
      return;
    }

    createBudgetMutation.mutate({
      categoryId: selectedCategory,
      limitAmount: numAmount,
      cycle,
    });
  };

  const getCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = {
      DAILY: "Diario",
      WEEKLY: "Semanal",
      MONTHLY: "Mensual",
      YEARLY: "Anual",
    };
    return labels[cycle] || cycle;
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || "Sin categoría";
  };

  const calculateSpentByCategory = (categoryId: number): number => {
    return transactions
      .filter((tx) => {
        const txCategoryId = parseInt(tx.categoryName.split("-")[0]);
        return txCategoryId === categoryId && tx.transactionType === "EXPENSE";
      })
      .reduce((total, tx) => total + tx.amount, 0);
  };

  const calculateProgress = (spent: number, limit: number): number => {
    return limit > 0 ? (spent / limit) * 100 : 0;
  };

  const budgetsWithProgress: BudgetWithProgress[] = budgets.map((b: Budget) => {
    const spent = calculateSpentByCategory(b.categoryId);
    const progress = calculateProgress(spent, b.limitAmount);
    return {
      ...b,
      spent,
      progress,
    };
  });

  const renderBudgetItem = ({ item }: { item: BudgetWithProgress }) => (
    <Animated.View entering={FadeInDown.springify()} style={st.budgetCard}>
      <LinearGradient
        colors={[colors.glass.white, colors.glass.border]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={st.cardGradient}
      >
        <View style={st.cardHeader}>
          <View style={st.categoryInfo}>
            <View style={st.categoryIcon}>
              <Ionicons name="pricetag" size={20} color={colors.eu.star} />
            </View>
            <View>
              <Text style={st.categoryName}>{getCategoryName(item.categoryId)}</Text>
              <Text style={st.cycleBadge}>{getCycleLabel(item.cycle)}</Text>
            </View>
          </View>
          <Pressable 
            hitSlop={8}
            onPress={() => handleDeleteBudget(item.id)}
          >
            <Ionicons name="trash-outline" size={24} color={colors.status.error} />
          </Pressable>
        </View>

        <View style={st.progressSection}>
          <View style={st.amountRow}>
            <View>
              <Text style={st.label}>Gastado</Text>
              <Text style={st.amount}>€{item.spent.toFixed(2)}</Text>
            </View>
            <View style={st.separator} />
            <View style={{ alignItems: "flex-end" }}>
              <Text style={st.label}>Límite</Text>
              <Text style={st.amount}>€{item.limitAmount.toFixed(2)}</Text>
            </View>
          </View>

          <View style={st.progressBar}>
            <View
              style={[
                st.progressFill,
                {
                  width: `${Math.min(item.progress, 100)}%`,
                  backgroundColor:
                    item.progress > 100
                      ? colors.status.error
                      : item.progress > 75
                        ? colors.status.warning
                        : colors.status.success,
                },
              ]}
            />
          </View>

          <Text style={st.progressText}>
            {item.progress.toFixed(0)}% del presupuesto utilizado
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <ScreenBackground>
        <View style={st.loadingContainer}>
          <ActivityIndicator size="large" color={colors.eu.star} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={[st.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={st.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={st.title}>Presupuestos</Text>
        <Pressable onPress={() => setShowModal(true)} hitSlop={8} style={st.addBtn}>
          <Ionicons name="add" size={24} color={colors.eu.star} />
        </Pressable>
      </View>

      {/* Summary Stats */}
      {budgetsWithProgress.length > 0 && (
        <Animated.View entering={FadeInDown} style={st.summaryRow}>
          <View style={st.summaryCard}>
            <Ionicons name="wallet-outline" size={18} color="#FFD700" />
            <Text style={st.summaryValue}>{budgetsWithProgress.length}</Text>
            <Text style={st.summaryLabel}>Presupuestos</Text>
          </View>
          <View style={st.summaryCard}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.status.warning} />
            <Text style={st.summaryValue}>
              {budgetsWithProgress.filter((b) => b.progress >= 75).length}
            </Text>
            <Text style={st.summaryLabel}>En riesgo</Text>
          </View>
          <View style={st.summaryCard}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.status.success} />
            <Text style={st.summaryValue}>
              {budgetsWithProgress.filter((b) => b.progress < 75).length}
            </Text>
            <Text style={st.summaryLabel}>Saludables</Text>
          </View>
        </Animated.View>
      )}

      <FlatList
        data={budgetsWithProgress}
        renderItem={renderBudgetItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={st.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title="Sin presupuestos"
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {/* Add Budget Modal — Redesigned */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <BlurView intensity={90} style={st.modalBlur}>
          <View style={[st.modalContent, { paddingTop: insets.top + spacing.lg }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={st.modalHeader}>
                <Pressable onPress={() => setShowModal(false)} hitSlop={8} style={st.modalCloseBtn}>
                  <Ionicons name="close" size={22} color={colors.text.primary} />
                </Pressable>
                <Text style={st.modalTitle}>Nuevo Presupuesto</Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Illustration / Description */}
              <View style={st.modalHero}>
                <LinearGradient
                  colors={["rgba(255,215,0,0.10)", "rgba(255,215,0,0.02)"]}
                  style={st.modalHeroGradient}
                >
                  <Ionicons name="wallet-outline" size={48} color={colors.eu.star} />
                </LinearGradient>
                <Text style={st.modalHeroText}>
                  Establece un límite de gasto por categoría para controlar mejor tus finanzas
                </Text>
              </View>

              {/* Amount Input — Large & Prominent */}
              <View style={st.amountSection}>
                <Text style={st.formLabel}>¿Cuánto quieres asignar?</Text>
                <View style={st.amountInputWrap}>
                  <Text style={st.currencySymbol}>€</Text>
                  <TextInput
                    style={st.amountInput}
                    placeholder="0,00"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    keyboardType="decimal-pad"
                    value={budgetAmount}
                    onChangeText={setBudgetAmount}
                  />
                </View>
              </View>

              {/* Category Selector — Grid style */}
              <View style={st.formSection}>
                <Text style={st.formLabel}>Categoría</Text>
                <View style={st.categoryGrid}>
                  {categories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      style={[
                        st.categoryChip,
                        selectedCategory === cat.id && st.categoryChipActive,
                      ]}
                    >
                      <Ionicons
                        name="pricetag-outline"
                        size={16}
                        color={selectedCategory === cat.id ? colors.eu.deep : colors.text.secondary}
                      />
                      <Text
                        style={[
                          st.categoryChipText,
                          selectedCategory === cat.id && st.categoryChipTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Cycle Selector — Pill buttons */}
              <View style={st.formSection}>
                <Text style={st.formLabel}>Periodo de renovación</Text>
                <View style={st.cycleContainer}>
                  {(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const).map((c) => {
                    const isActive = cycle === c;
                    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
                      DAILY: "today-outline",
                      WEEKLY: "calendar-outline",
                      MONTHLY: "calendar",
                      YEARLY: "globe-outline",
                    };
                    return (
                      <Pressable
                        key={c}
                        onPress={() => setCycle(c)}
                        style={[st.cycleButton, isActive && st.cycleButtonActive]}
                      >
                        <Ionicons
                          name={icons[c]}
                          size={18}
                          color={isActive ? colors.eu.deep : colors.text.secondary}
                        />
                        <Text style={[st.cycleButtonText, isActive && st.cycleButtonTextActive]}>
                          {getCycleLabel(c)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Preview */}
              {selectedCategory && budgetAmount && (
                <Animated.View entering={FadeInDown.springify()} style={st.previewCard}>
                  <View style={st.previewRow}>
                    <Text style={st.previewLabel}>Categoría</Text>
                    <Text style={st.previewValue}>{getCategoryName(selectedCategory)}</Text>
                  </View>
                  <View style={st.previewDivider} />
                  <View style={st.previewRow}>
                    <Text style={st.previewLabel}>Límite</Text>
                    <Text style={st.previewValue}>€{parseFloat(budgetAmount || "0").toFixed(2)}</Text>
                  </View>
                  <View style={st.previewDivider} />
                  <View style={st.previewRow}>
                    <Text style={st.previewLabel}>Renovación</Text>
                    <Text style={st.previewValue}>{getCycleLabel(cycle)}</Text>
                  </View>
                </Animated.View>
              )}

              {/* Submit Button */}
              <Pressable
                onPress={handleAddBudget}
                disabled={createBudgetMutation.isPending || !selectedCategory || !budgetAmount}
                style={[
                  st.submitButton,
                  (!selectedCategory || !budgetAmount) && st.submitButtonDisabled,
                ]}
              >
                <LinearGradient
                  colors={(!selectedCategory || !budgetAmount)
                    ? ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.04)"]
                    : [colors.eu.star, "#E6C200"]
                  }
                  style={st.submitGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {createBudgetMutation.isPending ? (
                    <ActivityIndicator color={colors.text.inverse} size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={(!selectedCategory || !budgetAmount) ? colors.text.tertiary : colors.eu.deep}
                      />
                      <Text style={[
                        st.submitButtonText,
                        (!selectedCategory || !budgetAmount) && { color: colors.text.tertiary },
                      ]}>
                        Crear Presupuesto
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              <View style={{ height: insets.bottom + spacing.lg }} />
            </ScrollView>
          </View>
        </BlurView>
      </Modal>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.glass.white,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.glass.white,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.text.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  budgetCard: {
    marginBottom: spacing.lg,
    borderRadius: radii.lg,
    overflow: "hidden",
    ...shadows.lg,
  },
  cardGradient: {
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.glass.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  categoryName: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cycleBadge: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  progressSection: {
    gap: spacing.md,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: colors.glass.border,
  },
  label: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  amount: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.eu.star,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.glass.border,
    borderRadius: radii.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.full,
  },
  progressText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    textAlign: "right",
  },
  modalBlur: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.text.primary,
  },
  formSection: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  pickerContainer: {
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  cycleContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  cycleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    gap: 4,
  },
  cycleButtonActive: {
    backgroundColor: colors.eu.star,
    borderColor: colors.eu.star,
  },
  cycleButtonText: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.secondary,
  },
  cycleButtonTextActive: {
    color: colors.eu.deep,
    fontFamily: typography.families.bodyMedium,
  },
  categoryScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryButtonActive: {
    backgroundColor: colors.eu.star,
    borderColor: colors.eu.star,
  },
  categoryButtonText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  categoryButtonTextActive: {
    color: colors.text.inverse,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.glass.white,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  modalHero: {
    alignItems: "center" as const,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  modalHeroGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  modalHeroText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    textAlign: "center" as const,
    lineHeight: 20,
    paddingHorizontal: spacing.xl,
  },
  amountSection: {
    marginBottom: spacing.xl,
  },
  amountInputWrap: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.glass.white,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.15)",
  },
  currencySymbol: {
    fontFamily: typography.families.heading,
    fontSize: 32,
    color: colors.eu.star,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontFamily: typography.families.heading,
    fontSize: 32,
    color: colors.text.primary,
    padding: 0,
  },
  categoryGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: colors.glass.white,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  categoryChipActive: {
    backgroundColor: colors.eu.star,
    borderColor: colors.eu.star,
  },
  categoryChipText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  categoryChipTextActive: {
    color: colors.eu.deep,
    fontFamily: typography.families.bodyMedium,
  },
  previewCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.15)",
  },
  previewRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: spacing.sm,
  },
  previewLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  previewValue: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  previewDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  submitButton: {
    borderRadius: radii.lg,
    overflow: "hidden" as const,
    marginBottom: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  submitButtonText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.eu.deep,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.06)",
  },
  summaryValue: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
  },
  summaryLabel: {
    fontFamily: typography.families.body,
    fontSize: 10,
    color: colors.text.tertiary,
  },
});
