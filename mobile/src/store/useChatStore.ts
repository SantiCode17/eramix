import { create } from "zustand";
import * as chatApi from "@/api/chat";
import { webSocketService } from "@/services/webSocketService";
import type { ConversationData, MessageData, TypingEvent } from "@/types/chat";

// ── State ───────────────────────────────────────────

interface ChatState {
  // Data
  conversations: ConversationData[];
  messages: Record<number, MessageData[]>; // conversationId → messages
  typingUsers: Record<number, number[]>; // conversationId → userIds typing
  isWsConnected: boolean;

  // Loading
  isLoadingConversations: boolean;
  isLoadingMessages: Record<number, boolean>;
  hasMoreMessages: Record<number, boolean>;

  // Actions
  initialize: (userId: number) => void;
  teardown: () => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: number) => Promise<void>;
  fetchOlderMessages: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string) => void;
  markAsRead: (conversationId: number) => Promise<void>;
  sendTypingIndicator: (conversationId: number, typing: boolean) => void;
}

// ── Store ───────────────────────────────────────────

export const useChatStore = create<ChatState>((set, get) => {
  // Cleanup functions for listeners
  let unsubMessage: (() => void) | null = null;
  let unsubTyping: (() => void) | null = null;
  let unsubConnection: (() => void) | null = null;

  return {
    conversations: [],
    messages: {},
    typingUsers: {},
    isWsConnected: false,
    isLoadingConversations: false,
    isLoadingMessages: {},
    hasMoreMessages: {},

    // ── Initialize WebSocket + listeners ───────────

    initialize: (userId: number) => {
      // Connect WebSocket
      webSocketService.connect(userId);

      // Listen for new messages
      unsubMessage = webSocketService.onMessage((msg: MessageData) => {
        const state = get();
        const convId = msg.conversationId;

        // Append message to conversation messages
        const existing = state.messages[convId] ?? [];
        // Avoid duplicates
        if (existing.some((m) => m.id === msg.id)) return;

        set({
          messages: {
            ...state.messages,
            [convId]: [...existing, msg],
          },
        });

        // Update conversation in list
        const conversations = state.conversations.map((conv) => {
          if (conv.id === convId) {
            return {
              ...conv,
              lastMessage: msg,
              lastMessageAt: msg.createdAt,
              unreadCount:
                msg.senderId !== userId
                  ? conv.unreadCount + 1
                  : conv.unreadCount,
            };
          }
          return conv;
        });

        // Sort by lastMessageAt descending
        conversations.sort((a, b) => {
          const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return tb - ta;
        });

        set({ conversations });
      });

      // Listen for typing events
      unsubTyping = webSocketService.onTyping((event: TypingEvent) => {
        const state = get();
        const current = state.typingUsers[event.conversationId] ?? [];

        let updated: number[];
        if (event.typing) {
          updated = current.includes(event.userId)
            ? current
            : [...current, event.userId];
        } else {
          updated = current.filter((id) => id !== event.userId);
        }

        set({
          typingUsers: {
            ...state.typingUsers,
            [event.conversationId]: updated,
          },
        });
      });

      // Listen for connection state
      unsubConnection = webSocketService.onConnectionChange(
        (connected: boolean) => {
          set({ isWsConnected: connected });
        },
      );
    },

    // ── Teardown ──────────────────────────────────

    teardown: () => {
      unsubMessage?.();
      unsubTyping?.();
      unsubConnection?.();
      unsubMessage = null;
      unsubTyping = null;
      unsubConnection = null;
      webSocketService.disconnect();
      set({
        conversations: [],
        messages: {},
        typingUsers: {},
        isWsConnected: false,
      });
    },

    // ── Fetch conversations ───────────────────────

    fetchConversations: async () => {
      set({ isLoadingConversations: true });
      try {
        const conversations = await chatApi.fetchConversations();
        // Sort by lastMessageAt
        conversations.sort((a, b) => {
          const ta = a.lastMessageAt
            ? new Date(a.lastMessageAt).getTime()
            : 0;
          const tb = b.lastMessageAt
            ? new Date(b.lastMessageAt).getTime()
            : 0;
          return tb - ta;
        });
        set({ conversations });
      } catch (e) {
        console.error("[Chat] Error fetching conversations:", e);
      } finally {
        set({ isLoadingConversations: false });
      }
    },

    // ── Fetch messages (initial load) ─────────────

    fetchMessages: async (conversationId: number) => {
      set((s) => ({
        isLoadingMessages: { ...s.isLoadingMessages, [conversationId]: true },
      }));
      try {
        const messages = await chatApi.fetchMessages(conversationId);
        set((s) => ({
          messages: { ...s.messages, [conversationId]: messages },
          hasMoreMessages: {
            ...s.hasMoreMessages,
            [conversationId]: messages.length >= 30,
          },
        }));
      } catch (e) {
        console.error("[Chat] Error fetching messages:", e);
      } finally {
        set((s) => ({
          isLoadingMessages: {
            ...s.isLoadingMessages,
            [conversationId]: false,
          },
        }));
      }
    },

    // ── Fetch older messages (pagination) ─────────

    fetchOlderMessages: async (conversationId: number) => {
      const state = get();
      const existing = state.messages[conversationId] ?? [];
      if (existing.length === 0 || !state.hasMoreMessages[conversationId])
        return;

      const oldestId = existing[0].id;
      set((s) => ({
        isLoadingMessages: { ...s.isLoadingMessages, [conversationId]: true },
      }));
      try {
        const older = await chatApi.fetchMessages(conversationId, oldestId);
        set((s) => ({
          messages: {
            ...s.messages,
            [conversationId]: [...older, ...existing],
          },
          hasMoreMessages: {
            ...s.hasMoreMessages,
            [conversationId]: older.length >= 30,
          },
        }));
      } catch (e) {
        console.error("[Chat] Error fetching older messages:", e);
      } finally {
        set((s) => ({
          isLoadingMessages: {
            ...s.isLoadingMessages,
            [conversationId]: false,
          },
        }));
      }
    },

    // ── Send message via WebSocket ────────────────

    sendMessage: (conversationId: number, content: string) => {
      webSocketService.sendMessage(conversationId, content);
    },

    // ── Mark conversation as read ─────────────────

    markAsRead: async (conversationId: number) => {
      try {
        await chatApi.markConversationAsRead(conversationId);
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c,
          ),
        }));
      } catch (e) {
        console.error("[Chat] Error marking as read:", e);
      }
    },

    // ── Typing indicator ─────────────────────────

    sendTypingIndicator: (conversationId: number, typing: boolean) => {
      webSocketService.sendTyping(conversationId, typing);
    },
  };
});
