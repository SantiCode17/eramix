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
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { useDiscoverStore } from "@/store/useDiscoverStore";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import {
  GlassCard,
  Header,
  LoadingSpinner,
  EmptyState,
  ScreenBackground,
} from "@/design-system";
import {
  colors,
  typography,
  spacing,
  radii,
} from "@/design-system/tokens";
import { CategoryTab } from "@/components";
import type { FriendRequestResponse, DiscoverStackParamList } from "@/types";

type NavProp = StackNavigationProp<DiscoverStackParamList, "FriendRequests">;
type Tab = "received" | "sent";

/* ── helper ───────────────────────────────────────── */

function formatRelativeDate(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

/* ── AvatarBlock ──────────────────────────────────── */

function AvatarBlock({
  uri,
  initial,
  gradColors,
}: {
  uri: string | null;
  initial: string;
  gradColors: [string, string];
}) {
  if (uri) {
    return (
      <Image
        source={{ uri: resolveMediaUrl(uri) }}
        style={st.avatar}
      />
    );
  }
  return (
    <LinearGradient colors={gradColors} style={st.avatarPlaceholder}>
      <Text style={st.avatarInitial}>{initial}</Text>
    </LinearGradient>
  );
}

/* ── ReceivedItem ─────────────────────────────────── */

interface ReceivedItemProps {
  item: FriendRequestResponse;
  index: number;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onPress: (userId: number) => void;
}

const ReceivedItem = React.memo(function ReceivedItem({
  item,
  index,
  onAccept,
  onReject,
  onPress,
}: ReceivedItemProps) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(350)}>
      <GlassCard style={st.card}>
        <Pressable style={st.cardLeft} onPress={() => onPress(item.senderId)}>
          <AvatarBlock
            uri={item.senderProfilePhotoUrl}
            initial={item.senderFirstName[0]}
            gradColors={["#1A3DE8", "#3B6BFF"]}
          />
          <View style={st.cardInfo}>
            <Text style={st.cardName} numberOfLines={1}>
              {item.senderFirstName} {item.senderLastName}
            </Text>
            <Text style={st.cardDate}>{formatRelativeDate(item.createdAt)}</Text>
          </View>
        </Pressable>

        <View style={st.cardActions}>
          <Pressable style={st.rejectBtn} onPress={() => onReject(item.id)}>
            <Ionicons name="close" size={18} color="#FF6B6B" />
          </Pressable>
          <Pressable style={st.acceptBtn} onPress={() => onAccept(item.id)}>
            <Ionicons name="checkmark" size={18} color="#4CAF50" />
          </Pressable>
        </View>
      </GlassCard>
    </Animated.View>
  );
});

/* ── SentItem ─────────────────────────────────────── */

interface SentItemProps {
  item: FriendRequestResponse;
  index: number;
  onCancel: (id: number) => void;
  onPress: (userId: number) => void;
}

const SentItem = React.memo(function SentItem({
  item,
  index,
  onCancel,
  onPress,
}: SentItemProps) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(350)}>
      <GlassCard style={st.card}>
        <Pressable style={st.cardLeft} onPress={() => onPress(item.receiverId)}>
          <AvatarBlock
            uri={item.receiverProfilePhotoUrl}
            initial={item.receiverFirstName[0]}
            gradColors={["#8B5CF6", "#B47AFF"]}
          />
          <View style={st.cardInfo}>
            <Text style={st.cardName} numberOfLines={1}>
              {item.receiverFirstName} {item.receiverLastName}
            </Text>
            <Text style={st.cardDate}>{formatRelativeDate(item.createdAt)}</Text>
          </View>
        </Pressable>

        {item.status === "PENDING" ? (
          <Pressable style={st.cancelBtn} onPress={() => onCancel(item.id)}>
            <Text style={st.cancelText}>Cancelar</Text>
          </Pressable>
        ) : (
          <View
            style={[
              st.statusBadge,
              item.status === "ACCEPTED" ? st.statusAccepted : st.statusRejected,
            ]}
          >
            <Text
              style={[
                st.statusText,
                { color: item.status === "ACCEPTED" ? "#4CAF50" : "#FF6B6B" },
              ]}
            >
              {item.status === "ACCEPTED" ? "Aceptada" : "Rechazada"}
            </Text>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
});

/* ── Screen ──────────────────────────────────────── */

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

  const handleUserPress = useCallback(
    (userId: number) => {
      navigation.navigate("UserDetail", { userId });
    },
    [navigation],
  );

  const data = activeTab === "received" ? receivedRequests : sentRequests;

  return (
    <ScreenBackground>
      <Header title="Solicitudes" onBack={() => navigation.goBack()} />

      {/* tab bar */}
      <View style={st.tabRow}>
        <CategoryTab
          label={`Recibidas${receivedRequests.length > 0 ? ` (${receivedRequests.length})` : ""}`}
          active={activeTab === "received"}
          onPress={() => setActiveTab("received")}
        />
        <CategoryTab
          label={`Enviadas${sentRequests.length > 0 ? ` (${sentRequests.length})` : ""}`}
          active={activeTab === "sent"}
          onPress={() => setActiveTab("sent")}
        />
      </View>

      {/* list */}
      {requestsLoading && data.length === 0 ? (
        <View style={st.centered}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) =>
            activeTab === "received" ? (
              <ReceivedItem
                item={item}
                index={index}
                onAccept={handleAccept}
                onReject={handleReject}
                onPress={handleUserPress}
              />
            ) : (
              <SentItem
                item={item}
                index={index}
                onCancel={handleCancel}
                onPress={handleUserPress}
              />
            )
          }
          contentContainerStyle={st.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.eu.star}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={activeTab === "received" ? "mail-outline" : "send-outline"}
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
    </ScreenBackground>
  );
}

/* ── styles ──────────────────────────────────────── */

const st = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  tabRow: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },

  /* list */
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
    gap: spacing.sm,
  },

  /* card */
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
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
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarInitial: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: "rgba(255,255,255,0.9)",
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
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
    marginTop: 2,
  },

  /* actions */
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  acceptBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(76,175,80,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(76,175,80,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  rejectBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(244,67,54,0.10)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(244,67,54,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    marginLeft: spacing.sm,
  },
  cancelText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  statusBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  statusAccepted: {
    backgroundColor: "rgba(76,175,80,0.10)",
  },
  statusRejected: {
    backgroundColor: "rgba(244,67,54,0.10)",
  },
  statusText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.bodySmall.fontSize,
  },
});
