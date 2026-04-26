/**
 * ────────────────────────────────────────────────────────
 *  TicketingHomeScreen — Eventos y tickets cripto
 * ────────────────────────────────────────────────────────
 */

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  DS,
} from "@/design-system/tokens";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { ticketingApi } from "@/api/ticketingService";
import type { TicketListing } from "@/types/ticketing";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";

export default function TicketingHomeScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: listings = [],
    isLoading,
    refetch,
  } = useQuery<TicketListing[]>({
    queryKey: ["ticketListings"],
    queryFn: ticketingApi.getTicketListings,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const loadingTimedOut = useLoadingTimeout(isLoading, 8000);

  const formatPrice = (p: number, c: string) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: c }).format(p);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

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
            <Text style={styles.headerTitle}>Tickets</Text>
            <Text style={styles.headerSubtitle}>Eventos con entrada segura</Text>
          </View>
          <Pressable
            style={styles.myTicketsBtn}
            onPress={() => navigation.navigate("MyTickets")}
          >
            <Ionicons name="ticket-outline" size={18} color={colors.eu.star} />
            <Text style={styles.myTicketsLabel}>Mis tickets</Text>
          </Pressable>
        </View>

        {isLoading && !loadingTimedOut ? (
          <ActivityIndicator color={colors.eu.star} size="large" style={{ marginTop: 80 }} />
        ) : listings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={56} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No hay eventos disponibles</Text>
            <Text style={styles.emptySubtext}>Los eventos con tickets aparecerán aquí cuando se publiquen</Text>
            <Pressable style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </View>
        ) : (
          listings.map((listing) => (
            <Pressable
              key={listing.id}
              style={styles.eventCard}
              onPress={() => navigation.navigate("PurchaseTicket", { listingId: listing.id })}
            >
              <View style={styles.eventImageContainer}>
                {listing.imageUrl ? (
                  <Image source={{ uri: resolveMediaUrl(listing.imageUrl) }} style={styles.eventImage} />
                ) : (
                  <LinearGradient
                    colors={["rgba(139, 92, 246, 0.3)", "rgba(26, 61, 232, 0.3)"]}
                    style={styles.eventImagePlaceholder}
                  >
                    <Ionicons name="musical-notes" size={36} color={colors.text.secondary} />
                  </LinearGradient>
                )}
                <View style={styles.eventDateBadge}>
                  <Text style={styles.eventDateDay}>
                    {new Date(listing.eventDate).getDate()}
                  </Text>
                  <Text style={styles.eventDateMonth}>
                    {new Date(listing.eventDate).toLocaleDateString("es-ES", { month: "short" }).toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.eventBody}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {listing.eventTitle}
                </Text>
                <View style={styles.eventMeta}>
                  <Ionicons name="location-outline" size={14} color={colors.text.tertiary} />
                  <Text style={styles.eventMetaText}>{listing.venue}</Text>
                </View>
                <View style={styles.eventMeta}>
                  <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
                  <Text style={styles.eventMetaText}>{formatDate(listing.eventDate)}</Text>
                </View>

                <View style={styles.eventFooter}>
                  <Text style={styles.eventPrice}>
                    {formatPrice(listing.pricePerTicket, listing.currency)}
                  </Text>
                  <View style={styles.availabilityBadge}>
                    <Text style={styles.availabilityText}>
                      {listing.remainingTickets} / {listing.totalTickets}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))
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
  myTicketsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    backgroundColor: "rgba(255, 215, 0, 0.10)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 215, 0, 0.25)",
  },
  myTicketsLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
  },

  // Event Card
  eventCard: {
    borderRadius: radii.xl,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: spacing.md,
    ...shadows.glassSmall,
  },
  eventImageContainer: {
    width: "100%",
    height: 160,
    position: "relative",
  },
  eventImage: { width: "100%", height: "100%", resizeMode: "cover" },
  eventImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  eventDateBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(6, 8, 26, 0.85)",
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: "center",
  },
  eventDateDay: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.text.primary,
  },
  eventDateMonth: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 10,
    color: colors.eu.star,
    letterSpacing: 1,
  },
  eventBody: { padding: spacing.md },
  eventTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 4,
  },
  eventMetaText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  eventPrice: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.eu.star,
  },
  availabilityBadge: {
    backgroundColor: "rgba(0, 214, 143, 0.10)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  availabilityText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.status.success,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.secondary,
  },
  emptySubtext: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  retryBtn: {
    borderWidth: 1,
    borderColor: colors.eu.star,
    borderRadius: radii.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.eu.star + "10",
  },
  retryText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
  },
});
