import { apiClient } from "./client";
import type {
  GroupData,
  GroupMessageData,
  CreateGroupRequest,
} from "@/types/groups";

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

// ── Groups CRUD ─────────────────────────────────────

export async function createGroup(
  request: CreateGroupRequest,
): Promise<GroupData> {
  const { data } = await apiClient.post<ApiResponse<GroupData>>(
    "/v1/groups",
    request,
  );
  return data.data;
}

export async function getMyGroups(): Promise<GroupData[]> {
  const { data } = await apiClient.get<ApiResponse<GroupData[]>>(
    "/v1/groups/my",
  );
  return data.data;
}

export async function getGroup(id: number): Promise<GroupData> {
  const { data } = await apiClient.get<ApiResponse<GroupData>>(
    `/v1/groups/${id}`,
  );
  return data.data;
}

// ── Members ─────────────────────────────────────────

export async function addMembers(
  groupId: number,
  memberIds: number[],
): Promise<GroupData> {
  const { data } = await apiClient.post<ApiResponse<GroupData>>(
    `/v1/groups/${groupId}/members`,
    memberIds,
  );
  return data.data;
}

export async function removeMember(
  groupId: number,
  userId: number,
): Promise<void> {
  await apiClient.delete(`/v1/groups/${groupId}/members/${userId}`);
}

export async function leaveGroup(groupId: number): Promise<void> {
  await apiClient.delete(`/v1/groups/${groupId}/leave`);
}

// ── Messages ────────────────────────────────────────

export async function getGroupMessages(
  groupId: number,
  page: number = 0,
  size: number = 50,
): Promise<PageData<GroupMessageData>> {
  const { data } = await apiClient.get<ApiResponse<PageData<GroupMessageData>>>(
    `/v1/groups/${groupId}/messages`,
    { params: { page, size } },
  );
  return data.data;
}

export async function markGroupAsRead(groupId: number): Promise<void> {
  await apiClient.put(`/v1/groups/${groupId}/read`);
}

/** Upload a media file (image or audio) for a group message, returns the media URL */
export async function uploadGroupMedia(
  groupId: number,
  fileUri: string,
  mimeType: string,
): Promise<string> {
  const ext = fileUri.split(".").pop() ?? "jpg";
  const form = new FormData();
  form.append("file", {
    uri: fileUri,
    type: mimeType,
    name: `group_${groupId}_${Date.now()}.${ext}`,
  } as any);
  const { data } = await apiClient.post<ApiResponse<{ url: string }>>(
    `/v1/groups/${groupId}/messages/upload`,
    form,
  );
  return data.data.url;
}
