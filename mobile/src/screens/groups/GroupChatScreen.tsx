import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/useAuthStore";
import { webSocketService } from "@/services/webSocketService";
import { resolveMediaUrl } from "@/utils/resolveMediaUrl";
import { ChatInput } from "@/screens/chat/ChatScreen";
import { colors, typography, spacing, radii, DS } from "@/design-system/tokens";
import type { GroupMessageData, GroupsStackParamList } from "@/types/groups";
import * as groupsApi from "@/api/groups";
import { handleError } from "@/utils/errorHandler";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

type Route = RouteProp<GroupsStackParamList, "GroupChat">;
type Nav = StackNavigationProp<GroupsStackParamList, "GroupChat">;

// ── Deterministic color from user ID ────────────────

const USER_COLORS = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF",
  "#9B59B6", "#FF9671", "#00D2FF", "#F9F871",
  "#FF6F91", "#845EC2", "#FFC75F", "#00C9A7",
  "#C34A36", "#008E9B", "#926C00", "#D65DB1",
];

function getUserColor(userId: number): string {
  // Simple hash for deterministic but varied results
  const idx = Math.abs(((userId * 2654435761) >>> 0) % USER_COLORS.length);
  return USER_COLORS[idx];
}



// ── Avatar ──────────────────────────────────────────

function SmallAvatar({ uri, name, size = 32, color }: { uri: string | null; name: string; size?: number; color?: string }) {
  const initials = name.charAt(0).toUpperCase();
  const resolvedUri = resolveMediaUrl(uri);
  return resolvedUri ? (
    <Image source={{ uri: resolvedUri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ? `${color}55` : "rgba(19,34,64,0.45)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: color ? `${color}88` : "rgba(255,255,255,0.1)",
      }}
    >
      <Text style={{ color: color ?? colors.eu.light, fontSize: size * 0.4, fontWeight: "700" }}>
        {initials}
      </Text>
    </View>
  );
}

// ── Message Bubble ──────────────────────────────────

function MessageBubble({
  msg,
  isMine,
  showSender,
}: {
  msg: GroupMessageData;
  isMine: boolean;
  showSender: boolean;
}) {
  const mediaUri = msg.mediaUrl ? resolveMediaUrl(msg.mediaUrl) : null;
  const userColor = getUserColor(msg.senderId);

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}
    >
      {!isMine && showSender && (
        <SmallAvatar uri={msg.senderProfilePhotoUrl} name={msg.senderFirstName} size={28} color={userColor} />
      )}
      {!isMine && !showSender && <View style={{ width: 28 }} />}
      <View
        style={[
          styles.bubble,
          isMine
            ? styles.bubbleMine
            : [styles.bubbleOther, { borderLeftWidth: 3, borderLeftColor: userColor }],
        ]}
      >
        {!isMine && showSender && (
          <Text style={[styles.senderName, { color: userColor }]}>
            {msg.senderFirstName} {msg.senderLastName}
          </Text>
        )}
        {msg.type === "IMAGE" && mediaUri ? (
          <Image source={{ uri: mediaUri }} style={styles.mediaImage} resizeMode="cover" />
        ) : msg.type === "AUDIO" ? (
          <View style={styles.audioMsgRow}>
            <Ionicons name="play" size={20} color={isMine ? "#CCB700" : userColor} />
            <Ionicons name="pulse" size={24} color={isMine ? "#CCB700" : userColor} />
            <Ionicons name="pulse" size={24} color={isMine ? "#CCB700" : userColor} />
            <Ionicons name="pulse" size={24} color={isMine ? "#CCB700" : userColor} />
          </View>
        ) : null}
        {msg.content ? (
          <Text style={[styles.msgText, isMine && styles.msgTextMine]}>
            {msg.content}
          </Text>
        ) : null}
        <Text style={[styles.msgTime, isMine && styles.msgTimeMine]}>
          {new Date(msg.createdAt).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </Animated.View>
  );
}

// ── Screen ──────────────────────────────────────────

export default function GroupChatScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { groupId, groupName } = route.params;
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [messages, setMessages] = useState<GroupMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const listRef = useRef<any>(null);
  const { isRecording, duration, startRecording, stopRecording } = useAudioRecorder();

  const fetchMessages = useCallback(async () => {
    try {
      const page = await groupsApi.getGroupMessages(groupId);
      setMessages(page.content.reverse());
      await groupsApi.markGroupAsRead(groupId);
    } catch (e) {
      handleError(e, "GroupChat.getMessages");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to STOMP topic for live group messages
    const unsubscribeWs = webSocketService.subscribeToGroup(groupId, (newMsg: GroupMessageData) => {
      setMessages((prev) => {
        // Skip if we already mapped this msg optimally
        if (prev.some(m => m.id === newMsg.id || (m.id < 0 && m.content === newMsg.content))) {
          // Replace optimistic
          const idx = prev.findIndex(m => m.id < 0 && m.content === newMsg.content);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = newMsg;
            return next;
          }
          return prev;
        }
        return [...prev, newMsg]; // new messages go at the end since inverted={false}
      });
    });

    return () => {
      unsubscribeWs();
    };
  }, [fetchMessages, groupId]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if ((!trimmed && !imagePreview) || sending) return;
    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      if (imagePreview) {
        // Upload image first, then send via WebSocket
        setUploadingMedia(true);
        let mediaUrl: string | undefined;
        try {
          mediaUrl = await groupsApi.uploadGroupMedia(groupId, imagePreview, "image/jpeg");
        } catch (uploadErr) {
          handleError(uploadErr, "GroupChat.uploadImage");
        } finally {
          setUploadingMedia(false);
        }

        const tempMsg: GroupMessageData = {
          id: -Date.now(),
          groupId,
          senderId: currentUserId || 0,
          senderFirstName: "Tú",
          senderLastName: "",
          senderProfilePhotoUrl: null,
          content: trimmed,
          type: "IMAGE",
          mediaUrl: mediaUrl ?? imagePreview,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);
        setImagePreview(null);
        setText("");
        webSocketService.sendGroupMessage(groupId, trimmed, "IMAGE", mediaUrl);
      } else {
        // Text only
        const tempMsg: GroupMessageData = {
          id: -Date.now(),
          groupId,
          senderId: currentUserId || 0,
          senderFirstName: "Tú",
          senderLastName: "",
          senderProfilePhotoUrl: null,
          content: trimmed,
          type: "TEXT",
          mediaUrl: null,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);
        setText("");
        webSocketService.sendGroupMessage(groupId, trimmed);
      }
    } finally {
      setSending(false);
    }
  }, [text, imagePreview, sending, groupId, currentUserId]);

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

  const handleMicPressIn = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await startRecording();
  }, [startRecording]);

  const handleMicPressOut = useCallback(async () => {
    const audioUri = await stopRecording();
    if (!audioUri) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSending(true);
    setUploadingMedia(true);
    try {
      const mediaUrl = await groupsApi.uploadGroupMedia(groupId, audioUri, "audio/m4a");
      const tempMsg: GroupMessageData = {
        id: -Date.now(),
        groupId,
        senderId: currentUserId || 0,
        senderFirstName: "Tú",
        senderLastName: "",
        senderProfilePhotoUrl: null,
        content: "",
        type: "AUDIO",
        mediaUrl,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMsg]);
      webSocketService.sendGroupMessage(groupId, "", "AUDIO", mediaUrl);
    } catch (e) {
      handleError(e, "GroupChat.sendAudio");
    } finally {
      setSending(false);
      setUploadingMedia(false);
    }
  }, [stopRecording, groupId, currentUserId]);

  const renderItem = useCallback(
    ({ item, index }: { item: GroupMessageData; index: number }) => {
      const isMine = item.senderId === currentUserId;
      const prev = index > 0 ? messages[index - 1] : null;
      const showSender = !isMine && (!prev || prev.senderId !== item.senderId);
      return <MessageBubble msg={item} isMine={isMine} showSender={showSender} />;
    },
    [currentUserId, messages],
  );

  if (loading) {
    return (
      <LinearGradient colors={[DS.background, "#0E1A35", "#0F1535"]} style={styles.center}>
        <ActivityIndicator size="large" color={colors.eu.star} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[DS.background, "#0E1A35", "#0F1535"]}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {groupName}
          </Text>
        </View>
        <Pressable
          onPress={() => nav.navigate("GroupSettings", { groupId })}
          style={styles.settingsBtn}
        >
          <Ionicons name="settings-outline" size={22} color={colors.text.primary} />
        </Pressable>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlashList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.sm }}
          inverted={false}
        />

        <ChatInput
          onSend={(trimmed) => {
            if (sending) return;
            setSending(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            const tempMsg: GroupMessageData = {
              id: -Date.now(),
              groupId,
              senderId: currentUserId || 0,
              senderFirstName: "Tú",
              senderLastName: "",
              senderProfilePhotoUrl: null,
              content: trimmed,
              type: "TEXT",
              mediaUrl: null,
              createdAt: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, tempMsg]);
            webSocketService.sendGroupMessage(groupId, trimmed, "TEXT");
            setSending(false);
          }}
          onSendImage={async (uri) => {
            if (sending) return;
            setSending(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            setUploadingMedia(true);
            let mediaUrl: string | undefined;
            try {
              mediaUrl = await groupsApi.uploadGroupMedia(groupId, uri, "image/jpeg");
              const tempMsg: GroupMessageData = {
                id: -Date.now(),
                groupId,
                senderId: currentUserId || 0,
                senderFirstName: "Tú",
                senderLastName: "",
                senderProfilePhotoUrl: null,
                content: "",
                type: "IMAGE",
                mediaUrl: mediaUrl,
                createdAt: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, tempMsg]);
              webSocketService.sendGroupMessage(groupId, "", "IMAGE", mediaUrl);
            } catch (err) {
              handleError(err, "uploadImage");
            } finally {
              setUploadingMedia(false);
              setSending(false);
            }
          }}
          onSendImageWithCaption={async (uri, caption) => {
             if (sending) return;
            setSending(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            setUploadingMedia(true);
            let mediaUrl: string | undefined;
            try {
              mediaUrl = await groupsApi.uploadGroupMedia(groupId, uri, "image/jpeg");
              const tempMsg: GroupMessageData = {
                id: -Date.now(),
                groupId,
                senderId: currentUserId || 0,
                senderFirstName: "Tú",
                senderLastName: "",
                senderProfilePhotoUrl: null,
                content: caption, // We can just send as TEXT if it doesn't support IMAGE+TEXT or separate
                type: "IMAGE",
                mediaUrl: mediaUrl,
                createdAt: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, tempMsg]);
              webSocketService.sendGroupMessage(groupId, "", "IMAGE", mediaUrl);
              
              const txtMsg: GroupMessageData = {
                id: -Date.now() - 1,
                groupId,
                senderId: currentUserId || 0,
                senderFirstName: "Tú",
                senderLastName: "",
                senderProfilePhotoUrl: null,
                content: caption,
                type: "TEXT",
                mediaUrl: null,
                createdAt: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, txtMsg]);
              webSocketService.sendGroupMessage(groupId, caption, "TEXT");

            } catch (err) {
              handleError(err, "uploadImage");
            } finally {
              setUploadingMedia(false);
              setSending(false);
            }
          }}
          onTyping={() => {}}
          onVoice={() => nav.navigate("VoiceMessage", { conversationId: groupId })} // Reusing VoiceMessageScreen
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ── Styles ──────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  backBtn: { padding: spacing.sm },
  backText: { color: colors.text.primary, fontSize: 28, fontWeight: "300" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontFamily: typography.families.subheading,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  settingsBtn: { padding: spacing.sm },
  bubbleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  bubbleRowMine: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "75%",
    padding: spacing.sm,
    borderRadius: radii.md,
    marginLeft: spacing.xs,
  },
  bubbleMine: { backgroundColor: "rgba(19,34,64,0.55)", marginLeft: "auto" },
  bubbleOther: { backgroundColor: "rgba(255,255,255,0.06)" },
  senderName: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.bodySmall,
    color: colors.eu.star,
    marginBottom: 2,
  },
  mediaImage: {
    width: 200,
    height: 150,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
  },
  audioMsgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: 2,
  },
  msgText: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  msgTextMine: { color: "#FFF" },
  msgTime: {
    fontFamily: typography.families.body,
    ...typography.sizes.bodySmall,
    color: colors.text.secondary,
    alignSelf: "flex-end",
    marginTop: 2,
  },
  msgTimeMine: { color: "rgba(255,255,255,0.6)" },
  inputArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  imagePreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  imagePreviewThumb: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: radii.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreviewCancel: {
    marginLeft: spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  attachBtnRecording: {
    backgroundColor: "rgba(229,62,62,0.15)",
    borderWidth: 1,
    borderColor: "rgba(229,62,62,0.4)",
  },
  recordingRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.status.error,
  },
  recordingText: {
    fontFamily: typography.families.subheading,
    fontSize: typography.sizes.body.fontSize,
    color: colors.status.error,
  },
  recordingHint: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.bodySmall.fontSize,
    color: colors.text.secondary,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 120,
  },
  input: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendGrad: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
