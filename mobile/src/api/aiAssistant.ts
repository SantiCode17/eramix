import { apiClient } from "./client";
import type { AiConversation } from "@/types/aiAssistant";

export const getAiConversations = () =>
  apiClient.get<AiConversation[]>("/ai/conversations");

export const getAiConversation = (id: number) =>
  apiClient.get<AiConversation>(`/ai/conversations/${id}`);

export const sendAiChat = (data: { conversationId?: number; message: string }) =>
  apiClient.post<AiConversation>("/ai/chat", data);

export const deleteAiConversation = (id: number) =>
  apiClient.delete(`/ai/conversations/${id}`);
