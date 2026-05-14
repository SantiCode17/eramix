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
  caption?: string,
): Promise<MessageData> {
  const formData = new FormData();
  const filename = imageUri.split("/").pop() ?? "photo.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1].toLowerCase() : "jpg";

  formData.append("file", {
    uri: imageUri,
    name: `image_${Date.now()}.${ext}`,
    type: `image/${ext === "jpg" ? "jpeg" : ext}`,
  } as unknown as Blob);

  if (caption && caption.trim()) {
    formData.append("caption", caption.trim());
  }

  const { data } = await apiClient.post<ApiResponse<MessageData>>(
    `/v1/conversations/${conversationId}/messages/image`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data.data;
}

export async function sendVoiceMessage(
  conversationId: number,
  audioUri: string,
): Promise<MessageData> {
  const formData = new FormData();
  const filename = audioUri.split("/").pop() ?? "audio.m4a";
  const match = /\.(\w+)$/.exec(filename);
  let ext = match ? match[1].toLowerCase() : "m4a";

  // Normalize iOS recording formats to m4a
  if (ext === "caf" || ext === "wav" || ext === "aac") {
    ext = "m4a";
  }

  // Map extension to proper MIME type
  const mimeMap: Record<string, string> = {
    m4a: "audio/mp4",
    mp4: "audio/mp4",
    mp3: "audio/mpeg",
    mpeg: "audio/mpeg",
    ogg: "audio/ogg",
    wav: "audio/wav",
  };
  const mimeType = mimeMap[ext] ?? "audio/mp4";

  formData.append("file", {
    uri: audioUri,
    name: `voice_${Date.now()}.${ext}`,
    type: mimeType,
  } as unknown as Blob);

  const { data } = await apiClient.post<ApiResponse<MessageData>>(
    `/v1/conversations/${conversationId}/messages/audio`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data.data;
}
