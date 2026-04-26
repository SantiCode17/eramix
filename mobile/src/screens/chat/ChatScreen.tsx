import React, { useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import { shallow } from "zustand/shallow";
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
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { colors, typography, spacing, radii, DS, TAB_BAR_HEIGHT } from "@/design-system/tokens";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
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
          colors={["rgba(255,215,0,0.25)", "rgba(255,107,43,0.20)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.bubble,
            styles.bubbleOwn,
            showTail && styles.bubbleTailOwn,
          ]}
        >
          {message.type === "IMAGE" && message.mediaUrl ? (
            <>
              <Image source={{ uri: resolveMediaUrl(message.mediaUrl) }} style={styles.mediaImage} resizeMode="cover" />
              {message.content ? (
                <Text style={styles.captionText}>{message.content}</Text>
              ) : null}
            </>
          ) : message.type === "AUDIO" ? (
            <Text style={styles.bubbleTextOwn}>Mensaje de voz</Text>
          ) : message.type === "VIDEO" && message.mediaUrl ? (
            <Text style={styles.bubbleTextOwn}>Video</Text>
          ) : message.type === "LOCATION" && message.latitude && message.longitude ? (
            <Text style={styles.bubbleTextOwn}>Ubicación: {message.latitude.toFixed(4)}, {message.longitude.toFixed(4)}</Text>
          ) : (
            <Text style={styles.bubbleTextOwn}>{message.content}</Text>
          )}
          <View style={styles.bubbleMeta}>
            <Text style={styles.bubbleTimeOwn}>{time}</Text>
            {message.id < 0 ? (
              <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.4)" style={{ marginLeft: 3 }} />
            ) : message.isRead ? (
              <Text style={styles.readCheck}>✓✓</Text>
            ) : (
              <Text style={styles.readCheck}>✓</Text>
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
            <>
              <Image source={{ uri: resolveMediaUrl(message.mediaUrl) }} style={styles.mediaImage} resizeMode="cover" />
              {message.content ? (
                <Text style={styles.captionTextOther}>{message.content}</Text>
              ) : null}
            </>
          ) : message.type === "AUDIO" ? (
            <Text style={styles.bubbleTextOther}>Mensaje de voz</Text>
          ) : message.type === "VIDEO" && message.mediaUrl ? (
            <Text style={styles.bubbleTextOther}>Video</Text>
          ) : message.type === "LOCATION" && message.latitude && message.longitude ? (
            <Text style={styles.bubbleTextOther}>Ubicación: {message.latitude.toFixed(4)}, {message.longitude.toFixed(4)}</Text>
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
  onSendImage,
  onSendImageWithCaption,
  onTyping,
  onVoice,
}: {
  onSend: (text: string) => void;
  onSendImage: (uri: string) => void;
  onSendImageWithCaption?: (uri: string, caption: string) => void;
  onTyping: (typing: boolean) => void;
  onVoice?: () => void;
}) {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
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
    
    // If there's an image + text, send as image with caption
    if (imagePreview && trimmed && onSendImageWithCaption) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSendImageWithCaption(imagePreview, trimmed);
      setImagePreview(null);
      setText("");
      return;
    }
    
    // If there's an image without text, send image only
    if (imagePreview) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSendImage(imagePreview);
      setImagePreview(null);
      setText("");
      return;
    }
    
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

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImagePreview(result.assets[0].uri);
    }
  }, []);

  const handleSendImage = useCallback(() => {
    if (!imagePreview) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSendImage(imagePreview);
    setImagePreview(null);
  }, [imagePreview, onSendImage]);

  const handleCancelImage = useCallback(() => {
    setImagePreview(null);
  }, []);

  return (
    <View
      style={[styles.inputContainer, { paddingBottom: insets.bottom + spacing.xs }]}
    >
      {/* Image Preview — shown above input row as thumbnail */}
      {imagePreview && (
        <View style={styles.imagePreviewRow}>
          <Image source={{ uri: imagePreview }} style={styles.imagePreviewThumb} />
          <Pressable onPress={handleCancelImage} style={styles.imagePreviewCancel}>
            <Ionicons name="close-circle" size={24} color="rgba(255,100,100,0.9)" />
          </Pressable>
        </View>
      )}

      <View style={styles.inputRow}>
        {/* Image Picker Button */}
        <Pressable
          onPress={handlePickImage}
          style={({ pressed }) => [
            styles.attachButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Ionicons name="image-outline" size={20} color="#FF6B2B" />
        </Pressable>

        {/* Voice Message Button */}
        {onVoice && (
          <Pressable
            onPress={onVoice}
            style={({ pressed }) => [
              styles.attachButton,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Ionicons name="mic-outline" size={20} color="#FF6B2B" />
          </Pressable>
        )}

        <TextInput
          style={[styles.textInput, isFocused && styles.textInputFocused]}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="rgba(255,255,255,0.40)"
          value={text}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline
          maxLength={2000}
          returnKeyType="default"
        />
        <Pressable
          onPress={handleSend}
          disabled={!text.trim() && !imagePreview}
          style={({ pressed }) => [
            styles.sendButton,
            (!text.trim() && !imagePreview) && styles.sendButtonDisabled,
            pressed && styles.sendButtonPressed,
          ]}
        >
          <LinearGradient
            colors={(text.trim() || imagePreview) ? ["#FFD700", "#FF6B2B"] : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.04)"]}
            style={styles.sendGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="send" size={18} color={(text.trim() || imagePreview) ? "#06081A" : "rgba(255,255,255,0.3)"} />
          </LinearGradient>
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
  onProfilePress,
}: {
  name: string;
  photo: string | null;
  online: boolean;
  onBack: () => void;
  onProfilePress?: () => void;
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
        <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
      </Pressable>

      <Pressable onPress={onProfilePress} style={styles.headerProfileRow} disabled={!onProfilePress}>
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
      </Pressable>
    </View>
  );
}

// ── Main Chat Screen ────────────────────────────────

// Stable empty arrays to prevent infinite re-render loops
const EMPTY_MESSAGES: MessageData[] = [];
const EMPTY_TYPING: number[] = [];

export default function ChatScreen(): React.JSX.Element {
  const route = useRoute<ChatRoute>();
  const navigation = useNavigation<ChatNav>();
  const { conversationId, otherUserId, otherUserName, otherUserPhoto } =
    route.params;

  // Hide parent tab bar while in ChatRoom
  useLayoutEffect(() => {
    const parent = navigation.getParent?.();
    parent?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      parent?.setOptions({
        tabBarStyle: undefined, // restores default tab bar
      });
    };
  }, [navigation]);

  // Guard: if route params are not ready, render nothing
  if (!conversationId) return <View style={styles.container} />;

  const user = useAuthStore((s) => s.user);
  const messages = useChatStore(
    (s) => s.messages[conversationId] ?? EMPTY_MESSAGES,
  );
  const isLoading = useChatStore(
    (s) => s.isLoadingMessages[conversationId] ?? false,
  );
  const hasMore = useChatStore(
    (s) => s.hasMoreMessages[conversationId] ?? true,
  );
  const typingUserIds = useChatStore(
    (s) => s.typingUsers[conversationId] ?? EMPTY_TYPING,
  );
  const conversations = useChatStore((s) => s.conversations);

  const {
    fetchMessages,
    fetchOlderMessages,
    sendMessage,
    sendImageMessage,
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
  }, [conversationId, fetchMessages, markAsRead]);

  // Mark as read when new messages arrive from the other user
  const lastMessageId = messages.length > 0 ? messages[messages.length - 1]?.id : null;
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.senderId !== user?.id && !lastMsg.isRead) {
      markAsRead(conversationId);
    }
  }, [lastMessageId, conversationId, markAsRead, user?.id]);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(conversationId, content);
    },
    [conversationId, sendMessage],
  );

  const handleSendImage = useCallback(
    (uri: string) => {
      sendImageMessage(conversationId, uri);
    },
    [conversationId, sendImageMessage],
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
        colors={[DS.background, "#0E1A35", "#0F1535"]}
        style={StyleSheet.absoluteFill}
      />

      <ChatHeader
        name={otherUserName}
        photo={otherUserPhoto}
        online={isOtherOnline}
        onBack={() => navigation.goBack()}
        onProfilePress={() => {
          // Navigate to the other user's profile
          navigation.navigate("UserDetail" as any, {
            userId: otherUserId,
            userName: otherUserName,
            userPhoto: otherUserPhoto,
          });
        }}
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
          estimatedItemSize={70}
        />

        <ChatInput
          onSend={handleSend}
          onSendImage={handleSendImage}
          onSendImageWithCaption={(uri, caption) => {
            // Send image, caption sent as separate text message after
            sendImageMessage(conversationId, uri);
            if (caption.trim()) sendMessage(conversationId, caption);
          }}
          onTyping={handleTyping}
          onVoice={() => navigation.navigate("VoiceMessage", { conversationId })}
        />
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(10,22,40,0.85)",
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerProfileRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  headerProfile: {
    marginLeft: spacing.sm,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
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
    backgroundColor: DS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  headerOnlineDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#00D68F",
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
    maxWidth: "75%",
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
    borderRadius: 18,
  },
  bubbleOwn: {
    borderBottomRightRadius: 4,
    borderWidth: 0.5,
    borderColor: "rgba(255,215,0,0.35)",
  },
  bubbleTailOwn: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    borderBottomLeftRadius: 4,
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
  captionText: {
    fontFamily: typography.families.body,
    fontSize: 12,
    fontStyle: "italic",
    color: "rgba(255,255,255,0.70)",
    marginTop: 4,
  },
  captionTextOther: {
    fontFamily: typography.families.body,
    fontSize: 12,
    fontStyle: "italic",
    color: "rgba(255,255,255,0.70)",
    marginTop: 4,
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
    color: "rgba(255,255,255,0.45)",
  },
  bubbleTimeOther: {
    fontFamily: typography.families.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.45)",
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
    minHeight: 64,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(10,22,40,0.95)",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === "ios" ? 10 : 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    fontFamily: typography.families.body,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
  },
  textInputFocused: {
    borderColor: "rgba(255,215,0,0.50)",
    borderWidth: 1,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    marginBottom: 1,
  },
  sendGrad: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonPressed: {
    opacity: 0.7,
  },

  // Image picker / voice
  attachButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,107,43,0.15)",
    borderWidth: 0.5,
    borderColor: "rgba(255,107,43,0.30)",
  },
  imagePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  imagePreviewThumb: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.2)",
  },
  imagePreviewCancel: {
    position: "absolute",
    top: -6,
    left: 48,
    padding: 2,
    backgroundColor: "rgba(10,22,40,0.8)",
    borderRadius: 12,
  },
});
