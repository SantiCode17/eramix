import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  FadeInDown,
  FadeOut,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import * as notificationsApi from "@/api/notifications";
import { friendRequestsApi } from "@/api/discoverService";
import { friendsApi } from "@/api/profileService";
import { handleError } from "@/utils/errorHandler";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  radii,
  DS,
  TAB_BAR_HEIGHT,
} from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
import type { NotificationData, NotificationType } from "@/types/notifications";
import type { FriendRequestResponse } from "@/types";

type IoniconsName = keyof typeof Ionicons.glyphMap;
const SWIPE_THRESHOLD = -72;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const NOTIF_CONFIG: Record<
  NotificationType,
  { icon: IoniconsName; accent: string; category: string; navigateTo?: string }
> = {
  FRIEND_REQUEST:  { icon: "person-add-outline",         accent: "#5B8DEF",           category: "Social",   navigateTo: "requests" },
  FRIEND_ACCEPTED: { icon: "checkmark-circle-outline",   accent: colors.eu.star,       category: "Social",   navigateTo: "profile" },
  NEW_MESSAGE:     { icon: "chatbubble-outline",         accent: colors.text.primary,  category: "Mensajes", navigateTo: "chat" },
  EVENT_INVITE:    { icon: "calendar-outline",           accent: colors.eu.orange,     category: "Eventos",  navigateTo: "events" },
  EVENT_REMINDER:  { icon: "alarm-outline",              accent: "#FF8B4F",            category: "Eventos",  navigateTo: "events" },
  SYSTEM:          { icon: "information-circle-outline", accent: colors.text.secondary, category: "Sistema" },
};

const MAIN_TABS = ["Notificaciones", "Solicitudes"] as const;
type MainTab = (typeof MAIN_TABS)[number];
const REQUEST_TABS = ["Recibidas", "Enviadas"] as const;
type RequestTab = (typeof REQUEST_TABS)[number];

/* ═══ Swipeable Notification Card ═══ */
function SwipeableNotificationCard({
  item,
  onDelete,
  onPress,
}: {
  item: NotificationData;
  onDelete: (id: number) => void;
  onPress: (item: NotificationData) => void;
}) {
  const translateX = useSharedValue(0);
  const cardHeight = useSharedValue<number | undefined>(undefined);
  const isDeleted = useSharedValue(false);
  const config = NOTIF_CONFIG[item.type] ?? NOTIF_CONFIG.SYSTEM;

  const triggerDelete = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete(id);
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-20, 20])
    .onUpdate((event) => {
      if (isDeleted.value) return;
      if (event.translationX > 0) {
        translateX.value = Math.max(event.translationX * 0.1, 0); // Much resistance going right
      } else {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (isDeleted.value) return;
      const shouldDelete = event.translationX < SWIPE_THRESHOLD || event.velocityX < -800;
      if (shouldDelete) {
        isDeleted.value = true;
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 }, () => {
          runOnJS(triggerDelete)(item.id);
        });
      } else {
        translateX.value = withSpring(0, { 
          damping: 20, 
          stiffness: 250,
          mass: 0.6,
          velocity: event.velocityX
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteRevealStyle = useAnimatedStyle(() => {
    const progress = Math.min(Math.abs(translateX.value) / 90, 1);
    return {
      opacity: progress,
      transform: [{ scale: 0.8 + progress * 0.2 }],
    };
  });

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

  return (
    <Animated.View
      style={st.swipeContainer}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
    >
      {/* Delete reveal behind */}
      <Animated.View style={[st.swipeActions, deleteRevealStyle]}>
        <View style={st.swipeDeleteBtn}>
          <Ionicons name="trash" size={22} color="#FFF" />
          <Text style={st.swipeDeleteText}>Borrar</Text>
        </View>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[st.card, !item.isRead && st.cardUnread, animatedStyle]}>
          <Pressable style={st.cardPressable} onPress={() => onPress(item)}>
            <View style={[st.iconCircle, { borderColor: config.accent }]}>
              <Ionicons name={config.icon} size={22} color={config.accent} />
            </View>

            <View style={st.cardBody}>
              <View style={st.cardTitleRow}>
                <Text style={st.cardTitle} numberOfLines={1}>{item.title}</Text>
                <View style={[st.categoryBadge, { backgroundColor: config.accent + "18" }]}>
                  <Text style={[st.categoryBadgeText, { color: config.accent }]}>{config.category}</Text>
                </View>
              </View>
              <Text style={st.cardMessage} numberOfLines={2}>{item.body}</Text>
              <View style={st.cardFooter}>
                <Text style={st.cardTime}>{timeAgo(item.createdAt)}</Text>
                {!item.isRead && <View style={st.unreadDot} />}
              </View>
            </View>

            <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

/* ═══ Request Card ═══ */
function RequestCard({
  request,
  type,
  onAccept,
  onReject,
  onViewProfile,
}: {
  request: FriendRequestResponse;
  type: "received" | "sent";
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onViewProfile: (request: FriendRequestResponse) => void;
}) {
  const name = type === "received"
    ? `${request.senderFirstName} ${request.senderLastName}`
    : `${(request as any).receiverFirstName ?? "Usuario"} ${(request as any).receiverLastName ?? ""}`;
  const photoUrl = type === "received" ? request.senderProfilePhotoUrl : (request as any).receiverProfilePhotoUrl;

  return (
    <Animated.View entering={FadeInDown.springify()} layout={Layout.springify()}>
      <Pressable style={st.requestCard} onPress={() => onViewProfile(request)}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={st.avatar} />
        ) : (
          <View style={[st.avatar, st.avatarPlaceholder]}>
            <Ionicons name="person-circle" size={48} color={colors.eu.star} />
          </View>
        )}

        <View style={st.requestBody}>
          <Text style={st.requestName} numberOfLines={1}>{name.trim()}</Text>
          <Text style={st.requestStatus}>
            {type === "received"
              ? "Quiere conectar contigo"
              : `Solicitud ${request.status === "PENDING" ? "pendiente" : request.status === "ACCEPTED" ? "aceptada" : "rechazada"}`}
          </Text>
        </View>

        {type === "received" && request.status === "PENDING" && (
          <View style={st.requestActions}>
            <Pressable
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onAccept?.(request.id);
              }}
              style={[st.actionBtn, st.acceptBtn]}
            >
              <Ionicons name="checkmark" size={18} color={colors.eu.deep} />
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onReject?.(request.id);
              }}
              style={[st.actionBtn, st.rejectBtn]}
            >
              <Ionicons name="close" size={18} color={colors.text.primary} />
            </Pressable>
          </View>
        )}

        {type === "sent" && request.status === "PENDING" && (
          <View style={st.pendingBadge}>
            <Ionicons name="time-outline" size={14} color={colors.eu.star} />
            <Text style={st.pendingText}>Pendiente</Text>
          </View>
        )}

        {type === "sent" && request.status === "ACCEPTED" && (
          <View style={[st.pendingBadge, { backgroundColor: "rgba(0,214,143,0.10)", borderColor: "rgba(0,214,143,0.20)" }]}>
            <Ionicons name="checkmark-circle" size={14} color="#00D68F" />
            <Text style={[st.pendingText, { color: "#00D68F" }]}>Aceptada</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

/* ═══ Main Screen ═══ */
export default function NotificationsScreen(): React.JSX.Element {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [receivedRequests, setReceivedRequests] = useState<FriendRequestResponse[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestResponse[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [refreshingRequests, setRefreshingRequests] = useState(false);

  const [activeMainTab, setActiveMainTab] = useState<MainTab>("Notificaciones");
  const [activeRequestTab, setActiveRequestTab] = useState<RequestTab>("Recibidas");

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationData | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<FriendRequestResponse | null>(null);

  /* ── Fetchers ── */
  const fetchNotifications = useCallback(async (pageNum = 0, append = false) => {
    try {
      const res = await notificationsApi.getNotifications(pageNum, 20);
      const items: NotificationData[] = res.content ?? res;
      if (append) setNotifications((prev) => [...prev, ...items]);
      else setNotifications(items);
      setHasMore(res.totalPages != null ? pageNum < res.totalPages - 1 : items.length >= 20);
      setPage(pageNum);
    } catch (e) { handleError(e, "Notifications.fetch"); }
  }, []);

  const fetchUnread = useCallback(async () => {
    try { setUnreadCount(await notificationsApi.getUnreadCount()); }
    catch (e) { handleError(e, "Notifications.getUnreadCount"); }
  }, []);

  const fetchReceivedRequests = useCallback(async () => {
    try {
      const r = await friendRequestsApi.getReceived();
      setReceivedRequests(Array.isArray(r) ? r : []);
    } catch (e) { handleError(e, "FriendRequests.fetchReceived"); }
  }, []);

  const fetchSentRequests = useCallback(async () => {
    try {
      const r = await friendRequestsApi.getSent();
      setSentRequests(Array.isArray(r) ? r : []);
    } catch (e) { handleError(e, "FriendRequests.fetchSent"); }
  }, []);

  const fetchAllRequests = useCallback(async () => {
    setLoadingRequests(true);
    await Promise.all([fetchReceivedRequests(), fetchSentRequests()]);
    setLoadingRequests(false);
  }, [fetchReceivedRequests, fetchSentRequests]);

  /* ── Actions ── */
  const handleAcceptRequest = useCallback(async (requestId: number) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await friendRequestsApi.respond(requestId, "ACCEPTED");
      setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (e) { handleError(e, "FriendRequest.accept"); }
  }, []);

  const handleRejectRequest = useCallback(async (requestId: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await friendRequestsApi.respond(requestId, "REJECTED");
      setReceivedRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (e) { handleError(e, "FriendRequest.reject"); }
  }, []);

  const handleBlockUser = useCallback(async (userId: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await friendsApi.blockUser(userId);
      setReceivedRequests((prev) => prev.filter((r) => r.senderId !== userId));
      setProfileModalVisible(false);
    } catch (e) { handleError(e, "User.block"); }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) { handleError(e, "Notifications.markAllRead"); }
  }, []);

  const handleMarkRead = useCallback(async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) { handleError(e, "Notifications.markRead"); }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await notificationsApi.deleteNotification(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) { handleError(e, "Notifications.delete"); }
  }, []);

  const handleNotificationPress = useCallback((item: NotificationData) => {
    if (!item.isRead) handleMarkRead(item.id);
    const config = NOTIF_CONFIG[item.type] ?? NOTIF_CONFIG.SYSTEM;

    switch (config.navigateTo) {
      case "chat":
        if ((item as any).referenceId) {
          navigation.navigate("HomeTabs", {
            screen: "Chat",
            params: { screen: "ChatRoom", params: { conversationId: (item as any).referenceId, otherUserId: 0, otherUserName: item.title, otherUserPhoto: null } },
          });
        } else {
          navigation.navigate("HomeTabs", { screen: "Chat" });
        }
        break;
      case "events":
        navigation.navigate("HomeTabs", { screen: "Events" });
        break;
      case "profile":
        if ((item as any).referenceId) {
          navigation.navigate("HomeTabs", {
            screen: "Profile",
            params: { screen: "ViewProfile", params: { userId: (item as any).referenceId } },
          });
        }
        break;
      case "requests":
        setActiveMainTab("Solicitudes");
        break;
      default:
        setSelectedNotification(item);
        setDetailModalVisible(true);
        break;
    }
  }, [handleMarkRead, navigation]);

  /* ── Effects ── */
  useEffect(() => {
    (async () => {
      if (activeMainTab === "Notificaciones") {
        setLoading(true);
        await Promise.all([fetchNotifications(0), fetchUnread()]);
        setLoading(false);
      } else {
        await fetchAllRequests();
      }
    })();
  }, [activeMainTab, fetchNotifications, fetchUnread, fetchAllRequests]);

  const onRefreshNotifications = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchNotifications(0), fetchUnread()]);
    setRefreshing(false);
  }, [fetchNotifications, fetchUnread]);

  const onRefreshRequests = useCallback(async () => {
    setRefreshingRequests(true);
    await fetchAllRequests();
    setRefreshingRequests(false);
  }, [fetchAllRequests]);

  const loadMore = useCallback(() => {
    if (!hasMore) return;
    fetchNotifications(page + 1, true);
  }, [hasMore, page, fetchNotifications]);

  const currentRequests = activeRequestTab === "Recibidas" ? receivedRequests : sentRequests;

  /* ═══ UI ═══ */
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenBackground>
        <View style={{ flex: 1, paddingTop: insets.top }}>
          {/* Header */}
          <View style={st.header}>
            <Pressable onPress={() => navigation.goBack()} style={st.backBtn} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
            </Pressable>
            <Text style={st.headerTitle}>Centro de actividad</Text>
            {activeMainTab === "Notificaciones" && unreadCount > 0 ? (
              <Pressable onPress={handleMarkAllRead} hitSlop={12}>
                <Text style={st.markAllText}>Leer todo</Text>
              </Pressable>
            ) : (
              <View style={{ width: 60 }} />
            )}
          </View>

          {/* Unread banner */}
          {activeMainTab === "Notificaciones" && unreadCount > 0 && (
            <View style={st.unreadBanner}>
              <Ionicons name="notifications" size={14} color={colors.eu.star} />
              <Text style={st.unreadBannerText}>{unreadCount} sin leer</Text>
            </View>
          )}

          {/* Main Tab Selector */}
          <View style={st.mainTabRow}>
            {MAIN_TABS.map((tab) => {
              const active = activeMainTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveMainTab(tab);
                  }}
                  style={[st.mainTab, active && st.mainTabActive]}
                >
                  <Ionicons
                    name={tab === "Notificaciones" ? "notifications-outline" : "people-outline"}
                    size={16}
                    color={active ? colors.eu.star : colors.text.secondary}
                  />
                  <Text style={[st.mainTabText, active && st.mainTabTextActive]}>{tab}</Text>
                  {tab === "Notificaciones" && unreadCount > 0 && (
                    <View style={st.tabBadge}>
                      <Text style={st.tabBadgeText}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
                    </View>
                  )}
                  {tab === "Solicitudes" && receivedRequests.length > 0 && (
                    <View style={st.tabBadge}>
                      <Text style={st.tabBadgeText}>{receivedRequests.length}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* ─── NOTIFICATIONS TAB ─── */}
          {activeMainTab === "Notificaciones" && (
            <>
              {loading ? (
                <View style={st.center}>
                  <ActivityIndicator size="large" color={colors.eu.star} />
                </View>
              ) : (
                <FlashList
                  data={notifications}
                  keyExtractor={(n) => String(n.id)}
                  renderItem={({ item }) => (
                    <SwipeableNotificationCard
                      item={item}
                      onDelete={handleDelete}
                      onPress={handleNotificationPress}
                    />
                  )}
                  contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + spacing.md }}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefreshNotifications} tintColor={colors.eu.star} />
                  }
                  onEndReached={loadMore}
                  onEndReachedThreshold={0.5}
                  ListEmptyComponent={
                    <View style={st.empty}>
                      <View style={st.emptyIconCircle}>
                        <Ionicons name="notifications-outline" size={40} color="rgba(255,215,0,0.5)" />
                      </View>
                      <Text style={st.emptyTitle}>Todo al día</Text>
                      <Text style={st.emptySubtitle}>No tienes notificaciones pendientes</Text>
                    </View>
                  }
                />
              )}
            </>
          )}

          {/* ─── SOLICITUDES TAB ─── */}
          {activeMainTab === "Solicitudes" && (
            <>
              <View style={st.subTabRow}>
                {REQUEST_TABS.map((tab) => {
                  const active = activeRequestTab === tab;
                  const count = tab === "Recibidas" ? receivedRequests.length : sentRequests.length;
                  return (
                    <Pressable
                      key={tab}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setActiveRequestTab(tab);
                      }}
                      style={[st.subTab, active && st.subTabActive]}
                    >
                      <Text style={[st.subTabText, active && st.subTabTextActive]}>
                        {tab} ({count})
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {loadingRequests ? (
                <View style={st.center}>
                  <ActivityIndicator size="large" color={colors.eu.star} />
                </View>
              ) : (
                <FlashList
                  data={currentRequests}
                  keyExtractor={(r) => String(r.id)}
                  renderItem={({ item: request }) => (
                    <RequestCard
                      request={request}
                      type={activeRequestTab === "Recibidas" ? "received" : "sent"}
                      onAccept={handleAcceptRequest}
                      onReject={handleRejectRequest}
                      onViewProfile={(r) => {
                        setSelectedRequest(r);
                        setProfileModalVisible(true);
                      }}
                    />
                  )}
                  contentContainerStyle={{ paddingBottom: insets.bottom + TAB_BAR_HEIGHT + spacing.md }}
                  refreshControl={
                    <RefreshControl refreshing={refreshingRequests} onRefresh={onRefreshRequests} tintColor={colors.eu.star} />
                  }
                  ListEmptyComponent={
                    <View style={st.empty}>
                      <View style={st.emptyIconCircle}>
                        <Ionicons
                          name={activeRequestTab === "Recibidas" ? "person-add-outline" : "paper-plane-outline"}
                          size={40}
                          color="rgba(255,215,0,0.5)"
                        />
                      </View>
                      <Text style={st.emptyTitle}>
                        {activeRequestTab === "Recibidas" ? "Sin solicitudes recibidas" : "Sin solicitudes enviadas"}
                      </Text>
                      <Text style={st.emptySubtitle}>
                        {activeRequestTab === "Recibidas"
                          ? "Las solicitudes de amistad aparecerán aquí"
                          : "Las solicitudes que envíes aparecerán aquí"}
                      </Text>
                    </View>
                  }
                />
              )}
            </>
          )}

          {/* ─── Notification Detail Modal ─── */}
          {selectedNotification && (
            <Modal visible={detailModalVisible} transparent animationType="fade" onRequestClose={() => setDetailModalVisible(false)}>
              <Pressable style={st.modalOverlay} onPress={() => setDetailModalVisible(false)}>
                <Pressable style={st.detailModalContent} onPress={() => {}}>
                  <View style={st.detailModalHeader}>
                    <View style={[st.detailIconCircle, { borderColor: (NOTIF_CONFIG[selectedNotification.type] ?? NOTIF_CONFIG.SYSTEM).accent }]}>
                      <Ionicons
                        name={(NOTIF_CONFIG[selectedNotification.type] ?? NOTIF_CONFIG.SYSTEM).icon}
                        size={28}
                        color={(NOTIF_CONFIG[selectedNotification.type] ?? NOTIF_CONFIG.SYSTEM).accent}
                      />
                    </View>
                    <Pressable onPress={() => setDetailModalVisible(false)}>
                      <Ionicons name="close-circle" size={28} color={colors.text.tertiary} />
                    </Pressable>
                  </View>
                  <Text style={st.detailTitle}>{selectedNotification.title}</Text>
                  <Text style={st.detailBody}>{selectedNotification.body}</Text>
                  <View style={st.detailMeta}>
                    <Ionicons name="time-outline" size={14} color={colors.text.tertiary} />
                    <Text style={st.detailTime}>
                      {new Date(selectedNotification.createdAt).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                    </Text>
                  </View>
                  <Pressable
                    style={st.detailDeleteBtn}
                    onPress={() => { handleDelete(selectedNotification.id); setDetailModalVisible(false); }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                    <Text style={st.detailDeleteText}>Eliminar notificación</Text>
                  </Pressable>
                </Pressable>
              </Pressable>
            </Modal>
          )}

          {/* ─── Profile Modal ─── */}
          {selectedRequest && (
            <Modal visible={profileModalVisible} transparent animationType="fade" onRequestClose={() => setProfileModalVisible(false)}>
              <Pressable style={st.modalOverlay} onPress={() => setProfileModalVisible(false)}>
                <Pressable style={st.profileModalContent} onPress={() => {}}>
                  <View style={st.profileModalAvatar}>
                    {(activeRequestTab === "Recibidas" ? selectedRequest.senderProfilePhotoUrl : (selectedRequest as any).receiverProfilePhotoUrl) ? (
                      <Image source={{ uri: activeRequestTab === "Recibidas" ? selectedRequest.senderProfilePhotoUrl : (selectedRequest as any).receiverProfilePhotoUrl }} style={st.profileModalImg} />
                    ) : (
                      <View style={[st.profileModalImg, st.avatarPlaceholder]}>
                        <Ionicons name="person-circle" size={60} color={colors.eu.star} />
                      </View>
                    )}
                  </View>
                  <Text style={st.profileModalName}>
                    {activeRequestTab === "Recibidas" 
                      ? `${selectedRequest.senderFirstName} ${selectedRequest.senderLastName}`
                      : `${(selectedRequest as any).receiverFirstName ?? "Usuario"} ${(selectedRequest as any).receiverLastName ?? ""}`}
                  </Text>
                  <View style={st.profileModalActions}>
                    {activeRequestTab === "Recibidas" ? (
                      <>
                        <Pressable
                          onPress={() => { handleAcceptRequest(selectedRequest.id); setProfileModalVisible(false); }}
                          style={[st.profileModalBtn, st.acceptModalBtn]}
                        >
                          <Ionicons name="checkmark" size={20} color={colors.eu.deep} />
                          <Text style={[st.profileModalBtnText, { color: colors.eu.deep }]}>Aceptar</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => { handleRejectRequest(selectedRequest.id); setProfileModalVisible(false); }}
                          style={[st.profileModalBtn, st.rejectModalBtn]}
                        >
                          <Ionicons name="close" size={20} color={colors.text.primary} />
                          <Text style={st.profileModalBtnText}>Rechazar</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => handleBlockUser(selectedRequest.senderId)}
                          style={[st.profileModalBtn, st.blockModalBtn]}
                        >
                          <Ionicons name="ban" size={20} color={colors.status.error} />
                          <Text style={[st.profileModalBtnText, { color: colors.status.error }]}>Bloquear</Text>
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        onPress={() => { handleRejectRequest(selectedRequest.id); setProfileModalVisible(false); }}
                        style={[st.profileModalBtn, st.rejectModalBtn, { width: "100%" }]}
                      >
                        <Ionicons name="close" size={20} color={colors.status.error} />
                        <Text style={[st.profileModalBtnText, { color: colors.status.error }]}>Cancelar Solicitud</Text>
                      </Pressable>
                    )}
                  </View>
                </Pressable>
              </Pressable>
            </Modal>
          )}
        </View>
      </ScreenBackground>
    </GestureHandlerRootView>
  );
}

/* ═══ Styles ═══ */
const st = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.text.primary,
  },
  markAllText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.eu.star,
  },

  unreadBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,215,0,0.10)",
    alignSelf: "flex-start",
  },
  unreadBannerText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: colors.eu.star,
  },

  mainTabRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  mainTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: 10,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  mainTabActive: {
    backgroundColor: "rgba(255,215,0,0.10)",
    borderColor: "rgba(255,215,0,0.25)",
  },
  mainTabText: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.secondary,
  },
  mainTabTextActive: {
    color: colors.eu.star,
    fontFamily: typography.families.bodyMedium,
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.eu.orange,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    marginLeft: 2,
  },
  tabBadgeText: {
    fontFamily: typography.families.bodyBold,
    fontSize: 10,
    color: "#FFF",
  },

  subTabRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  subTab: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  subTabActive: {
    backgroundColor: "rgba(255,215,0,0.10)",
    borderColor: "rgba(255,215,0,0.20)",
  },
  subTabText: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
  subTabTextActive: {
    color: colors.eu.star,
    fontFamily: typography.families.bodyMedium,
  },

  swipeContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  swipeActions: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  swipeDeleteBtn: {
    width: 100,
    backgroundColor: colors.status.error,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  swipeDeleteText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: "#FFF",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  cardUnread: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,215,0,0.20)",
  },
  cardPressable: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: { flex: 1 },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardTitle: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  categoryBadgeText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 10,
  },
  cardMessage: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: 4,
  },
  cardTime: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.eu.star,
  },

  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  requestBody: { flex: 1, marginLeft: spacing.md },
  requestName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: colors.text.primary,
  },
  requestStatus: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  requestActions: { flexDirection: "row", gap: spacing.xs },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  acceptBtn: { backgroundColor: colors.eu.star, borderColor: colors.eu.star },
  rejectBtn: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.10)" },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,215,0,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.15)",
  },
  pendingText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 11,
    color: colors.eu.star,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 0,
    minHeight: Dimensions.get("window").height * 0.55,
    gap: spacing.sm,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,215,0,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  detailModalContent: {
    backgroundColor: DS.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  detailModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  detailIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailTitle: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  detailBody: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  detailMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  detailTime: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.tertiary,
  },
  detailDeleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,79,111,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,79,111,0.15)",
  },
  detailDeleteText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 15,
    color: colors.status.error,
  },

  profileModalContent: {
    backgroundColor: DS.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.xl,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  profileModalAvatar: { marginBottom: spacing.md },
  profileModalImg: { width: 80, height: 80, borderRadius: 40 },
  profileModalName: {
    fontFamily: typography.families.heading,
    fontSize: 22,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  profileModalActions: { width: "100%", gap: spacing.sm },
  profileModalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  acceptModalBtn: { backgroundColor: colors.eu.star, borderColor: colors.eu.star },
  rejectModalBtn: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.08)" },
  blockModalBtn: { backgroundColor: "rgba(255,79,111,0.08)", borderColor: "rgba(255,79,111,0.12)" },
  profileModalBtnText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 16,
    color: colors.text.primary,
  },
});
