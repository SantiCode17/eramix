import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography, spacing, radii, borders, shadows, DS } from "@/design-system/tokens";
import * as groupsApi from "@/api/groups";
import type { GroupData } from "@/types/groups";
import { CategoryTab } from "@/components";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import type { ChatStackParamList, ConversationData } from "@/types/chat";
// import { chatEmpty } from "@/assets/images";

type Nav = StackNavigationProp<ChatStackParamList, "ConversationsList">;

const TAB_FILTERS = ["Todos", "Sin leer", "Grupos"] as const;
type TabFilter = (typeof TAB_FILTERS)[number];

function relativeTime(isoDate: string | null): string {
  if (!isoDate) return "";
  const now = Date.now();
  const date = new Date(isoDate).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(isoDate).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function ChatAvatar({
  uri,
  name,
  online,
  size = 52,
}: {
  uri: string | null;
  name: string;
  online: boolean;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
      ) : (
        <LinearGradient
          colors={["rgba(59,107,255,0.3)", "rgba(26,61,232,0.2)"]}
          style={[
            styles.avatarFallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.avatarInitials, { fontSize: size * 0.34 }]}>
            {initials}
          </Text>
        </LinearGradient>
      )}
      {online && (
        <View style={styles.onlineRing}>
          <View style={styles.onlineDot} />
        </View>
      )}
    </View>
  );
}

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: ConversationData;
  onPress: () => void;
}) {
  const hasUnread = conversation.unreadCount > 0;
  const lastMsg = conversation.lastMessage;
  const rawPreview = lastMsg?.type === "IMAGE"
    ? (lastMsg.content?.trim() ? `📷 ${lastMsg.content}` : "📷 Imagen")
    : (lastMsg?.content ?? "Inicia la conversacion");
  const truncated =
    rawPreview.length > 42 ? rawPreview.substring(0, 42) + "..." : rawPreview;
  const time = relativeTime(conversation.lastMessageAt);
  const fullName = `${conversation.otherUserFirstName} ${conversation.otherUserLastName}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <ChatAvatar
        uri={resolveMediaUrl(conversation.otherUserProfilePhotoUrl) ?? null}
        name={fullName}
        online={conversation.otherUserOnline}
      />
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text
            style={[styles.name, hasUnread && styles.nameUnread]}
            numberOfLines={1}
          >
            {fullName}
          </Text>
          <Text style={[styles.time, hasUnread && styles.timeUnread]}>
            {time}
          </Text>
        </View>
        <View style={styles.rowBottom}>
          <Text
            style={[styles.preview, hasUnread && styles.previewUnread]}
            numberOfLines={1}
          >
            {truncated}
          </Text>
          {hasUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {conversation.unreadCount > 99
                  ? "99+"
                  : String(conversation.unreadCount)}
              </Text>
            </View>
          )}
        </View>
      </View>
      {hasUnread && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

function ChatEmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        style={styles.emptyIconCircle}
      >
        <Ionicons name="chatbubbles-outline" size={40} color="rgba(255,215,0,0.5)" />
      </Animated.View>
      <Animated.Text
        entering={FadeInDown.delay(400).springify()}
        style={styles.emptyTitle}
      >
        Sin conversaciones
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(600).springify()}
        style={styles.emptySubtitle}
      >
        Descubre estudiantes Erasmus y empieza a chatear
      </Animated.Text>
    </View>
  );
}

function GroupRow({
  group,
  onPress,
}: {
  group: GroupData;
  onPress: () => void;
}) {
  const hasUnread = (group.unreadCount ?? 0) > 0;
  const preview = group.lastMessage ?? "Grupo creado";
  const truncated = preview.length > 42 ? preview.substring(0, 42) + "..." : preview;
  const time = group.lastMessageAt ? relativeTime(group.lastMessageAt) : "";
  const initials = group.name.slice(0, 2).toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={{ width: 52, height: 52 }}>
        {resolveMediaUrl(group.avatarUrl) ? (
          <Image
            source={{ uri: resolveMediaUrl(group.avatarUrl)! }}
            style={[styles.avatar, { width: 52, height: 52, borderRadius: 26 }]}
          />
        ) : (
          <LinearGradient
            colors={["rgba(255,215,0,0.2)", "rgba(255,107,43,0.15)"]}
            style={[styles.avatarFallback, { width: 52, height: 52, borderRadius: 26 }]}
          >
            <Text style={[styles.avatarInitials, { fontSize: 18 }]}>{initials}</Text>
          </LinearGradient>
        )}
      </View>
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, gap: 6 }}>
            <Ionicons name="people" size={13} color={colors.eu.star} />
            <Text style={[styles.name, hasUnread && styles.nameUnread]} numberOfLines={1}>
              {group.name}
            </Text>
          </View>
          <Text style={[styles.time, hasUnread && styles.timeUnread]}>{time}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={[styles.preview, hasUnread && styles.previewUnread]} numberOfLines={1}>
            {truncated}
          </Text>
          {hasUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {group.unreadCount > 99 ? "99+" : String(group.unreadCount)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function ConversationsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TabFilter>("Todos");
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const {
    conversations,
    isLoadingConversations,
    isWsConnected,
    fetchConversations,
  } = useChatStore();

  const filteredConversations = useMemo(() => {
    let list = conversations;

    // Tab filter
    if (activeFilter === "Sin leer") {
      list = list.filter((c) => c.unreadCount > 0);
    } else if (activeFilter === "Grupos") {
      return []; // Groups are handled separately
    }

    // Search filter
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((c) => {
      const name = `${c.otherUserFirstName} ${c.otherUserLastName}`.toLowerCase();
      return name.includes(q);
    });
  }, [conversations, searchQuery, activeFilter]);

  const filteredGroups = useMemo(() => {
    if (activeFilter !== "Grupos") return [];
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, searchQuery, activeFilter]);

  const fetchGroups = useCallback(async () => {
    setGroupsLoading(true);
    try {
      const data = await groupsApi.getMyGroups();
      setGroups(data ?? []);
    } catch (e) {
      console.warn("[Chat] Error fetching groups:", e);
    } finally {
      setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchGroups();
    }
  }, [user?.id]);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      fetchConversations();
      fetchGroups();
    });
    return unsub;
  }, [navigation, fetchConversations, fetchGroups]);

  const handlePress = useCallback(
    (conv: ConversationData) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate("ChatRoom", {
        conversationId: conv.id,
        otherUserId: conv.otherUserId,
        otherUserName: `${conv.otherUserFirstName} ${conv.otherUserLastName}`,
        otherUserPhoto: resolveMediaUrl(conv.otherUserProfilePhotoUrl) ?? null,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: ConversationData }) => (
      <ConversationRow
        conversation={item}
        onPress={() => handlePress(item)}
      />
    ),
    [handlePress],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[DS.background, "#0E1A35", "#0F1535"]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View
        entering={FadeIn.delay(50)}
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Mensajes</Text>
            <Text style={styles.headerSubtitle}>Tus conversaciones</Text>
          </View>
          <View
            style={[
              styles.connectionPill,
              {
                backgroundColor: isWsConnected
                  ? "rgba(0,214,143,0.10)"
                  : "rgba(255,79,111,0.10)",
              },
            ]}
          >
            <View
              style={[
                styles.connDot,
                { backgroundColor: isWsConnected ? "#00D68F" : "#FF4F6F" },
              ]}
            />
            <Text
              style={[
                styles.connText,
                { color: isWsConnected ? "#00D68F" : "#FF4F6F" },
              ]}
            >
              {isWsConnected ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={16}
            color={colors.text.disabled}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversaciones..."
            placeholderTextColor={colors.text.disabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.text.tertiary} />
            </Pressable>
          )}
        </View>
        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {TAB_FILTERS.map((tab) => (
            <CategoryTab
              key={tab}
              label={tab}
              active={activeFilter === tab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(tab);
              }}
            />
          ))}
        </View>
      </Animated.View>
      {isLoadingConversations && conversations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.eu.star} size="large" />
          <Text style={styles.loadingText}>Cargando mensajes...</Text>
        </View>
      ) : activeFilter === "Grupos" ? (
        <FlashList
          data={filteredGroups}
          renderItem={({ item }: { item: GroupData }) => (
            <GroupRow
              group={item}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate("GroupChat" as any, { groupId: item.id, groupName: item.name });
              }}
            />
          )}
          keyExtractor={(item) => `group-${item.id}`}
          ListEmptyComponent={ChatEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={groupsLoading}
              onRefresh={fetchGroups}
              tintColor={colors.eu.star}
              colors={[colors.eu.star]}
            />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 80, flexGrow: 1 }}
        />
      ) : (
        <FlashList
          data={filteredConversations}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={ChatEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingConversations}
              onRefresh={fetchConversations}
              tintColor={colors.eu.star}
              colors={[colors.eu.star]}
            />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 80, flexGrow: 1 }}
        />
      )}

      {/* FAB — Create group */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate("CreateGroup");
        }}
      >
        <LinearGradient
          colors={colors.gradient.accent}
          style={styles.fabGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="people-outline" size={22} color="#FFF" />
          <Ionicons name="add" size={14} color="#FFF" style={{ marginLeft: -4, marginTop: -8 }} />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DS.background },
  header: { paddingHorizontal: spacing.lg, paddingBottom: 0 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  connectionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: borders.hairline,
    borderColor: "rgba(255,255,255,0.06)",
  },
  connDot: { width: 7, height: 7, borderRadius: 3.5 },
  connText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.tiny.fontSize,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    borderWidth: borders.hairline,
    borderColor: "rgba(255,255,255,0.08)",
    height: 42,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.primary,
    padding: 0,
    height: 42,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    gap: spacing.md,
    borderBottomWidth: borders.hairline,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  rowPressed: { backgroundColor: "rgba(255,255,255,0.04)" },
  rowContent: { flex: 1, gap: 3 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  unreadDot: {
    width: 4,
    height: 28,
    borderRadius: 2,
    backgroundColor: colors.eu.star,
    opacity: 0.7,
  },
  avatar: { backgroundColor: "rgba(255,255,255,0.06)" },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  avatarInitials: {
    fontFamily: typography.families.subheading,
    color: colors.text.primary,
  },
  onlineRing: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: DS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00D68F",
  },
  name: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  nameUnread: { fontFamily: typography.families.bodyBold },
  time: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  timeUnread: { color: colors.eu.star },
  preview: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  previewUnread: {
    color: colors.text.primary,
    fontFamily: typography.families.bodyMedium,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.eu.orange,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontFamily: typography.families.bodyBold,
    fontSize: 11,
    color: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
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
    fontSize: 22,
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontFamily: typography.families.body,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: spacing.xxl,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  filterTabActive: {
    backgroundColor: "rgba(255,215,0,0.12)",
    borderColor: "rgba(255,215,0,0.25)",
  },
  filterTabText: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
  filterTabTextActive: {
    color: colors.eu.star,
    fontFamily: typography.families.bodyMedium,
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    zIndex: 10,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    ...shadows.lg,
  },
});
