import { apiClient } from "./client";
import type { NotificationData } from "@/types/notifications";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ── List ────────────────────────────────────────────

export async function getNotifications(
  page = 0,
  size = 20,
): Promise<PageResponse<NotificationData>> {
  const { data } = await apiClient.get<
    ApiResponse<PageResponse<NotificationData>>
  >("/v1/notifications", { params: { page, size } });
  return data.data;
}

// ── Unread count ────────────────────────────────────

export async function getUnreadCount(): Promise<number> {
  const { data } =
    await apiClient.get<ApiResponse<number>>("/v1/notifications/unread-count");
  return data.data;
}

// ── Mark as read ────────────────────────────────────

export async function markAsRead(id: number): Promise<NotificationData> {
  const { data } = await apiClient.put<ApiResponse<NotificationData>>(
    `/v1/notifications/${id}/read`,
  );
  return data.data;
}

export async function markAllAsRead(): Promise<number> {
  const { data } = await apiClient.put<ApiResponse<number>>(
    "/v1/notifications/read-all",
  );
  return data.data;
}

// ── Delete ──────────────────────────────────────────

export async function deleteNotification(id: number): Promise<void> {
  await apiClient.delete(`/v1/notifications/${id}`);
}
