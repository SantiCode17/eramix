import { apiClient } from "./client";
import type {
  ExchangePartner,
  ExchangeRequest,
  ExchangeSession,
  ExchangeReview,
} from "@/types/exchange";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Partners ────────────────────────────────────────

export async function findPartners(): Promise<ExchangePartner[]> {
  const { data } = await apiClient.get<ApiResponse<ExchangePartner[]>>(
    "/v1/exchange/partners",
  );
  return data.data;
}

// ── Requests ────────────────────────────────────────

export async function createExchangeRequest(body: {
  targetUserId: number;
  offerLanguageId: number;
  wantLanguageId: number;
  message?: string;
}): Promise<ExchangeRequest> {
  const { data } = await apiClient.post<ApiResponse<ExchangeRequest>>(
    "/v1/exchange/requests",
    body,
  );
  return data.data;
}

export async function getPendingReceived(): Promise<ExchangeRequest[]> {
  const { data } = await apiClient.get<ApiResponse<ExchangeRequest[]>>(
    "/v1/exchange/requests/received",
  );
  return data.data;
}

export async function getSentRequests(): Promise<ExchangeRequest[]> {
  const { data } = await apiClient.get<ApiResponse<ExchangeRequest[]>>(
    "/v1/exchange/requests/sent",
  );
  return data.data;
}

export async function acceptRequest(id: number): Promise<ExchangeRequest> {
  const { data } = await apiClient.put<ApiResponse<ExchangeRequest>>(
    `/v1/exchange/requests/${id}/accept`,
  );
  return data.data;
}

export async function rejectRequest(id: number): Promise<ExchangeRequest> {
  const { data } = await apiClient.put<ApiResponse<ExchangeRequest>>(
    `/v1/exchange/requests/${id}/reject`,
  );
  return data.data;
}

// ── Sessions ────────────────────────────────────────

export async function scheduleSession(body: {
  requestId: number;
  scheduledAt: string;
  durationMinutes?: number;
  notes?: string;
}): Promise<ExchangeSession> {
  const { data } = await apiClient.post<ApiResponse<ExchangeSession>>(
    "/v1/exchange/sessions",
    body,
  );
  return data.data;
}

export async function getMySessions(): Promise<ExchangeSession[]> {
  const { data } = await apiClient.get<ApiResponse<ExchangeSession[]>>(
    "/v1/exchange/sessions",
  );
  return data.data;
}

export async function completeSession(id: number): Promise<ExchangeSession> {
  const { data } = await apiClient.put<ApiResponse<ExchangeSession>>(
    `/v1/exchange/sessions/${id}/complete`,
  );
  return data.data;
}

export async function cancelSession(id: number): Promise<ExchangeSession> {
  const { data } = await apiClient.put<ApiResponse<ExchangeSession>>(
    `/v1/exchange/sessions/${id}/cancel`,
  );
  return data.data;
}

// ── Reviews ─────────────────────────────────────────

export async function createReview(body: {
  sessionId: number;
  rating: number;
  comment?: string;
}): Promise<ExchangeReview> {
  const { data } = await apiClient.post<ApiResponse<ExchangeReview>>(
    "/v1/exchange/reviews",
    body,
  );
  return data.data;
}

export async function getUserReviews(userId: number): Promise<ExchangeReview[]> {
  const { data } = await apiClient.get<ApiResponse<ExchangeReview[]>>(
    `/v1/exchange/reviews/${userId}`,
  );
  return data.data;
}
