import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BlurView } from "expo-blur";
import {
  colors,
  typography,
  spacing,
  radii,
  DS,
} from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
import { financeApi } from "@/api/financeService";
import type { SpendingCategory } from "@/types/finance";
import { sendBudgetAlertNotification } from "@/services/notificationService";

// Mapeo de categorías a iconos Ionicons reales
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
  "Bus": "bus",
  "Cine": "film",
  "Café": "cafe",
};

const CALCULATOR_BUTTONS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["0", ".", "⌫"],
];

export default function AddTransactionScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isExpense, setIsExpense] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: apiCategories = [] } = useQuery<SpendingCategory[]>({
    queryKey: ["spendingCategories"],
    queryFn: financeApi.getSpendingCategories,
  });

  const categories = apiCategories.length > 0 ? apiCategories : [
    { id: 1, name: "Comida", icon: "restaurant", color: "" } as SpendingCategory,
    { id: 2, name: "Transporte", icon: "bus", color: "" } as SpendingCategory,
    { id: 3, name: "Ocio", icon: "game-controller", color: "" } as SpendingCategory,
    { id: 4, name: "Alojamiento", icon: "home", color: "" } as SpendingCategory,
    { id: 5, name: "Estudios", icon: "book", color: "" } as SpendingCategory,
    { id: 6, name: "Otro", icon: "cube", color: "" } as SpendingCategory,
  ];

  const mutation = useMutation({
    mutationFn: financeApi.createTransaction,
    onSuccess: async () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["financeSummary"] });
      queryClient.invalidateQueries({ queryKey: ["budgetAlerts"] });
      queryClient.invalidateQueries({ queryKey: ["pendingAlertsCount"] });
      
      // Fetch new alerts and send notifications
      try {
        const alerts = await financeApi.getBudgetAlerts();
        for (const alert of alerts.filter(a => !a.isAcknowledged)) {
          await sendBudgetAlertNotification(
            alert.categoryName,
            alert.progressPercentage,
            alert.alertLevel
          );
        }
      } catch (error) {
        console.warn("[AddTransaction] Failed to fetch alerts for notifications:", error);
      }
      
      navigation.goBack();
    },
    onError: (err: any) => {
      console.error("[AddTransaction] Error:", err);
      Alert.alert("Error", "No se pudo guardar la transacción. Por favor intenta de nuevo.");
    },
  });

  const handleAmountPress = (key: string) => {
    if (key === "⌫") {
      setAmount(amount.slice(0, -1));
    } else if (key === ".") {
      if (!amount.includes(".")) {
        setAmount(amount === "" ? "0." : amount + ".");
      }
    } else {
      setAmount(amount === "0" && key !== "." ? key : amount + key);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSave = () => {
    if (!amount || !selectedCategory) {
      Alert.alert("Campos requeridos", "Introduce el importe y selecciona una categoría");
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Importe inválido", "Introduce un número válido");
      return;
    }
    mutation.mutate({
      categoryId: selectedCategory,
      amount: numAmount,
      currency: "EUR",
      transactionType: isExpense ? "EXPENSE" : "INCOME",
      description: description || (isExpense ? "Gasto" : "Ingreso"),
      transactionDate: selectedDate.toISOString().split("T")[0],
    });
  };

  const getIconForCategory = (categoryName: string): React.ComponentProps<typeof Ionicons>["name"] => {
    return (CATEGORY_ICONS[categoryName] || "cube") as React.ComponentProps<typeof Ionicons>["name"];
  };

  const formatDisplayAmount = (): string => {
    if (!amount) return "0,00";
    const num = parseFloat(amount);
    return isNaN(num)
      ? "0,00"
      : new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2 }).format(num);
  };

  const formatDateDisplay = (): string => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(selectedDate);
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            st.content,
            { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
        >
          {/* Header */}
          <View style={st.header}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </Pressable>
            <Text style={st.headerTitle}>Nueva transacción</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Toggle Expense / Income */}
          <View style={st.toggleRow}>
            <Pressable
              style={[st.toggleBtn, isExpense && st.toggleActive]}
              onPress={() => setIsExpense(true)}
            >
              <Ionicons
                name="arrow-down-circle"
                size={18}
                color={isExpense ? colors.status.error : colors.text.tertiary}
              />
              <Text style={[st.toggleLabel, isExpense && { color: colors.status.error }]}>
                Gasto
              </Text>
            </Pressable>
            <Pressable
              style={[st.toggleBtn, !isExpense && st.toggleActive]}
              onPress={() => setIsExpense(false)}
            >
              <Ionicons
                name="arrow-up-circle"
                size={18}
                color={!isExpense ? colors.status.success : colors.text.tertiary}
              />
              <Text style={[st.toggleLabel, !isExpense && { color: colors.status.success }]}>
                Ingreso
              </Text>
            </Pressable>
          </View>

          {/* Amount Display */}
          <View style={st.amountDisplayCard}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <LinearGradient
              colors={["rgba(26, 61, 232, 0.15)", "rgba(59, 107, 255, 0.08)"]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={st.amountDisplayLabel}>Importe</Text>
            <View style={st.amountDisplayRow}>
              <Text style={st.amountDisplayCurrency}>€</Text>
              <Text style={st.amountDisplayValue}>{formatDisplayAmount()}</Text>
            </View>
          </View>

          {/* Calculator Keypad */}
          <View style={st.calculatorSection}>
            <Text style={st.sectionLabel}>Cantidad</Text>
            <View style={st.calculator}>
              {CALCULATOR_BUTTONS.map((row, rowIdx) => (
                <View key={rowIdx} style={st.calculatorRow}>
                  {row.map((btn) => (
                    <Pressable
                      key={btn}
                      style={st.calcBtn}
                      onPress={() => handleAmountPress(btn)}
                    >
                      <Text style={st.calcBtnText}>{btn}</Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Date Picker */}
          <View style={st.dateSection}>
            <Text style={st.sectionLabel}>Fecha</Text>
            <Pressable
              style={st.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={colors.eu.star} />
              <Text style={st.dateButtonText}>{formatDateDisplay()}</Text>
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          )}

          {/* Categories */}
          <View style={st.categoriesSection}>
            <Text style={st.sectionLabel}>Categoría</Text>
            <View style={st.categoryGrid}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    st.categoryChip,
                    selectedCategory === cat.id && st.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Ionicons
                    name={getIconForCategory(cat.name)}
                    size={20}
                    color={
                      selectedCategory === cat.id ? colors.eu.star : colors.text.tertiary
                    }
                  />
                  <Text
                    style={[
                      st.categoryLabel,
                      selectedCategory === cat.id && st.categoryLabelActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={st.descriptionSection}>
            <Text style={st.sectionLabel}>Nota (opcional)</Text>
            <TextInput
              style={st.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Añade una descripción..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Save Button */}
          <Pressable onPress={handleSave} disabled={mutation.isPending}>
            <LinearGradient
              colors={colors.gradient.accent as [string, string]}
              style={[st.saveButton, mutation.isPending && { opacity: 0.7 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={st.saveButtonText}>
                {mutation.isPending ? "Guardando..." : "Guardar transacción"}
              </Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
  },
  toggleRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
  },
  toggleActive: {
    borderColor: colors.eu.star,
    backgroundColor: "rgba(255,215,0,0.12)",
  },
  toggleLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.tertiary,
  },
  amountDisplayCard: {
    overflow: "hidden",
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.2)",
  },
  amountDisplayLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  amountDisplayRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  amountDisplayCurrency: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    color: colors.eu.star,
  },
  amountDisplayValue: {
    fontFamily: typography.families.heading,
    fontSize: 48,
    color: colors.text.primary,
  },
  calculatorSection: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  calculator: {
    gap: spacing.sm,
  },
  calculatorRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  calcBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    alignItems: "center",
    justifyContent: "center",
  },
  calcBtnText: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
  },
  dateSection: {
    marginBottom: spacing.xl,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.2)",
  },
  dateButtonText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  categoriesSection: {
    marginBottom: spacing.xl,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
  },
  categoryChipActive: {
    backgroundColor: "rgba(255,215,0,0.12)",
    borderColor: "rgba(255,215,0,0.35)",
  },
  categoryLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  categoryLabelActive: { color: colors.eu.star },
  descriptionSection: {
    marginBottom: spacing.lg,
  },
  textInput: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    textAlignVertical: "top",
  },
  saveButton: {
    height: 56,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  saveButtonText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.button.fontSize,
    color: colors.text.primary,
  },
});
