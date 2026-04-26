/**
 * ────────────────────────────────────────────────────────
 *  TransactionDetailScreen — Detalles completos de transacción
 * ────────────────────────────────────────────────────────
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import {
  colors,
  typography,
  spacing,
  radii,
} from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
import { financeApi } from "@/api";
import type { LedgerTransaction } from "@/types";

type TransactionDetailRoute = RouteProp<any, "TransactionDetail">;

export default function TransactionDetailScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<TransactionDetailRoute>();

  const transaction = route.params?.transaction as LedgerTransaction | undefined;

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => financeApi.deleteTransaction(transaction!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["financeSummary"] });
      navigation.goBack();
    },
    onError: () => Alert.alert("Error", "No se pudo eliminar la transacción"),
  });

  const handleDelete = () => {
    Alert.alert("Eliminar transacción", "¿Estás seguro de que deseas eliminar esta transacción?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate() },
    ]);
  };

  if (!transaction) {
    return (
      <ScreenBackground>
        <View
          style={[
            st.container,
            { paddingTop: insets.top + spacing.lg, justifyContent: "center" },
          ]}
        >
          <Text style={st.errorText}>Transacción no encontrada</Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[st.button, st.buttonPrimary]}
          >
            <Text style={st.buttonText}>Volver</Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string): string => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getIconForCategory = (
    categoryName: string
  ): React.ComponentProps<typeof Ionicons>["name"] => {
    const iconMap: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
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
    return iconMap[categoryName] || "cube";
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Transacción: ${transaction.description}\nCantidad: ${formatCurrency(transaction.amount)}\nCategoría: ${transaction.categoryName}\nFecha: ${formatDate(transaction.transactionDate)}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const isExpense = transaction.transactionType === "EXPENSE";
  const amountColor = isExpense ? colors.status.error : colors.status.success;

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={[
          st.container,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={st.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={st.headerTitle}>Detalles</Text>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Pressable onPress={handleShare} hitSlop={8}>
              <Ionicons name="share-social" size={22} color={colors.text.primary} />
            </Pressable>
            <Pressable onPress={handleDelete} hitSlop={8}>
              <Ionicons name="trash" size={22} color={colors.status.error} />
            </Pressable>
          </View>
        </View>

        {/* Main Card */}
        <View style={st.mainCard}>
          <BlurView intensity={40} style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={[
              `${amountColor}15`,
              `${amountColor}08`,
            ]}
            style={StyleSheet.absoluteFill}
          />

          {/* Icon & Category */}
          <View style={st.categorySection}>
            <View
              style={[
                st.categoryIcon,
                { backgroundColor: `${amountColor}20` },
              ]}
            >
              <Ionicons
                name={getIconForCategory(transaction.categoryName)}
                size={40}
                color={amountColor}
              />
            </View>
            <View>
              <Text style={st.categoryName}>{transaction.categoryName}</Text>
              <Text style={st.transactionType}>
                {isExpense ? "Gasto" : "Ingreso"}
              </Text>
            </View>
          </View>

          {/* Amount */}
          <View style={st.amountSection}>
            <Text style={st.amountLabel}>Cantidad</Text>
            <View style={st.amountRow}>
              <Text style={st.amountSymbol}>
                {isExpense ? "-" : "+"}
              </Text>
              <Text style={[st.amount, { color: amountColor }]}>
                {formatCurrency(transaction.amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>Información</Text>

          <View style={st.detailCard}>
            <View style={st.detailItem}>
              <View style={st.detailLeft}>
                <Ionicons
                  name="calendar"
                  size={20}
                  color={colors.eu.star}
                />
                <View>
                  <Text style={st.detailLabel}>Fecha</Text>
                  <Text style={st.detailValue}>
                    {formatDate(transaction.transactionDate)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={st.divider} />

            <View style={st.detailItem}>
              <View style={st.detailLeft}>
                <Ionicons
                  name="time"
                  size={20}
                  color={colors.eu.star}
                />
                <View>
                  <Text style={st.detailLabel}>Hora</Text>
                  <Text style={st.detailValue}>
                    {formatTime(transaction.createdAt)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={st.divider} />

            <View style={st.detailItem}>
              <View style={st.detailLeft}>
                <Ionicons
                  name="cash"
                  size={20}
                  color={colors.eu.star}
                />
                <View>
                  <Text style={st.detailLabel}>Moneda</Text>
                  <Text style={st.detailValue}>{transaction.currency}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Description Section */}
        {transaction.description && (
          <View style={st.section}>
            <Text style={st.sectionTitle}>Descripción</Text>
            <View style={st.descriptionCard}>
              <Text style={st.descriptionText}>{transaction.description}</Text>
            </View>
          </View>
        )}

        {/* Metadata Section */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>Más información</Text>
          <View style={st.metadataCard}>
            <View style={st.metadataItem}>
              <Text style={st.metadataLabel}>ID de Transacción</Text>
              <Text style={st.metadataValue}>{transaction.id}</Text>
            </View>

            <View style={st.divider} />

            <View style={st.metadataItem}>
              <Text style={st.metadataLabel}>Registrado el</Text>
              <Text style={st.metadataValue}>
                {formatDate(transaction.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
  },
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

  // Main Card
  mainCard: {
    overflow: "hidden",
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  categorySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  transactionType: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  amountSection: {
    marginTop: spacing.lg,
  },
  amountLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  amountSymbol: {
    fontFamily: typography.families.heading,
    fontSize: 32,
    color: colors.text.primary,
  },
  amount: {
    fontFamily: typography.families.heading,
    fontSize: 48,
  },

  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  // Detail Card
  detailCard: {
    overflow: "hidden",
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  detailItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  detailLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  detailValue: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  // Description Card
  descriptionCard: {
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: spacing.md,
  },
  descriptionText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
    lineHeight: 24,
  },

  // Metadata Card
  metadataCard: {
    overflow: "hidden",
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  metadataItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  metadataLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
  },
  metadataValue: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary,
    marginTop: 4,
  },

  // Buttons
  button: {
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  buttonPrimary: {
    backgroundColor: colors.eu.star,
  },
  buttonText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.button.fontSize,
    color: colors.text.inverse,
  },
  errorText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
});
