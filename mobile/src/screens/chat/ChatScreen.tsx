import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { ChatStackParamList, MessageData } from "@/types/chat";

type ChatRoute = RouteProp<ChatStackParamList, "ChatRoom">;
type ChatNav = StackNavigationProp<ChatStackParamList, "ChatRoom">;

// ── Typing Indicator ────────────────────────────────

function TypingIndicator({ name }: { name: string }) {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const bounce = (delay: number) =>
      withRepeat(
        withSequence(
          withTiming(0, { duration: delay }),
          withTiming(-6, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
      );
    dot1.value = bounce(0);
    dot2.value = bounce(150);
    dot3.value = bounce(300);
  }, []);

  const s1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
  const s2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
  const s3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.typingContainer}>
      <Text style={styles.typingText}>{name} está escribiendo</Text>
      <View style={styles.typingDots}>
        <Animated.View style={[styles.typingDot, s1]} />
        <Animated.View style={[styles.typingDot, s2]} />
        <Animated.View style={[styles.typingDot, s3]} />
      </View>
    </Animated.View>
  );
}

// ── Message Bubble ──────────────────────────────────

const MessageBubble = React.memo(function MessageBubble({
  message,
  isOwn,
  showTail,
}: {
  message: MessageData;
  isOwn: boolean;
  showTail: boolean;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Animated.View
      entering={FadeInDown.duration(200).springify()}
      style={[
        styles.bubbleWrapper,
        isOwn ? styles.bubbleWrapperOwn : styles.bubbleWrapperOther,
      ]}
    >
      {isOwn ? (
        <LinearGradient
          colors={[colors.eu.orange, "#FF8B4F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.bubble,
            styles.bubbleOwn,
            showTail && styles.bubbleTailOwn,
          ]}
        >
          {message.type === "IMAGE" && message.mediaUrl ? (
            <Image source={{ uri: message.mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
          ) : message.type === "AUDIO" ? (
            <Text style={styles.bubbleTextOwn}>🎤 Mensaje de voz</Text>
          ) : message.type === "VIDEO" && message.mediaUrl ? (
            <Text style={styles.bubbleTextOwn}>🎬 Video</Text>
          ) : message.type === "LOCATION" && message.latitude && message.longitude ? (
            <Text style={styles.bubbleTextOwn}>📍 Ubicación: {message.latitude.toFixed(4)}, {message.longitude.toFixed(4)}</Text>
          ) : (
            <Text style={styles.bubbleTextOwn}>{message.content}</Text>
          )}
          <View style={styles.bubbleMeta}>
            <Text style={styles.bubbleTimeOwn}>{time}</Text>
            {message.isRead && (
              <Text style={styles.readCheck}>✓✓</Text>
            )}
          </View>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.bubble,
            styles.bubbleOther,
            showTail && styles.bubbleTailOther,
          ]}
        >
          {message.type === "IMAGE" && message.mediaUrl ? (
            <Image source={{ uri: message.mediaUrl }} style={styles.mediaImage} resizeMode="cover" />
          ) : message.type === "AUDIO" ? (
            <Text style={styles.bubbleTextOther}>🎤 Mensaje de voz</Text>
          ) : message.type === "VIDEO" && message.mediaUrl ? (
            <Text style={styles.bubbleTextOther}>🎬 Video</Text>
          ) : message.type === "LOCATION" && message.latitude && message.longitude ? (
            <Text style={styles.bubbleTextOther}>📍 Ubicación: {message.latitude.toFixed(4)}, {message.longitude.toFixed(4)}</Text>
          ) : (
            <Text style={styles.bubbleTextOther}>{message.content}</Text>
          )}
          <Text style={styles.bubbleTimeOther}>{time}</Text>
        </View>
      )}
    </Animated.View>
  );
});

// ── Chat Input ──────────────────────────────────────

function ChatInput({
  onSend,
  onTyping,
}: {
  onSend: (text: string) => void;
  onTyping: (typing: boolean) => void;
}) {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const insets = useSafeAreaInsets();

  const handleChange = useCallback(
    (value: string) => {
      setText(value);

      if (value.length > 0 && !isTypingRef.current) {
        isTypingRef.current = true;
        onTyping(true);
      }

      // Reset typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTyping(false);
      }, 2000);
    },
    [onTyping],
  );

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend(trimmed);
    setText("");

    // Clear typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    isTypingRef.current = false;
    onTyping(false);
  }, [text, onSend, onTyping]);

  return (
    <View
      style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.xs }]}
    >
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={colors.text.disabled}
          value={text}
          onChangeText={handleChange}
          multiline
          maxLength={2000}
          returnKeyType="default"
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim()}
          style={({ pressed }) => [
            styles.sendButton,
            !text.trim() && styles.sendButtonDisabled,
            pressed && styles.sendButtonPressed,
          ]}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Chat Header ─────────────────────────────────────

function ChatHeader({
  name,
  photo,
  online,
  onBack,
}: {
  name: string;
  photo: string | null;
  online: boolean;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.chatHeader, { paddingTop: insets.top + spacing.xs }]}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      <View style={styles.headerProfile}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.headerAvatar} />
        ) : (
          <View style={styles.headerAvatarFallback}>
            <Text style={styles.headerAvatarInitials}>{initials}</Text>
          </View>
        )}
        {online && (
          <View style={styles.headerOnline}>
            <View style={styles.headerOnlineDot} />
          </View>
        )}
      </View>

      <View style={styles.headerInfo}>
        <Text style={styles.headerName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.headerStatus}>
          {online ? "En línea" : "Desconectado"}
        </Text>
      </View>
    </View>
  );
}

// ── Main Chat Screen ────────────────────────────────

export default function ChatScreen(): React.JSX.Element {
  const route = useRoute<ChatRoute>();
  const navigation = useNavigation<ChatNav>();
  const { conversationId, otherUserId, otherUserName, otherUserPhoto } =
    route.params;

  const user = useAuthStore((s) => s.user);
  const messages = useChatStore(
    (s) => s.messages[conversationId] ?? [],
  );
  const isLoading = useChatStore(
    (s) => s.isLoadingMessages[conversationId] ?? false,
  );
  const hasMore = useChatStore(
    (s) => s.hasMoreMessages[conversationId] ?? true,
  );
  const typingUserIds = useChatStore(
    (s) => s.typingUsers[conversationId] ?? [],
  );
  const conversations = useChatStore((s) => s.conversations);

  const {
    fetchMessages,
    fetchOlderMessages,
    sendMessage,
    markAsRead,
    sendTypingIndicator,
  } = useChatStore();

  const listRef = useRef<FlashListRef<MessageData>>(null);

  // Determine if other user is online from conversations data
  const isOtherOnline = useMemo(() => {
    const conv = conversations.find((c) => c.id === conversationId);
    return conv?.otherUserOnline ?? false;
  }, [conversations, conversationId]);

  const isOtherTyping = typingUserIds.includes(otherUserId);

  // Inverted list data: FlashList inverted puts newest at bottom
  const invertedMessages = useMemo(() => [...messages].reverse(), [messages]);

  // Load messages on mount
  useEffect(() => {
    fetchMessages(conversationId);
    markAsRead(conversationId);
  }, [conversationId]);

  // Mark as read when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.senderId !== user?.id && !lastMsg.isRead) {
        markAsRead(conversationId);
      }
    }
  }, [messages.length]);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(conversationId, content);
    },
    [conversationId, sendMessage],
  );

  const handleTyping = useCallback(
    (typing: boolean) => {
      sendTypingIndicator(conversationId, typing);
    },
    [conversationId, sendTypingIndicator],
  );

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchOlderMessages(conversationId);
    }
  }, [isLoading, hasMore, conversationId, fetchOlderMessages]);

  const renderMessage = useCallback(
    ({ item, index }: { item: MessageData; index: number }) => {
      const isOwn = item.senderId === user?.id;
      // In inverted list, index 0 is newest. Show tail when next message
      // (older, higher index) is from different sender
      const nextMsg = invertedMessages[index + 1];
      const showTail = !nextMsg || nextMsg.senderId !== item.senderId;

      return (
        <MessageBubble message={item} isOwn={isOwn} showTail={showTail} />
      );
    },
    [user?.id, invertedMessages],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <ChatHeader
        name={otherUserName}
        photo={otherUserPhoto}
        online={isOtherOnline}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.chatBody}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlashList
          ref={listRef}
          data={invertedMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => String(item.id)}
          inverted
          contentContainerStyle={{ paddingHorizontal: spacing.sm }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoading ? (
              <ActivityIndicator
                color={colors.eu.star}
                style={{ padding: spacing.md }}
              />
            ) : null
          }
          ListHeaderComponent={
            isOtherTyping ? (
              <TypingIndicator name={otherUserName.split(" ")[0]} />
            ) : null
          }
        />

        <ChatInput onSend={handleSend} onTyping={handleTyping} />
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatBody: {
    flex: 1,
  },

  // Header
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
    backgroundColor: "rgba(0, 51, 153, 0.3)",
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 24,
    color: colors.text.primary,
  },
  headerProfile: {
    marginLeft: spacing.sm,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass.whiteMid,
  },
  headerAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.eu.mid,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarInitials: {
    fontFamily: typography.families.subheading,
    fontSize: 15,
    color: colors.text.primary,
  },
  headerOnline: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#1A1A2E",
    alignItems: "center",
    justifyContent: "center",
  },
  headerOnlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#4CAF50",
  },
  headerInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  headerName: {
    fontFamily: typography.families.subheading,
    fontSize: 17,
    color: colors.text.primary,
  },
  headerStatus: {
    fontFamily: typography.families.body,
    fontSize: 12,
    color: colors.text.secondary,
  },

  // Bubbles
  bubbleWrapper: {
    marginVertical: 2,
    maxWidth: "80%",
  },
  bubbleWrapperOwn: {
    alignSelf: "flex-end",
  },
  bubbleWrapperOther: {
    alignSelf: "flex-start",
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.lg,
  },
  bubbleOwn: {
    borderBottomRightRadius: radii.sm,
  },
  bubbleTailOwn: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.glass.whiteMid,
    borderBottomLeftRadius: radii.sm,
  },
  bubbleTailOther: {
    borderBottomLeftRadius: 4,
  },
  mediaImage: {
    width: 200,
    height: 150,
    borderRadius: radii.md,
    marginBottom: spacing.xs,
  },
  bubbleTextOwn: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: "#FFFFFF",
    lineHeight: 21,
  },
  bubbleTextOther: {
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 21,
  },
  bubbleMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 2,
  },
  bubbleTimeOwn: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  bubbleTimeOther: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: colors.text.secondary,
    textAlign: "right",
    marginTop: 2,
  },
  readCheck: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },

  // Typing
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  typingText: {
    fontFamily: typography.families.body,
    fontSize: 13,
    color: colors.text.secondary,
    fontStyle: "italic",
  },
  typingDots: {
    flexDirection: "row",
    gap: 3,
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.text.secondary,
  },

  // Input
  inputContainer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    backgroundColor: "rgba(26, 26, 46, 0.9)",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.glass.white,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.eu.orange,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonPressed: {
    opacity: 0.7,
  },
  sendIcon: {
    fontSize: 18,
    color: "#FFFFFF",
    marginLeft: 2,
  },
});
