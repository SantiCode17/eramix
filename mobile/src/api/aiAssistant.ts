import { apiClient } from "./client";
import type { AiConversation } from "@/types/aiAssistant";

export const getAiConversations = () =>
  apiClient.get<AiConversation[]>("/v1/ai/conversations");

export const getAiConversation = (id: number) =>
  apiClient.get<AiConversation>(`/v1/ai/conversations/${id}`);

export const sendAiChat = (data: { conversationId?: number; message: string }) =>
  apiClient.post<AiConversation>("/v1/ai/chat", data);

export const deleteAiConversation = (id: number) =>
  apiClient.delete(`/v1/ai/conversations/${id}`);
