import { apiClient } from "./client";
import type { HousingPost } from "@/types/housing";

export async function getAllPosts(city?: string): Promise<HousingPost[]> {
  const params = city ? { city } : {};
  const { data } = await apiClient.get("/housing", { params });
  return data.data;
}

export async function getMyPosts(): Promise<HousingPost[]> {
  const { data } = await apiClient.get("/housing/mine");
  return data.data;
}

export async function createPost(req: {
  title: string; description: string; city: string; address?: string;
  monthlyRent: number; currency?: string; availableFrom: string;
  availableUntil?: string; roomsAvailable?: number; postType?: string; photoUrl?: string;
}): Promise<HousingPost> {
  const { data } = await apiClient.post("/housing", req);
  return data.data;
}

export async function deactivatePost(postId: number): Promise<void> {
  await apiClient.delete(`/housing/${postId}`);
}
