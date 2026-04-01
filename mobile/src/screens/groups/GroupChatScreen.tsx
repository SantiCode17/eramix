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
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/store/useAuthStore";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import type { GroupMessageData, GroupsStackParamList } from "@/types/groups";
import * as groupsApi from "@/api/groups";
import { handleError } from "@/utils/errorHandler";

type Route = RouteProp<GroupsStackParamList, "GroupChat">;
type Nav = StackNavigationProp<GroupsStackParamList, "GroupChat">;

// ── Avatar ──────────────────────────────────────────

function SmallAvatar({ uri, name, size = 32 }: { uri: string | null; name: string; size?: number }) {
  const initials = name.charAt(0).toUpperCase();
  return uri ? (
    <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.eu.deep + "40",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: colors.eu.light, fontSize: size * 0.4, fontWeight: "700" }}>
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
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[styles.bubbleRow, isMine && styles.bubbleRowMine]}
    >
      {!isMine && showSender && (
        <SmallAvatar uri={msg.senderProfilePhotoUrl} name={msg.senderFirstName} size={28} />
      )}
      {!isMine && !showSender && <View style={{ width: 28 }} />}
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleOther,
        ]}
      >
        {!isMine && showSender && (
          <Text style={styles.senderName}>
            {msg.senderFirstName} {msg.senderLastName}
          </Text>
        )}
        <Text style={[styles.msgText, isMine && styles.msgTextMine]}>
          {msg.content}
        </Text>
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
  const listRef = useRef<any>(null);

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
  }, [fetchMessages]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Optimistic: add to local list
    const tempMsg: GroupMessageData = {
      id: Date.now(),
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

    try {
      // In a full implementation this would go through WebSocket
      // For now we refetch after a brief delay
      setTimeout(() => fetchMessages(), 1000);
    } finally {
      setSending(false);
    }
  }, [text, sending, groupId, currentUserId, fetchMessages]);

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
      <LinearGradient colors={[colors.background.start, colors.background.end]} style={styles.center}>
        <ActivityIndicator size="large" color={colors.eu.star} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.background.start, colors.background.end]}
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

        {/* Input */}
        <View style={[styles.inputRow, { paddingBottom: insets.bottom + spacing.sm }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Escribe un mensaje…"
              placeholderTextColor={colors.text.disabled}
              multiline
              maxLength={2000}
            />
          </View>
          <Pressable
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </Pressable>
        </View>
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
    borderBottomColor: colors.glass.border,
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
  settingsText: { fontSize: 20 },
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
  bubbleMine: { backgroundColor: colors.eu.deep, marginLeft: "auto" },
  bubbleOther: { backgroundColor: colors.glass.whiteMid },
  senderName: {
    fontFamily: typography.families.bodyMedium,
    ...typography.sizes.small,
    color: colors.eu.star,
    marginBottom: 2,
  },
  msgText: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.primary,
  },
  msgTextMine: { color: "#FFF" },
  msgTime: {
    fontFamily: typography.families.body,
    ...typography.sizes.small,
    color: colors.text.secondary,
    alignSelf: "flex-end",
    marginTop: 2,
  },
  msgTimeMine: { color: "rgba(255,255,255,0.6)" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glass.border,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.glass.border,
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
    backgroundColor: colors.eu.orange,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: "#FFF", fontSize: 20 },
});
