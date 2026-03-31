// ── Chat & Messaging Types ──────────────────────────

export interface MessageData {
  id: number;
  conversationId: number;
  senderId: number;
  senderFirstName: string;
  senderLastName: string;
  content: string;
  type: MessageType;
  mediaUrl: string | null;
  isRead: boolean;
  createdAt: string; // ISO instant
}

export type MessageType = "TEXT" | "IMAGE" | "FILE";

export interface ConversationData {
  id: number;
  otherUserId: number;
  otherUserFirstName: string;
  otherUserLastName: string;
  otherUserProfilePhotoUrl: string | null;
  otherUserOnline: boolean;
  lastMessage: MessageData | null;
  unreadCount: number;
  lastMessageAt: string | null;
}

export interface SendMessagePayload {
  conversationId: number;
  content: string;
  type?: MessageType;
  mediaUrl?: string;
}

export interface TypingEvent {
  conversationId: number;
  userId: number;
  typing: boolean;
}

// ── Navigation ──────────────────────────────────────

export type ChatStackParamList = {
  ConversationsList: undefined;
  ChatRoom: {
    conversationId: number;
    otherUserId: number;
    otherUserName: string;
    otherUserPhoto: string | null;
  };
};
