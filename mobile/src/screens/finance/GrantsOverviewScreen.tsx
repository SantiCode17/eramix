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
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import { ScreenBackground, EmptyState } from "@/design-system/components";
import { financeApi } from "@/api";
import type { GrantAllocation } from "@/types";

export default function GrantsOverviewScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [sourceName, setSourceName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [disbursedAmount, setDisbursedAmount] = useState("0");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const { data: grants = [], isLoading, error, refetch } = useQuery({
    queryKey: ["grants"],
    queryFn: () => financeApi.getGrants(),
    staleTime: 1000 * 60 * 5,
  });

  const createGrantMutation = useMutation({
    mutationFn: async (grantData: any) => {
      return financeApi.createGrant({
        sourceName: grantData.sourceName,
        totalAmount: grantData.totalAmount,
        disbursedAmount: grantData.disbursedAmount,
        startDate: grantData.startDate,
        endDate: grantData.endDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grants"] });
      queryClient.invalidateQueries({ queryKey: ["financeSummary"] });
      resetForm();
      setShowModal(false);
      Alert.alert("Éxito", "Beca registrada correctamente");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "No se pudo registrar la beca";
      Alert.alert("Error", errorMessage);
    },
  });

  const deleteGrantMutation = useMutation({
    mutationFn: (grantId: number) => financeApi.deleteGrant(grantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grants"] });
      queryClient.invalidateQueries({ queryKey: ["financeSummary"] });
    },
    onError: () => Alert.alert("Error", "No se pudo eliminar la beca"),
  });

  const handleDeleteGrant = (grantId: number) => {
    Alert.alert("Eliminar beca", "¿Estás seguro de que deseas eliminar esta beca?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => deleteGrantMutation.mutate(grantId) },
    ]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const resetForm = () => {
    setSourceName("");
    setTotalAmount("");
    setDisbursedAmount("0");
    setStartDate(new Date());
    setEndDate(new Date(new Date().getTime() + 180 * 24 * 60 * 60 * 1000));
  };

  const handleAddGrant = () => {
    if (!sourceName || !totalAmount) {
      Alert.alert("Campos requeridos", "Completa el nombre de la beca y el monto total");
      return;
    }

    const numTotal = parseFloat(totalAmount);
    const numDisbursed = parseFloat(disbursedAmount) || 0;

    if (isNaN(numTotal) || numTotal <= 0) {
      Alert.alert("Monto inválido", "Introduce un monto total válido");
      return;
    }

    createGrantMutation.mutate({
      sourceName,
      totalAmount: numTotal,
      disbursedAmount: numDisbursed,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      currency: "EUR",
    });
  };

  const calculateProgress = (disbursed: number, total: number) => {
    return total > 0 ? (disbursed / total) * 100 : 0;
  };

  const calculateDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? daysLeft : 0;
  };

  const getMonthlyRate = (remaining: number, daysLeft: number) => {
    if (daysLeft <= 0) return 0;
    const monthDays = 30;
    return (remaining / daysLeft) * monthDays;
  };

  const renderGrant = ({ item, index }: { item: GrantAllocation; index: number }) => {
    const progress = calculateProgress(item.disbursedAmount, item.totalAmount);
    const daysLeft = calculateDaysRemaining(item.mobilityEndDate);
    const monthlyRate = getMonthlyRate(
      item.totalAmount - item.disbursedAmount,
      daysLeft
    );

    const endDate = new Date(item.mobilityEndDate);
    const endFormatted = endDate.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <Pressable onPress={() => (navigation as any).navigate("GrantDetail", { grant: item })}>
      <Animated.View
        key={item.id}
        style={{ marginBottom: spacing.md }}
        entering={FadeInDown.delay(index * 50)}
      >
        <LinearGradient
          colors={[
            colors.glass.white + "80",
            colors.glass.white + "40",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[st.grantCard, { overflow: "hidden" }]}
        >
          <BlurView intensity={40} style={{ flex: 1, padding: spacing.md }}>
            <View style={st.grantHeader}>
              <View>
                <Text style={st.grantName}>{item.sourceName}</Text>
                <Text style={st.grantAmount}>
                  {item.totalAmount.toFixed(2)} {item.currency}
                </Text>
              </View>
              <View style={st.statusBadge}>
                <Ionicons
                  name={progress >= 100 ? "checkmark-circle" : "hourglass"}
                  size={20}
                  color={progress >= 100 ? colors.status.success : colors.status.warning}
                />
              </View>
            </View>

            {/* Progress Bar */}
            <View style={st.progressContainer}>
              <View style={st.progressBar}>
                <View
                  style={[
                    st.progressFill,
                    {
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor:
                        progress >= 80
                          ? colors.status.success
                          : progress >= 50
                          ? colors.status.warning
                          : colors.eu.star,
                    },
                  ]}
                />
              </View>
              <Text style={st.progressText}>
                {item.disbursedAmount.toFixed(2)} / {item.totalAmount.toFixed(2)} {item.currency}
              </Text>
            </View>

            {/* Timeline and Details */}
            <View style={st.detailsGrid}>
              <View style={st.detailItem}>
                <Ionicons name="calendar-outline" size={18} color={colors.eu.star} />
                <View style={{ marginLeft: spacing.sm }}>
                  <Text style={st.detailLabel}>Fin del período</Text>
                  <Text style={st.detailValue}>{endFormatted}</Text>
                </View>
              </View>

              <View style={st.detailItem}>
                <Ionicons name="alarm-outline" size={18} color={colors.status.warning} />
                <View style={{ marginLeft: spacing.sm }}>
                  <Text style={st.detailLabel}>Días restantes</Text>
                  <Text style={st.detailValue}>{daysLeft} días</Text>
                </View>
              </View>
            </View>

            {/* Burn Rate */}
            {daysLeft > 0 && (
              <View style={[st.burnRateCard, { backgroundColor: colors.glass.white + "40" }]}>
                <Ionicons name="flame" size={16} color={colors.eu.orange} />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text style={st.burnRateLabel}>Velocidad de gasto</Text>
                  <Text style={st.burnRateValue}>
                    {monthlyRate.toFixed(2)} {item.currency}/mes
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDeleteGrant(item.id)}
                  hitSlop={8}
                  style={{ padding: spacing.xs }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                </Pressable>
                {monthlyRate > (item.totalAmount / 12) && (
                  <View style={st.warningIndicator}>
                    <Text style={st.warningText}>⚠️</Text>
                  </View>
                )}
              </View>
            )}
          </BlurView>
        </LinearGradient>
      </Animated.View>
      </Pressable>
    );
  };

  return (
    <ScreenBackground>
      <View style={[st.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => navigation.goBack()} style={st.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={st.title}>Becas Erasmus</Text>
        <Pressable 
          onPress={() => setShowModal(true)}
          style={st.addBtn}
        >
          <Ionicons name="add" size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={st.loadingContainer}>
          <Text style={st.loadingText}>Cargando becas...</Text>
        </View>
      ) : error ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Error al cargar"
          message="No pudimos cargar tus becas. Intenta de nuevo."
        />
      ) : grants.length === 0 ? (
        <EmptyState
          icon="school-outline"
          title="Sin becas registradas"
          message="Aún no hay becas registradas en tu perfil."
        />
      ) : (
        <FlatList
          data={grants}
          renderItem={renderGrant}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={st.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.eu.star}
            />
          }
          scrollEnabled
        />
      )}

      {/* Add Grant Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <BlurView intensity={90} style={st.modalBlur}>
          <View style={[st.modalContent, { paddingTop: insets.top + spacing.lg }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={st.modalHeader}>
                <Pressable 
                  onPress={() => setShowModal(false)}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={st.modalTitle}>Añadir Beca</Text>
                <View style={{ width: 24 }} />
              </View>

              {/* Form Fields */}
              <View style={st.formSection}>
                <Text style={st.formLabel}>Nombre de la beca</Text>
                <TextInput
                  style={st.input}
                  placeholder="Ej: Beca Erasmus+"
                  placeholderTextColor={colors.text.tertiary}
                  value={sourceName}
                  onChangeText={setSourceName}
                  editable={!createGrantMutation.isPending}
                />
              </View>

              <View style={st.formSection}>
                <Text style={st.formLabel}>Monto total (€)</Text>
                <TextInput
                  style={st.input}
                  placeholder="0,00"
                  placeholderTextColor={colors.text.tertiary}
                  value={totalAmount}
                  onChangeText={setTotalAmount}
                  keyboardType="decimal-pad"
                  editable={!createGrantMutation.isPending}
                />
              </View>

              <View style={st.formSection}>
                <Text style={st.formLabel}>Monto desembolsado (€)</Text>
                <TextInput
                  style={st.input}
                  placeholder="0,00"
                  placeholderTextColor={colors.text.tertiary}
                  value={disbursedAmount}
                  onChangeText={setDisbursedAmount}
                  keyboardType="decimal-pad"
                  editable={!createGrantMutation.isPending}
                />
              </View>

              <View style={st.formSection}>
                <Text style={st.formLabel}>Fecha de inicio</Text>
                <Pressable
                  style={st.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                  disabled={createGrantMutation.isPending}
                >
                  <Ionicons name="calendar" size={20} color={colors.eu.star} />
                  <Text style={st.dateButtonText}>
                    {startDate.toLocaleDateString("es-ES")}
                  </Text>
                </Pressable>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, date) => {
                      if (Platform.OS === "android") {
                        setShowStartDatePicker(false);
                      }
                      if (date) setStartDate(date);
                    }}
                  />
                )}
              </View>

              <View style={st.formSection}>
                <Text style={st.formLabel}>Fecha de fin</Text>
                <Pressable
                  style={st.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                  disabled={createGrantMutation.isPending}
                >
                  <Ionicons name="calendar" size={20} color={colors.eu.star} />
                  <Text style={st.dateButtonText}>
                    {endDate.toLocaleDateString("es-ES")}
                  </Text>
                </Pressable>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, date) => {
                      if (Platform.OS === "android") {
                        setShowEndDatePicker(false);
                      }
                      if (date) setEndDate(date);
                    }}
                  />
                )}
              </View>

              {/* Submit Button */}
              <Pressable
                style={st.submitButton}
                onPress={handleAddGrant}
                disabled={createGrantMutation.isPending}
              >
                {createGrantMutation.isPending ? (
                  <ActivityIndicator color={colors.text.inverse} size="small" />
                ) : (
                  <Text style={st.submitButtonText}>Registrar Beca</Text>
                )}
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
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dateButtonText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.eu.star,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  submitButtonText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.inverse,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
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
    fontSize: typography.sizes.h3.fontSize,
    fontWeight: "600",
    color: colors.text.primary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.text.secondary,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
  },
  grantCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.eu.star + "20",
    ...shadows.glass,
  },
  grantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  grantName: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
    fontWeight: "600",
  },
  grantAmount: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.lg,
  },
  progressText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    textAlign: "right",
  },
  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  detailLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  detailValue: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  burnRateCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.eu.orange + "20",
  },
  burnRateLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  burnRateValue: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  warningIndicator: {
    width: 28,
    height: 28,
    borderRadius: radii.md,
    backgroundColor: colors.status.error + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  warningText: {
    fontSize: 14,
  },
});
