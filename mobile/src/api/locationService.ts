import { apiClient } from "./client";

export interface StartSharingRequest {
  latitude: number;
  longitude: number;
  durationMinutes?: number;
}

export interface LiveLocationResponse {
  userId: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  latitude: number;
  longitude: number;
  expiresAt: string;
  updatedAt: string;
  active: boolean;
}

/** POST /v1/location/share — start sharing location */
export async function startSharing(request: StartSharingRequest): Promise<LiveLocationResponse> {
  const { data } = await apiClient.post("/v1/location/share", request);
  return data.data;
}

/** DELETE /v1/location/share — stop sharing location */
export async function stopSharing(): Promise<void> {
  await apiClient.delete("/v1/location/share");
}

/** GET /v1/location/friends — get active friend locations */
export async function getFriendLocations(): Promise<LiveLocationResponse[]> {
  const { data } = await apiClient.get("/v1/location/friends");
  return data.data;
}

/** GET /v1/location/status — get my sharing status */
export async function getMyStatus(): Promise<LiveLocationResponse> {
  const { data } = await apiClient.get("/v1/location/status");
  return data.data;
}
