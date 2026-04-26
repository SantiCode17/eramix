import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import {
  colors,
  typography,
  spacing,
  radii,
  DS,
} from "@/design-system/tokens";
import { ScreenBackground } from "@/design-system/components";
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
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const listRef = useRef<any>(null);

  const handleSend = useCallback(async () => {
    const msg = text.trim();
    if (!msg || loading) return;
    setText("");
    setErrorBanner(null);

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
      const errMsg = handleError(e, "AiChat.send");
      setErrorBanner(errMsg);
    } finally {
      setLoading(false);
    }
  }, [text, loading, convId]);

  const renderItem = useCallback(
    ({ item }: { item: AiMessageData }) => {
      const isUser = item.role === "USER";
      return (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={[st.msgRow, isUser ? st.msgRowUser : st.msgRowAi]}
        >
          {!isUser && (
            <View style={st.avatar}>
              <Ionicons name="chatbox-ellipses-outline" size={20} color={colors.eu.star} />
            </View>
          )}
          <View style={[st.bubble, isUser ? st.bubbleUser : st.bubbleAi]}>
            <Text style={[st.bubbleText, isUser && st.bubbleTextUser]}>
              {item.content}
            </Text>
          </View>
        </Animated.View>
      );
    },
    [],
  );

  return (
    <ScreenBackground>
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={st.headerTitle}>Asistente Erasmus</Text>
      </View>

      {/* Error banner */}
      {errorBanner && (
        <Animated.View entering={FadeInUp.duration(300)} style={st.errorBanner}>
          <Ionicons name="warning-outline" size={16} color={colors.status.error} />
          <Text style={st.errorBannerText} numberOfLines={2}>
            {errorBanner}
          </Text>
          <Pressable onPress={() => setErrorBanner(null)}>
            <Ionicons name="close" size={16} color={colors.text.secondary} />
          </Pressable>
        </Animated.View>
      )}

      <KeyboardAvoidingView
        style={st.body}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlashList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.lg,
          }}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd?.({ animated: true })
          }
          ListEmptyComponent={
            <View style={st.empty}>
              <Ionicons
                name="chatbox-ellipses-outline"
                size={64}
                color={colors.text.secondary}
              />
              <Text style={st.emptyTitle}>¡Hola! Soy tu asistente</Text>
              <Text style={st.emptySubtitle}>
                Pregúntame sobre alojamiento, idiomas, documentos, ciudades o
                cualquier duda Erasmus.
              </Text>
            </View>
          }
        />

        {/* Input bar */}
        <View style={[st.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <TextInput
            style={st.input}
            placeholder="Escribe tu mensaje…"
            placeholderTextColor={colors.text.secondary}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          <Pressable
            style={[st.sendBtn, (!text.trim() || loading) && st.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glass.border,
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    lineHeight: typography.sizes.h3.lineHeight,
    color: colors.text.primary,
  },
  body: { flex: 1 },
  msgRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
    maxWidth: "85%",
  },
  msgRowUser: { alignSelf: "flex-end" },
  msgRowAi: { alignSelf: "flex-start" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass.whiteMid,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
    marginTop: spacing.xs,
  },
  bubble: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: "100%",
  },
  bubbleUser: {
    backgroundColor: colors.eu.orange,
    borderBottomRightRadius: radii.xs,
  },
  bubbleAi: {
    backgroundColor: colors.glass.whiteMid,
    borderBottomLeftRadius: radii.xs,
  },
  bubbleText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    lineHeight: 22,
    color: colors.text.primary,
  },
  bubbleTextUser: { color: "#fff" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.glass.border,
    backgroundColor: colors.overlay.light,
  },
  input: {
    flex: 1,
    backgroundColor: colors.glass.white,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text.primary,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    maxHeight: 100,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glass.border,
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
  empty: { alignItems: "center", marginTop: 80 },
  emptyTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.status.errorBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,79,111,0.25)",
  },
  errorBannerText: {
    flex: 1,
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
  },
});
