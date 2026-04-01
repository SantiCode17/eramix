import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { sendAiChat } from "@/api/aiAssistant";
import { handleError } from "@/utils/errorHandler";
import type { AiMessageData } from "@/types/aiAssistant";
import { RouteProp, useRoute } from "@react-navigation/native";
import type { AiAssistantStackParamList } from "@/types/aiAssistant";

export default function AiChatScreen() {
  const route = useRoute<RouteProp<AiAssistantStackParamList, "AiChat">>();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<AiMessageData[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState<number | undefined>(route.params?.conversationId);
  const listRef = useRef<any>(null);

  const handleSend = useCallback(async () => {
    const msg = text.trim();
    if (!msg || loading) return;
    setText("");

    // Optimistic user message
    const tempUser: AiMessageData = {
      id: Date.now(),
      role: "USER",
      content: msg,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUser]);
    setLoading(true);

    try {
      const res = (await sendAiChat({ conversationId: convId, message: msg })) as any;
      setConvId(res.id);
      setMessages(res.messages);
    } catch (e) {
      const msg = handleError(e, "AiChat.send");
      const errorMsg: AiMessageData = {
        id: Date.now() + 1,
        role: "ASSISTANT",
        content: msg,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [text, loading, convId]);

  const renderItem = useCallback(({ item }: { item: AiMessageData }) => {
    const isUser = item.role === "USER";
    return (
      <Animated.View
        entering={FadeInDown.duration(200)}
        style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAi]}
      >
        {!isUser && <Text style={styles.avatar}>🤖</Text>}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.content}</Text>
        </View>
      </Animated.View>
    );
  }, []);

  return (
    <LinearGradient colors={[colors.background.start, colors.background.end]} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>🤖 Asistente Erasmus</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlashList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.lg }}
          onContentSizeChange={() => listRef.current?.scrollToEnd?.({ animated: true })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 64 }}>🤖</Text>
              <Text style={styles.emptyTitle}>¡Hola! Soy tu asistente</Text>
              <Text style={styles.emptySubtitle}>
                Pregúntame sobre alojamiento, idiomas, documentos, ciudades o cualquier duda Erasmus.
              </Text>
            </View>
          }
        />

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Escribe tu mensaje…"
            placeholderTextColor={colors.text.secondary}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || loading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  headerTitle: {
    ...typography.sizes.h3,
    fontFamily: typography.families.heading,
    color: colors.text.primary,
  },
  body: { flex: 1 },
  msgRow: { flexDirection: "row", marginBottom: spacing.sm, maxWidth: "85%" },
  msgRowUser: { alignSelf: "flex-end" },
  msgRowAi: { alignSelf: "flex-start" },
  avatar: { fontSize: 24, marginRight: spacing.xs, marginTop: 4 },
  bubble: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: "100%",
  },
  bubbleUser: {
    backgroundColor: colors.eu.orange,
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: colors.glass.whiteMid,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.primary,
    lineHeight: 22,
  },
  bubbleTextUser: { color: "#fff" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    backgroundColor: colors.eu.deep + "CC",
  },
  input: {
    flex: 1,
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.eu.orange,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { color: "#fff", fontSize: 20 },
  empty: { alignItems: "center", marginTop: 80 },
  emptyTitle: {
    fontFamily: typography.families.heading,
    ...typography.sizes.h3,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontFamily: typography.families.body,
    ...typography.sizes.body,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
});
