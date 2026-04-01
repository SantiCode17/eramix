import React, { useCallback, useEffect, useState } from "react";
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
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { ChatStackParamList, ConversationData } from "@/types/chat";

type Nav = StackNavigationProp<ChatStackParamList, "ConversationsList">;

// ── Relative Time ───────────────────────────────────

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

// ── Avatar Component ────────────────────────────────

function Avatar({
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
        <View
          style={[
            styles.avatarFallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.avatarInitials, { fontSize: size * 0.36 }]}>
            {initials}
          </Text>
        </View>
      )}
      {online && (
        <View style={[styles.onlineIndicator, { right: 0, bottom: 0 }]}>
          <View style={styles.onlineDot} />
        </View>
      )}
    </View>
  );
}

// ── Conversation Row ────────────────────────────────

function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: ConversationData;
  onPress: () => void;
}) {
  const hasUnread = conversation.unreadCount > 0;
  const preview = conversation.lastMessage?.content ?? "Inicia la conversación";
  const truncated =
    preview.length > 45 ? preview.substring(0, 45) + "..." : preview;
  const time = relativeTime(conversation.lastMessageAt);
  const fullName = `${conversation.otherUserFirstName} ${conversation.otherUserLastName}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
      ]}
    >
      <Avatar
        uri={conversation.otherUserProfilePhotoUrl}
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
    </Pressable>
  );
}

// ── Empty State ─────────────────────────────────────

function ChatEmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.emptyIconCircle}>
        <Ionicons name="chatbubbles-outline" size={40} color={colors.eu.star} />
      </Animated.View>
      <Animated.Text entering={FadeInDown.delay(400).springify()} style={styles.emptyTitle}>
        Sin conversaciones
      </Animated.Text>
      <Animated.Text entering={FadeInDown.delay(600).springify()} style={styles.emptySubtitle}>
        Descubre estudiantes Erasmus y empieza a chatear
      </Animated.Text>
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────

export default function ConversationsScreen(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  const user = useAuthStore((s) => s.user);
  const {
    conversations,
    isLoadingConversations,
    isWsConnected,
    initialize,
    teardown,
    fetchConversations,
  } = useChatStore();

  // Initialize WebSocket on mount
  useEffect(() => {
    if (user?.id) {
      initialize(user.id);
      fetchConversations();
    }
    return () => teardown();
  }, [user?.id]);

  // Refetch on focus
  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      fetchConversations();
    });
    return unsub;
  }, [navigation, fetchConversations]);

  const handlePress = useCallback(
    (conv: ConversationData) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate("ChatRoom", {
        conversationId: conv.id,
        otherUserId: conv.otherUserId,
        otherUserName: `${conv.otherUserFirstName} ${conv.otherUserLastName}`,
        otherUserPhoto: conv.otherUserProfilePhotoUrl,
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
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Mensajes</Text>
          <View style={styles.headerActions}>
            <View style={[
              styles.connectionDot,
              { backgroundColor: isWsConnected ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)" },
            ]}>
              <View style={[styles.connDot, { backgroundColor: isWsConnected ? "#4CAF50" : "#F44336" }]} />
              <Text style={styles.connText}>{isWsConnected ? "Online" : "Offline"}</Text>
            </View>
          </View>
        </View>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.text.disabled} />
          <Text style={styles.searchPlaceholder}>Buscar conversaciones...</Text>
        </View>
      </View>

      {/* Conversations List */}
      {isLoadingConversations && conversations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.eu.star} size="large" />
        </View>
      ) : (
        <FlashList
          data={conversations}
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
          contentContainerStyle={{
            paddingBottom: insets.bottom + 80,
          }}
        />
      )}
    </View>
  );
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 28,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  connectionDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  connDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.tiny.fontSize,
    color: colors.text.secondary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  searchPlaceholder: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.disabled,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowPressed: {
    backgroundColor: colors.glass.white,
  },
  rowContent: {
    flex: 1,
    gap: spacing.xxs,
  },
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

  // Avatar
  avatar: {
    backgroundColor: colors.glass.whiteMid,
  },
  avatarFallback: {
    backgroundColor: colors.eu.mid,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: typography.families.subheading,
    color: colors.text.primary,
  },
  onlineIndicator: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#1A1A2E",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },

  // Text
  name: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  nameUnread: {
    fontFamily: typography.families.bodyBold,
  },
  time: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  timeUnread: {
    color: colors.eu.star,
  },
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

  // Badge
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
    color: "#FFFFFF",
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
    gap: spacing.sm,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 215, 0, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.15)",
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
});
