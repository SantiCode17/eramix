/**
 * ────────────────────────────────────────────────────────
 *  GrantDetailScreen — Detalle de beca con edición y eliminación
 * ────────────────────────────────────────────────────────
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import DateTimePicker from "@react-native-community/datetimepicker";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { financeApi } from "@/api";
import type { GrantAllocation } from "@/types";

export default function GrantDetailScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const grant: GrantAllocation = route.params?.grant;

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(grant?.sourceName || "");
  const [editAmount, setEditAmount] = useState(grant?.totalAmount?.toString() || "");
  const [editStartDate, setEditStartDate] = useState(new Date(grant?.mobilityStartDate || Date.now()));
  const [editEndDate, setEditEndDate] = useState(new Date(grant?.mobilityEndDate || Date.now()));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data: any) => financeApi.updateGrant(grant.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grants"] });
      queryClient.invalidateQueries({ queryKey: ["financeSummary"] });
      setShowEditModal(false);
      Alert.alert("Éxito", "Beca actualizada correctamente");
      navigation.goBack();
    },
    onError: () => Alert.alert("Error", "No se pudo actualizar la beca"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => financeApi.deleteGrant(grant.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grants"] });
      queryClient.invalidateQueries({ queryKey: ["financeSummary"] });
      navigation.goBack();
    },
    onError: () => Alert.alert("Error", "No se pudo eliminar la beca"),
  });

  const handleDelete = () => {
    Alert.alert("Eliminar beca", "¿Estás seguro de que deseas eliminar esta beca?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate() },
    ]);
  };

  const handleSaveEdit = () => {
    const numAmount = parseFloat(editAmount);
    if (!editName || isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Datos inválidos", "Revisa el nombre y monto de la beca");
      return;
    }
    updateMutation.mutate({
      sourceName: editName,
      totalAmount: numAmount,
      disbursedAmount: grant.disbursedAmount || 0,
      startDate: editStartDate.toISOString().split("T")[0],
      endDate: editEndDate.toISOString().split("T")[0],
    });
  };

  if (!grant) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <LinearGradient colors={[DS.background, "#0E1A35"]} style={StyleSheet.absoluteFill} />
        <Text style={{ color: colors.text.primary, textAlign: "center" }}>Beca no encontrada</Text>
      </View>
    );
  }

  const daysLeft = Math.max(0, Math.ceil(
    (new Date(grant.mobilityEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));
  const totalDays = Math.max(1, Math.ceil(
    (new Date(grant.mobilityEndDate).getTime() - new Date(grant.mobilityStartDate).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const daysElapsed = totalDays - daysLeft;
  const timeProgress = (daysElapsed / totalDays) * 100;
  const disbursedProgress = grant.totalAmount > 0 ? (grant.disbursedAmount / grant.totalAmount) * 100 : 0;
  const dailyRate = daysLeft > 0 ? ((grant.totalAmount - grant.disbursedAmount) / daysLeft) : 0;
  const monthlyRate = dailyRate * 30;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: grant.currency || "EUR" }).format(n);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[DS.background, "#0E1A35", "#0F1535"]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Detalle de Beca</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={() => setShowEditModal(true)} hitSlop={8} style={styles.actionBtn}>
            <Ionicons name="pencil" size={20} color="#FFD700" />
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={8} style={styles.actionBtn}>
            <Ionicons name="trash" size={20} color={colors.status.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.heroCard}>
          <BlurView intensity={25} tint="dark" style={styles.heroBlur}>
            <LinearGradient
              colors={["rgba(255,215,0,0.10)", "rgba(26,61,232,0.06)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroIconWrap}>
              <Ionicons name="school" size={32} color="#FFD700" />
            </View>
            <Text style={styles.heroName}>{grant.sourceName}</Text>
            <Text style={styles.heroAmount}>{formatCurrency(grant.totalAmount)}</Text>
            <Text style={styles.heroCurrency}>Monto total de la beca</Text>
          </BlurView>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color="#5AC8FA" />
            <Text style={styles.statValue}>{daysLeft}</Text>
            <Text style={styles.statLabel}>Días restantes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={20} color="#34C759" />
            <Text style={styles.statValue}>{formatCurrency(dailyRate)}</Text>
            <Text style={styles.statLabel}>Disponible/día</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={20} color="#FF9500" />
            <Text style={styles.statValue}>{formatCurrency(monthlyRate)}</Text>
            <Text style={styles.statLabel}>Disponible/mes</Text>
          </View>
        </Animated.View>

        {/* Time Progress */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <Text style={styles.sectionLabel}>PROGRESO TEMPORAL</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Período de movilidad</Text>
              <Text style={styles.progressPercent}>{Math.round(timeProgress)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(timeProgress, 100)}%`, backgroundColor: "#5AC8FA" }]} />
            </View>
            <View style={styles.progressDates}>
              <Text style={styles.progressDate}>{formatDate(grant.mobilityStartDate)}</Text>
              <Text style={styles.progressDate}>{formatDate(grant.mobilityEndDate)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Disbursement Progress */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionLabel}>DESEMBOLSO</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>
                {formatCurrency(grant.disbursedAmount)} de {formatCurrency(grant.totalAmount)}
              </Text>
              <Text style={styles.progressPercent}>{Math.round(disbursedProgress)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(disbursedProgress, 100)}%`,
                    backgroundColor:
                      disbursedProgress >= 80 ? "#34C759" : disbursedProgress >= 50 ? "#FF9500" : "#FFD700",
                  },
                ]}
              />
            </View>
            <Text style={styles.remainingText}>
              Pendiente: {formatCurrency(grant.totalAmount - grant.disbursedAmount)}
            </Text>
          </View>
        </Animated.View>

        {/* Details */}
        <Animated.View entering={FadeInDown.delay(250)}>
          <Text style={styles.sectionLabel}>DETALLES</Text>
          <View style={styles.detailsList}>
            {[
              { icon: "school", label: "Nombre", value: grant.sourceName },
              { icon: "cash", label: "Moneda", value: grant.currency || "EUR" },
              { icon: "calendar", label: "Inicio", value: formatDate(grant.mobilityStartDate) },
              { icon: "calendar-outline", label: "Fin", value: formatDate(grant.mobilityEndDate) },
              { icon: "time", label: "Duración", value: `${totalDays} días` },
            ].map((item, i) => (
              <View key={i} style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  <Ionicons name={item.icon as any} size={18} color="#FFD700" />
                </View>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <BlurView intensity={90} style={styles.modalBlur}>
          <View style={[styles.modalContent, { paddingTop: insets.top + spacing.lg }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setShowEditModal(false)} hitSlop={8}>
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </Pressable>
                <Text style={styles.modalTitle}>Editar Beca</Text>
                <View style={{ width: 24 }} />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Nombre de la beca</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Nombre"
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Monto total (€)</Text>
                <TextInput
                  style={styles.input}
                  value={editAmount}
                  onChangeText={setEditAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.text.tertiary}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Fecha de inicio</Text>
                <Pressable style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
                  <Ionicons name="calendar" size={20} color="#FFD700" />
                  <Text style={styles.dateButtonText}>{editStartDate.toLocaleDateString("es-ES")}</Text>
                </Pressable>
                {showStartPicker && (
                  <DateTimePicker
                    value={editStartDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, date) => {
                      if (Platform.OS === "android") setShowStartPicker(false);
                      if (date) setEditStartDate(date);
                    }}
                  />
                )}
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Fecha de fin</Text>
                <Pressable style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
                  <Ionicons name="calendar" size={20} color="#FFD700" />
                  <Text style={styles.dateButtonText}>{editEndDate.toLocaleDateString("es-ES")}</Text>
                </Pressable>
                {showEndPicker && (
                  <DateTimePicker
                    value={editEndDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(_, date) => {
                      if (Platform.OS === "android") setShowEndPicker(false);
                      if (date) setEditEndDate(date);
                    }}
                  />
                )}
              </View>

              <Pressable style={styles.submitButton} onPress={handleSaveEdit} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <ActivityIndicator color={colors.text.inverse} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Guardar Cambios</Text>
                )}
              </Pressable>

              <View style={{ height: insets.bottom + spacing.lg }} />
            </ScrollView>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
  },
  headerActions: { flexDirection: "row", gap: spacing.sm },
  actionBtn: {
    width: 40, height: 40, borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center", justifyContent: "center",
  },
  content: { paddingHorizontal: spacing.lg },

  // Hero
  heroCard: {
    borderRadius: radii.xl, overflow: "hidden",
    marginBottom: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,215,0,0.15)",
  },
  heroBlur: {
    padding: spacing.xl, alignItems: "center", gap: spacing.sm,
  },
  heroIconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(255,215,0,0.12)",
    alignItems: "center", justifyContent: "center", marginBottom: spacing.sm,
  },
  heroName: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary, textAlign: "center",
  },
  heroAmount: {
    fontFamily: typography.families.heading,
    fontSize: 36, color: "#FFD700", letterSpacing: -1,
  },
  heroCurrency: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
  },

  // Stats
  statsGrid: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.xl },
  statCard: {
    flex: 1, backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl, padding: spacing.md, alignItems: "center", gap: spacing.xs,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.06)",
  },
  statValue: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary, textAlign: "center",
  },
  statLabel: {
    fontFamily: typography.families.body,
    fontSize: 10, color: colors.text.tertiary, textAlign: "center",
  },

  // Sections
  sectionLabel: {
    fontFamily: typography.families.bodyMedium, fontSize: 12,
    color: colors.text.tertiary, letterSpacing: 1.2,
    marginBottom: spacing.sm, marginLeft: spacing.xs,
  },
  progressCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.06)",
  },
  progressHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary,
  },
  progressPercent: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.bodySmall.fontSize, color: "#FFD700",
  },
  progressBarBg: {
    height: 8, backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: radii.full, overflow: "hidden", marginBottom: spacing.sm,
  },
  progressBarFill: { height: "100%", borderRadius: radii.full },
  progressDates: { flexDirection: "row", justifyContent: "space-between" },
  progressDate: {
    fontFamily: typography.families.body, fontSize: 11, color: colors.text.tertiary,
  },
  remainingText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize, color: colors.text.secondary,
  },

  // Details List
  detailsList: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.xl, overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.06)",
  },
  detailRow: {
    flexDirection: "row", alignItems: "center",
    padding: spacing.md, gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  detailIconWrap: {
    width: 36, height: 36, borderRadius: radii.md,
    backgroundColor: "rgba(255,215,0,0.10)",
    alignItems: "center", justifyContent: "center",
  },
  detailLabel: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary, flex: 1,
  },
  detailValue: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary,
  },

  // Modal
  modalBlur: { flex: 1 },
  modalContent: { flex: 1, paddingHorizontal: spacing.lg },
  modalHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: spacing.lg,
  },
  modalTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize, color: colors.text.primary,
  },
  formSection: { marginBottom: spacing.lg },
  formLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary, marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radii.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontFamily: typography.families.body, fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  dateButton: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: radii.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
  },
  dateButtonText: {
    fontFamily: typography.families.body, fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary, marginLeft: spacing.md,
  },
  submitButton: {
    backgroundColor: "#FFD700", borderRadius: radii.lg,
    paddingVertical: spacing.md, alignItems: "center", marginTop: spacing.md,
  },
  submitButtonText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize, color: colors.text.inverse,
  },
});
