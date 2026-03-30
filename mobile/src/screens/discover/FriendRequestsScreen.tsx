import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import { useDiscoverStore } from "@/store/useDiscoverStore";
import { Header, LoadingSpinner, EmptyState, GlassButton } from "@/design-system";
import { colors, typography, spacing, radii, shadows } from "@/design-system/tokens";
import type { FriendRequestResponse, DiscoverStackParamList } from "@/types";

type NavProp = StackNavigationProp<DiscoverStackParamList, "FriendRequests">;
type Tab = "received" | "sent";

export default function FriendRequestsScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();
  const {
    receivedRequests,
    sentRequests,
    requestsLoading,
    fetchReceivedRequests,
    fetchSentRequests,
    respondToRequest,
    cancelRequest,
  } = useDiscoverStore();

  const [activeTab, setActiveTab] = useState<Tab>("received");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReceivedRequests();
    fetchSentRequests();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchReceivedRequests(), fetchSentRequests()]);
    setRefreshing(false);
  }, [fetchReceivedRequests, fetchSentRequests]);

  const handleAccept = useCallback(
    async (requestId: number) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await respondToRequest(requestId, "ACCEPTED");
    },
    [respondToRequest],
  );

  const handleReject = useCallback(
    async (requestId: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await respondToRequest(requestId, "REJECTED");
    },
    [respondToRequest],
  );

  const handleCancel = useCallback(
    async (requestId: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await cancelRequest(requestId);
    },
    [cancelRequest],
  );

  const data = activeTab === "received" ? receivedRequests : sentRequests;

  const renderReceivedItem = useCallback(
    ({ item }: { item: FriendRequestResponse }) => (
      <View style={styles.card}>
        <Pressable
          style={styles.cardLeft}
          onPress={() =>
            navigation.navigate("UserDetail", { userId: item.senderId })
          }
        >
          {item.senderProfilePhotoUrl ? (
            <Image
              source={{ uri: item.senderProfilePhotoUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {item.senderFirstName[0]}
              </Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.senderFirstName} {item.senderLastName}
            </Text>
            <Text style={styles.cardDate}>
              {formatRelativeDate(item.createdAt)}
            </Text>
          </View>
        </Pressable>
        <View style={styles.cardActions}>
          <Pressable
            style={styles.rejectBtn}
            onPress={() => handleReject(item.id)}
          >
            <Text style={styles.btnEmoji}>✕</Text>
          </Pressable>
          <Pressable
            style={styles.acceptBtn}
            onPress={() => handleAccept(item.id)}
          >
            <Text style={styles.btnEmoji}>✓</Text>
          </Pressable>
        </View>
      </View>
    ),
    [navigation, handleAccept, handleReject],
  );

  const renderSentItem = useCallback(
    ({ item }: { item: FriendRequestResponse }) => (
      <View style={styles.card}>
        <Pressable
          style={styles.cardLeft}
          onPress={() =>
            navigation.navigate("UserDetail", { userId: item.receiverId })
          }
        >
          {item.receiverProfilePhotoUrl ? (
            <Image
              source={{ uri: item.receiverProfilePhotoUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {item.receiverFirstName[0]}
              </Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.cardName} numberOfLines={1}>
              {item.receiverFirstName} {item.receiverLastName}
            </Text>
            <Text style={styles.cardDate}>
              {formatRelativeDate(item.createdAt)}
            </Text>
          </View>
        </Pressable>
        {item.status === "PENDING" ? (
          <Pressable
            style={styles.cancelBtn}
            onPress={() => handleCancel(item.id)}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        ) : (
          <View style={styles.statusBadge}>
            <Text
              style={[
                styles.statusText,
                item.status === "ACCEPTED"
                  ? styles.statusAccepted
                  : styles.statusRejected,
              ]}
            >
              {item.status === "ACCEPTED" ? "Aceptada" : "Rechazada"}
            </Text>
          </View>
        )}
      </View>
    ),
    [navigation, handleCancel],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />
      <Header title="Solicitudes" onBack={() => navigation.goBack()} />

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === "received" && styles.tabActive]}
          onPress={() => setActiveTab("received")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "received" && styles.tabTextActive,
            ]}
          >
            Recibidas ({receivedRequests.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "sent" && styles.tabActive]}
          onPress={() => setActiveTab("sent")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sent" && styles.tabTextActive,
            ]}
          >
            Enviadas ({sentRequests.length})
          </Text>
        </Pressable>
      </View>

      {/* List */}
      {requestsLoading && data.length === 0 ? (
        <View style={styles.centered}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={
            activeTab === "received" ? renderReceivedItem : renderSentItem
          }
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.eu.star}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={activeTab === "received" ? "📩" : "📤"}
              title={
                activeTab === "received"
                  ? "Sin solicitudes recibidas"
                  : "Sin solicitudes enviadas"
              }
              message={
                activeTab === "received"
                  ? "Cuando alguien quiera conectar contigo aparecerá aquí"
                  : "Desliza a la derecha en un perfil para enviar una solicitud"
              }
            />
          }
        />
      )}
    </View>
  );
}

// ── Helpers ─────────────────────────────────────────

function formatRelativeDate(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // Tab bar
  tabBar: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: radii.md,
    padding: spacing.xxs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radii.sm,
  },
  tabActive: {
    backgroundColor: "rgba(255, 204, 0, 0.15)",
  },
  tabText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.eu.star,
  },
  // List
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.eu.deep,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarInitial: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.eu.star,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  cardDate: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },
  // Actions
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  acceptBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(76, 175, 80, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(244, 67, 54, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(244, 67, 54, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnEmoji: {
    fontSize: 18,
    color: colors.text.primary,
  },
  cancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginLeft: spacing.sm,
  },
  cancelText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.small.fontSize,
    color: colors.text.secondary,
  },
  statusBadge: {
    marginLeft: spacing.sm,
  },
  statusText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.small.fontSize,
  },
  statusAccepted: {
    color: colors.status.success,
  },
  statusRejected: {
    color: colors.status.error,
  },
});
