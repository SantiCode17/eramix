import { apiClient } from "./client";
import type {
  CommunityData,
  CommunityPostData,
  CommunityCommentData,
  CommunityCategory,
  CreatePostRequest,
  CreateCommentRequest,
} from "@/types/communities";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ── Communities ──────────────────────────────────────

export async function getCommunities(
  category?: CommunityCategory,
  q?: string,
): Promise<CommunityData[]> {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  if (q) params.q = q;
  const { data } = await apiClient.get<ApiResponse<CommunityData[]>>(
    "/v1/communities",
    { params },
  );
  return data.data;
}

export async function getMyCommunities(): Promise<CommunityData[]> {
  const { data } = await apiClient.get<ApiResponse<CommunityData[]>>(
    "/v1/communities/my",
  );
  return data.data;
}

export async function getSuggestedCommunities(): Promise<CommunityData[]> {
  const { data } = await apiClient.get<ApiResponse<CommunityData[]>>(
    "/v1/communities/suggested",
  );
  return data.data;
}

export async function getCommunity(id: number): Promise<CommunityData> {
  const { data } = await apiClient.get<ApiResponse<CommunityData>>(
    `/v1/communities/${id}`,
  );
  return data.data;
}

// ── Join / Leave ────────────────────────────────────

export async function joinCommunity(id: number): Promise<CommunityData> {
  const { data } = await apiClient.post<ApiResponse<CommunityData>>(
    `/v1/communities/${id}/join`,
  );
  return data.data;
}

export async function leaveCommunity(id: number): Promise<void> {
  await apiClient.delete(`/v1/communities/${id}/leave`);
}

// ── Posts ────────────────────────────────────────────

export async function getCommunityPosts(
  communityId: number,
  page: number = 0,
  size: number = 20,
): Promise<PageData<CommunityPostData>> {
  const { data } = await apiClient.get<
    ApiResponse<PageData<CommunityPostData>>
  >(`/v1/communities/${communityId}/posts`, { params: { page, size } });
  return data.data;
}

export async function createPost(
  communityId: number,
  request: CreatePostRequest,
): Promise<CommunityPostData> {
  const { data } = await apiClient.post<ApiResponse<CommunityPostData>>(
    `/v1/communities/${communityId}/posts`,
    request,
  );
  return data.data;
}

// ── Likes ───────────────────────────────────────────

export async function togglePostLike(
  communityId: number,
  postId: number,
): Promise<CommunityPostData> {
  const { data } = await apiClient.post<ApiResponse<CommunityPostData>>(
    `/v1/communities/${communityId}/posts/${postId}/like`,
  );
  return data.data;
}

// ── Comments ────────────────────────────────────────

export async function createComment(
  communityId: number,
  postId: number,
  request: CreateCommentRequest,
): Promise<CommunityCommentData> {
  const { data } = await apiClient.post<ApiResponse<CommunityCommentData>>(
    `/v1/communities/${communityId}/posts/${postId}/comments`,
    request,
  );
  return data.data;
}
