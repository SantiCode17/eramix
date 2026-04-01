import { apiClient, TOKEN_KEYS } from "./client";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import type { StoryData } from "@/types/stories";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ?? "http://172.20.10.4:8080";

// ── Create story (multipart) ────────────────────────

export async function createStory(
  fileUri: string,
  caption?: string,
): Promise<StoryData> {
  const formData = new FormData();
  const filename = fileUri.split("/").pop() ?? "story.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("file", {
    uri: fileUri,
    name: filename,
    type,
  } as unknown as Blob);

  if (caption) formData.append("caption", caption);

  const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
  const res = await fetch(`${API_BASE_URL}/api/v1/stories`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const json: ApiResponse<StoryData> = await res.json();
  return json.data;
}

// ── Delete story ────────────────────────────────────

export async function deleteStory(id: number): Promise<void> {
  await apiClient.delete(`/v1/stories/${id}`);
}

// ── View story ──────────────────────────────────────

export async function viewStory(id: number): Promise<void> {
  await apiClient.post(`/v1/stories/${id}/view`);
}

// ── Feed (friends + own) ────────────────────────────

export async function getStoryFeed(): Promise<StoryData[]> {
  const { data } = await apiClient.get<ApiResponse<StoryData[]>>(
    "/v1/stories/feed",
  );
  return data.data;
}

// ── User stories ────────────────────────────────────

export async function getUserStories(userId: number): Promise<StoryData[]> {
  const { data } = await apiClient.get<ApiResponse<StoryData[]>>(
    `/v1/stories/user/${userId}`,
  );
  return data.data;
}
