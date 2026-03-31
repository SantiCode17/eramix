import { apiClient } from "./client";

// ── Search API ──────────────────────────────────────

interface SearchRequest {
  destinationCity?: string;
  destinationCountry?: string;
  universityId?: number;
  radiusKm?: number;
  latitude?: number;
  longitude?: number;
  page?: number;
  size?: number;
}

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  bio: string | null;
  destinationCity: string | null;
  destinationCountry: string | null;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export async function searchUsers(
  request: SearchRequest,
): Promise<PageResponse<UserProfile>> {
  const { data } = await apiClient.post("/v1/search", request);
  return data.data;
}

export async function findNearbyUsers(
  lat: number,
  lng: number,
  radiusKm = 50,
): Promise<UserProfile[]> {
  const { data } = await apiClient.get("/v1/search/nearby", {
    params: { latitude: lat, longitude: lng, radiusKm },
  });
  return data.data;
}

export async function findByCity(city: string): Promise<UserProfile[]> {
  const { data } = await apiClient.get("/v1/search/by-city", {
    params: { city },
  });
  return data.data;
}

export async function findByCountry(country: string): Promise<UserProfile[]> {
  const { data } = await apiClient.get("/v1/search/by-country", {
    params: { country },
  });
  return data.data;
}
