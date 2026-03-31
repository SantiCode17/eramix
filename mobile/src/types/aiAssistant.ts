// ── AI Assistant types ───────────────────────────────

export interface AiMessageData {
  id: number;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export interface AiConversation {
  id: number;
  title: string;
  messages: AiMessageData[];
  createdAt: string;
}

export type AiAssistantStackParamList = {
  AiChat: { conversationId?: number } | undefined;
};
