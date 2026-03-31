import { apiClient } from "./client";
import type {
  EventData,
  EventCreateRequest,
  EventParticipant,
} from "@/types/events";

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

// ── CRUD ────────────────────────────────────────────

export async function createEvent(
  request: EventCreateRequest,
): Promise<EventData> {
  const { data } = await apiClient.post<ApiResponse<EventData>>(
    "/v1/events",
    request,
  );
  return data.data;
}

export async function getEvent(id: number): Promise<EventData> {
  const { data } = await apiClient.get<ApiResponse<EventData>>(
    `/v1/events/${id}`,
  );
  return data.data;
}

export async function updateEvent(
  id: number,
  request: EventCreateRequest,
): Promise<EventData> {
  const { data } = await apiClient.put<ApiResponse<EventData>>(
    `/v1/events/${id}`,
    request,
  );
  return data.data;
}

export async function deleteEvent(id: number): Promise<void> {
  await apiClient.delete(`/v1/events/${id}`);
}

// ── Participation ───────────────────────────────────

export async function joinEvent(
  id: number,
  status: string = "GOING",
): Promise<EventParticipant> {
  const { data } = await apiClient.post<ApiResponse<EventParticipant>>(
    `/v1/events/${id}/join`,
    { status },
  );
  return data.data;
}

export async function leaveEvent(id: number): Promise<void> {
  await apiClient.delete(`/v1/events/${id}/leave`);
}

export async function getParticipants(
  id: number,
): Promise<EventParticipant[]> {
  const { data } = await apiClient.get<ApiResponse<EventParticipant[]>>(
    `/v1/events/${id}/participants`,
  );
  return data.data;
}

// ── Listings ────────────────────────────────────────

export async function getUpcomingEvents(
  category?: string,
  page = 0,
  size = 20,
): Promise<PageResponse<EventData>> {
  const params: Record<string, string | number> = { page, size };
  if (category) params.category = category;
  const { data } = await apiClient.get<ApiResponse<PageResponse<EventData>>>(
    "/v1/events/upcoming",
    { params },
  );
  return data.data;
}

export async function getMyEvents(): Promise<EventData[]> {
  const { data } = await apiClient.get<ApiResponse<EventData[]>>(
    "/v1/events/my-events",
  );
  return data.data;
}

export async function getJoinedEvents(): Promise<EventData[]> {
  const { data } = await apiClient.get<ApiResponse<EventData[]>>(
    "/v1/events/joined",
  );
  return data.data;
}
