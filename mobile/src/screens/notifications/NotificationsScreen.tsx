import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as notificationsApi from "@/api/notifications";
import { handleError } from "@/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import { Header, EmptyState, GlassButton } from "@/design-system";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { NotificationData, NotificationType } from "@/types/notifications";

type IoniconsName = keyof typeof Ionicons.glyphMap;

// ── Notification config ─────────────────────────────

const NOTIF_CONFIG: Record<
  NotificationType,
  { icon: IoniconsName; accent: string }
> = {
  FRIEND_REQUEST: { icon: "person-add-outline", accent: "#5B8DEF" },
  FRIEND_ACCEPTED: { icon: "checkmark-circle-outline", accent: colors.eu.star },
  NEW_MESSAGE: { icon: "chatbubble-outline", accent: "#FFF" },
  EVENT_INVITE: { icon: "calendar-outline", accent: colors.eu.orange },
  EVENT_REMINDER: { icon: "alarm-outline", accent: "#FF8B4F" },
  SYSTEM: { icon: "information-circle-outline", accent: colors.text.secondary },
};

export default function NotificationsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(
    async (pageNum = 0, append = false) => {
      try {
        const res = await notificationsApi.getNotifications(pageNum, 20);
        const items: NotificationData[] = res.content ?? res;
        if (append) {
          setNotifications((prev) => [...prev, ...items]);
        } else {
          setNotifications(items);
        }
        setHasMore(
          res.totalPages != null ? pageNum < res.totalPages - 1 : items.length >= 20,
        );
        setPage(pageNum);
      } catch (e) {
        handleError(e, "Notifications.fetch");
      }
    },
    [],
  );

  const fetchUnread = useCallback(async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (e) {
      handleError(e, "Notifications.getUnreadCount");
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchNotifications(0), fetchUnread()]);
      setLoading(false);
    })();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchNotifications(0), fetchUnread()]);
    setRefreshing(false);
  }, [fetchNotifications, fetchUnread]);

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    fetchNotifications(page + 1, true);
  }, [hasMore, page, fetchNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      handleError(e, "Notifications.markAllRead");
    }
  }, []);

  const handleMarkRead = useCallback(async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      handleError(e, "Notifications.markRead");
    }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await notificationsApi.deleteNotification(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      handleError(e, "Notifications.delete");
    }
  }, []);

  const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "ahora";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  const renderItem = useCallback(
    ({ item }: { item: NotificationData }) => {
      const config = NOTIF_CONFIG[item.type] ?? NOTIF_CONFIG.SYSTEM;
      return (
        <Pressable
          style={[styles.card, !item.isRead && styles.cardUnread]}
          onPress={() => {
            if (!item.isRead) handleMarkRead(item.id);
          }}
          onLongPress={() => handleDelete(item.id)}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconCircle,
              { borderColor: config.accent },
            ]}
          >
            <Text style={styles.iconEmoji}><Ionicons name={config.icon} size={22} color={config.accent} /></Text>
          </View>

          {/* Content */}
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardMessage} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={styles.cardTime}>{timeAgo(item.createdAt)}</Text>
          </View>

          {/* Unread dot */}
          {!item.isRead && <View style={styles.unreadDot} />}
        </Pressable>
      );
    },
    [handleMarkRead, handleDelete],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <Header
        title="Notificaciones"
        right={
          unreadCount > 0 ? (
            <Pressable onPress={handleMarkAllRead} hitSlop={12}>
              <Text style={styles.markAllText}>Leer todo</Text>
            </Pressable>
          ) : undefined
        }
      />

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadBannerText}>
            {unreadCount} notificación{unreadCount > 1 ? "es" : ""} sin leer
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.eu.star} />
        </View>
      ) : (
        <FlashList
          data={notifications}
          keyExtractor={(n) => String(n.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.eu.star}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-outline"
              title="Sin notificaciones"
              message="Cuando recibas alertas aparecerán aquí"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  markAllText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.eu.star,
  },

  unreadBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,204,0,0.12)",
    alignSelf: "flex-start",
  },
  unreadBannerText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 12,
    color: colors.eu.star,
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.glass.white,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  cardUnread: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,204,0,0.25)",
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    backgroundColor: colors.glass.white,
    justifyContent: "center",
    alignItems: "center",
  },
  iconEmoji: { fontSize: 18 },

  cardBody: { flex: 1, marginLeft: spacing.md },
  cardTitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
    color: colors.text.primary,
  },
  cardMessage: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  cardTime: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.disabled,
    marginTop: 4,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.eu.star,
    marginLeft: spacing.sm,
  },
});
