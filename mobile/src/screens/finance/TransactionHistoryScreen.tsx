/**
 * TransactionHistoryScreen — Historial de transacciones completo
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import Animated, { FadeInDown, FadeInRight, FadeOutRight, withSpring } from "react-native-reanimated";
import { CategoryTab } from "@/components";
import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import { financeApi } from "@/api/financeService";
import type { LedgerTransaction } from "@/types/finance";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TransactionHistoryScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: transactions = [],
    isLoading,
    refetch,
  } = useQuery<LedgerTransaction[]>({
    queryKey: ["transactions"],
    queryFn: financeApi.getTransactions,
    retry: false,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Get unique categories from transactions
  const categories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.categoryName ?? "").filter(Boolean));
    return Array.from(cats).sort();
  }, [transactions]);

  // Filter and group transactions
  const groupedTransactions = useMemo(() => {
    const filtered = transactions.filter((tx) => {
      const desc = (tx.description ?? "").toLowerCase();
      const cat = (tx.categoryName ?? "").toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || desc.includes(query) || cat.includes(query);
      const matchesCategory = !selectedCategory || tx.categoryName === selectedCategory;
      const matchesType = typeFilter === "ALL" || tx.transactionType === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    });

    // Group by date
    const grouped: Record<string, LedgerTransaction[]> = {};
    filtered.forEach((tx) => {
      const date = tx.transactionDate;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(tx);
    });

    // Sort dates descending
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([date, txs]) => ({
        date,
        transactions: txs,
        dailyTotal: txs.reduce((sum, tx) => sum + tx.amount, 0),
      }));
  }, [transactions, searchQuery, selectedCategory, typeFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return new Intl.DateTimeFormat("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(date);
    }
  };

  const getIconForCategory = (categoryName: string | null | undefined): React.ComponentProps<typeof Ionicons>["name"] => {
    if (!categoryName) return "cube";
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
      "Cine": "film",
    };
    return iconMap[categoryName] || "cube";
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[DS.background, "#0E1A35", "#0F1535"]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>Historial</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.text.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar transacciones..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== "" && (
          <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
          </Pressable>
        )}
      </View>

      {/* Type Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeFilterContainer}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
      >
        <Animated.View entering={FadeInRight.delay(0).duration(350)}>
          <CategoryTab
            label="Todos"
            icon="apps-outline"
            active={typeFilter === "ALL"}
            onPress={() => setTypeFilter("ALL")}
          />
        </Animated.View>
        <Animated.View entering={FadeInRight.delay(40).duration(350)}>
          <CategoryTab
            label="Gastos"
            icon="arrow-down-circle-outline"
            active={typeFilter === "EXPENSE"}
            onPress={() => setTypeFilter("EXPENSE")}
          />
        </Animated.View>
        <Animated.View entering={FadeInRight.delay(80).duration(350)}>
          <CategoryTab
            label="Ingresos"
            icon="arrow-up-circle-outline"
            active={typeFilter === "INCOME"}
            onPress={() => setTypeFilter("INCOME")}
          />
        </Animated.View>
      </ScrollView>

      {/* Category Filter */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilterContainer}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        >
          <Animated.View entering={FadeInRight.delay(0).duration(350)}>
            <CategoryTab
              label="Todas"
              icon="apps-outline"
              active={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
            />
          </Animated.View>
          {categories.map((cat, index) => (
            <Animated.View
              key={cat}
              entering={FadeInRight.delay((index + 1) * 40).duration(350)}
            >
              <CategoryTab
                label={cat}
                icon={getIconForCategory(cat)}
                active={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
              />
            </Animated.View>
          ))}
        </ScrollView>
      )}

      {/* Transactions List */}
      {isLoading ? (
        <ActivityIndicator
          color={colors.eu.star}
          size="large"
          style={{ marginTop: 100 }}
        />
      ) : groupedTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={56} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Sin transacciones</Text>
          <Text style={styles.emptySubtext}>
            {searchQuery || selectedCategory
              ? "No hay transacciones que coincidan con tus filtros"
              : "Añade tu primera transacción para verla aquí"}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.eu.star} />
          }
          showsVerticalScrollIndicator={false}
        >
          {groupedTransactions.map(({ date, transactions: txs, dailyTotal }, groupIdx) => (
            <Animated.View key={date} entering={FadeInDown.delay(groupIdx * 50)}>
              {/* Date Header */}
              <View style={styles.dateHeader}>
                <View>
                  <Text style={styles.dateHeaderDate}>{formatDate(date)}</Text>
                  <Text style={styles.dateHeaderDay}>
                    {new Date(date).toLocaleDateString("es-ES", { weekday: "long" })}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.dateHeaderTotal,
                    { color: dailyTotal >= 0 ? colors.status.success : colors.status.error },
                  ]}
                >
                  {dailyTotal >= 0 ? "+" : ""}
                  {formatCurrency(dailyTotal)}
                </Text>
              </View>

              {/* Transactions for this day */}
              {txs.map((tx) => (
                <Animated.View key={tx.id} entering={FadeInDown}>
                  <Pressable 
                    style={styles.txItem}
                    onPress={() =>
                      navigation.navigate("TransactionDetail", { transaction: tx })
                    }
                  >
                    <View style={styles.txIconContainer}>
                      <Ionicons
                        name={getIconForCategory(tx.categoryName)}
                        size={20}
                        color={colors.eu.star}
                      />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={styles.txDescription} numberOfLines={1}>
                        {tx.description}
                      </Text>
                      <Text style={styles.txCategory}>{tx.categoryName}</Text>
                      <Text style={styles.txTime}>
                        {new Date(tx.createdAt).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.txAmount,
                        {
                          color:
                            tx.transactionType === "INCOME"
                              ? colors.status.success
                              : colors.status.error,
                        },
                      ]}
                    >
                      {tx.transactionType === "INCOME" ? "+" : "-"}
                      {formatCurrency(Math.abs(tx.amount))}
                    </Text>
                  </Pressable>
                </Animated.View>
              ))}

              {/* Separator */}
              {groupIdx < groupedTransactions.length - 1 && (
                <View style={styles.groupSeparator} />
              )}
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.text.primary,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.glass.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },

  // Category Filter
  categoryFilterContainer: {
    marginBottom: spacing.md,
    marginTop: 0,
  },

  // Type Filter
  typeFilterContainer: {
    marginBottom: spacing.sm,
    marginTop: 0,
    flexGrow: 0,
  },

  // List
  listContainer: {
    flex: 1,
  },

  // Date Group
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    marginBottom: spacing.md,
  },
  dateHeaderDate: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  dateHeaderDay: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  dateHeaderTotal: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
  },

  // Transaction Item
  txItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  txIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,215,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
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
  txTime: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  txAmount: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
  },

  // Separators
  groupSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.04)",
    marginVertical: spacing.lg,
  },

  // Empty
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
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
