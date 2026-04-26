import { apiClient } from "./client";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ── Types ────────────────────────────────────────── */

export interface UserPlace {
  id: number;
  name: string;
  description?: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  visited: boolean;
  rating?: number;
  mapsUrl?: string;
  notes?: string;
  targetDate?: string;
  createdAt: string;
}

export interface CreateUserPlaceRequest {
  name: string;
  description?: string;
  category?: string;
  priority?: string;
  mapsUrl?: string;
  notes?: string;
  targetDate?: string;
}

export interface UpdateUserPlaceRequest {
  name?: string;
  description?: string;
  category?: string;
  priority?: string;
  visited?: boolean;
  rating?: number;
  mapsUrl?: string;
  notes?: string;
  targetDate?: string;
}

/* ── API ──────────────────────────────────────────── */

async function getPlaces(): Promise<UserPlace[]> {
  const { data } = await apiClient.get<ApiResponse<UserPlace[]>>("/v1/places");
  return data.data;
}

async function createPlace(body: CreateUserPlaceRequest): Promise<UserPlace> {
  const { data } = await apiClient.post<ApiResponse<UserPlace>>(
    "/v1/places",
    body,
  );
  return data.data;
}

async function updatePlace(
  id: number,
  body: UpdateUserPlaceRequest,
): Promise<UserPlace> {
  const { data } = await apiClient.put<ApiResponse<UserPlace>>(
    `/v1/places/${id}`,
    body,
  );
  return data.data;
}

async function deletePlace(id: number): Promise<void> {
  await apiClient.delete(`/v1/places/${id}`);
}

export const placesApi = {
  getPlaces,
  createPlace,
  updatePlace,
  deletePlace,
};
