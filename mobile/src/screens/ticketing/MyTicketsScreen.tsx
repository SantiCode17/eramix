/**
 * ────────────────────────────────────────────────────────
 *  MyTicketsScreen — Mis tickets con QR
 * ────────────────────────────────────────────────────────
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  DS,
} from "@/design-system/tokens";
import { ticketingApi } from "@/api/ticketingService";
import type { CryptographicTicket } from "@/types/ticketing";

export default function MyTicketsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [selectedTicket, setSelectedTicket] = useState<CryptographicTicket | null>(null);
  const [qrPayload, setQrPayload] = useState<string | null>(null);

  const { data: tickets = [], isLoading } = useQuery<CryptographicTicket[]>({
    queryKey: ["myTickets"],
    queryFn: ticketingApi.getMyTickets,
  });

  const qrMutation = useMutation({
    mutationFn: (ticketId: number) => ticketingApi.getTicketQR(ticketId),
    onSuccess: (data) => setQrPayload(data),
  });

  const handleShowQR = (ticket: CryptographicTicket) => {
    setSelectedTicket(ticket);
    qrMutation.mutate(ticket.id);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[DS.background, "#0E1A35", "#0F1535"]} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Mis Tickets</Text>
          <View style={{ width: 24 }} />
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.eu.star} size="large" style={{ marginTop: 80 }} />
        ) : tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={56} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No tienes tickets</Text>
            <Text style={styles.emptySubtext}>Compra entradas para eventos y aparecerán aquí</Text>
          </View>
        ) : (
          tickets.map((ticket) => (
            <Pressable
              key={ticket.id}
              style={[styles.ticketCard, ticket.isRedeemed && styles.ticketRedeemed]}
              onPress={() => !ticket.isRedeemed && handleShowQR(ticket)}
            >
              <View style={styles.ticketLeft}>
                <View style={[styles.ticketIcon, ticket.isRedeemed && styles.ticketIconRedeemed]}>
                  <Ionicons
                    name={ticket.isRedeemed ? "checkmark-circle" : "qr-code"}
                    size={24}
                    color={ticket.isRedeemed ? colors.status.success : colors.eu.star}
                  />
                </View>
              </View>
              <View style={styles.ticketContent}>
                <Text style={styles.ticketTitle} numberOfLines={1}>
                  {ticket.eventTitle}
                </Text>
                <Text style={styles.ticketCode}>#{ticket.ticketCode}</Text>
                <Text style={styles.ticketDate}>
                  {new Date(ticket.purchasedAt).toLocaleDateString("es-ES")}
                </Text>
              </View>
              <View style={styles.ticketRight}>
                {ticket.isRedeemed ? (
                  <View style={styles.redeemedBadge}>
                    <Text style={styles.redeemedText}>Usado</Text>
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
                )}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* QR Modal */}
      <Modal visible={!!selectedTicket} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LinearGradient
              colors={["#0F1535", "#0B0E2A"]}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.modalTitle}>{selectedTicket?.eventTitle}</Text>
            <Text style={styles.modalCode}>#{selectedTicket?.ticketCode}</Text>

            <View style={styles.qrContainer}>
              {qrMutation.isPending ? (
                <ActivityIndicator color={colors.eu.star} size="large" />
              ) : qrPayload ? (
                <View style={styles.qrPlaceholder}>
                  <Ionicons name="qr-code" size={120} color={colors.eu.star} />
                  <Text style={styles.qrText}>TOTP Code</Text>
                  <Text style={styles.qrPayloadText} numberOfLines={2}>
                    {qrPayload}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.qrHint}>
              Muestra este código al organizador para validar tu entrada
            </Text>

            <Pressable
              style={styles.closeBtn}
              onPress={() => {
                setSelectedTicket(null);
                setQrPayload(null);
              }}
            >
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    marginBottom: spacing.xl,
  },
  headerTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
  },

  // Ticket Card
  ticketCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.glassSmall,
  },
  ticketRedeemed: { opacity: 0.6 },
  ticketLeft: { marginRight: spacing.md },
  ticketIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: "rgba(255, 215, 0, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  ticketIconRedeemed: {
    backgroundColor: "rgba(0, 214, 143, 0.10)",
  },
  ticketContent: { flex: 1 },
  ticketTitle: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  ticketCode: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.eu.star,
    marginTop: 2,
  },
  ticketDate: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  ticketRight: { marginLeft: spacing.sm },
  redeemedBadge: {
    backgroundColor: "rgba(0, 214, 143, 0.12)",
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  redeemedText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.status.success,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalCard: {
    width: "100%",
    borderRadius: radii.xxl,
    overflow: "hidden",
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  modalTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h2.fontSize,
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  modalCode: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.eu.star,
    marginBottom: spacing.xl,
  },
  qrContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  qrPlaceholder: { alignItems: "center", gap: spacing.sm },
  qrText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  qrPayloadText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.tertiary,
    textAlign: "center",
    maxWidth: 180,
  },
  qrHint: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  closeBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  closeBtnText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
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
});
