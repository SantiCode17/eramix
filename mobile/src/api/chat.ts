import { apiClient } from "./client";
import type { ConversationData, MessageData } from "@/types/chat";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Conversations ───────────────────────────────────

export async function fetchConversations(): Promise<ConversationData[]> {
  const { data } = await apiClient.get<ApiResponse<ConversationData[]>>(
    "/v1/conversations",
  );
  return data.data;
}

export async function fetchConversation(
  id: number,
): Promise<ConversationData> {
  const { data } = await apiClient.get<ApiResponse<ConversationData>>(
    `/v1/conversations/${id}`,
  );
  return data.data;
}

// ── Messages (cursor-based pagination) ──────────────

export async function fetchMessages(
  conversationId: number,
  cursor?: number,
  size = 30,
): Promise<MessageData[]> {
  const params: Record<string, string | number> = { size };
  if (cursor) params.cursor = cursor;

  const { data } = await apiClient.get<ApiResponse<MessageData[]>>(
    `/v1/conversations/${conversationId}/messages`,
    { params },
  );
  return data.data;
}

// ── Mark as read ────────────────────────────────────

export async function markConversationAsRead(
  conversationId: number,
): Promise<number> {
  const { data } = await apiClient.put<ApiResponse<number>>(
    `/v1/conversations/${conversationId}/read`,
  );
  return data.data;
}

// ── Send image message ──────────────────────────────

export async function sendImageMessage(
  conversationId: number,
  imageUri: string,
): Promise<MessageData> {
  const formData = new FormData();
  const filename = imageUri.split("/").pop() ?? "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1] : "jpg";

  formData.append("file", {
    uri: imageUri,
    name: filename,
    type: `image/${ext}`,
  } as unknown as Blob);
  formData.append("conversationId", String(conversationId));
  formData.append("type", "IMAGE");

    const { data } = await apiClient.post<ApiResponse<MessageData>>(
      `/v1/conversations/${conversationId}/messages/image`,
      formData
    );
  return data.data;
}
