import { apiClient } from "./client";
import type {
  User,
  UserSearchRequest,
  NearbyUserResponse,
  PageResponse,
  FriendRequestResponse,
} from "@/types";

// ── Search / Discover API ───────────────────────────

export const searchApi = {
  /** POST /v1/search — paginated user search */
  searchUsers: async (
    request: UserSearchRequest,
  ): Promise<PageResponse<User>> => {
    const { data } = await apiClient.post("/v1/search", request);
    return data.data;
  },

  /** GET /v1/search/nearby — users within radius */
  findNearby: async (
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
  ): Promise<NearbyUserResponse[]> => {
    const { data } = await apiClient.get("/v1/search/nearby", {
      params: { latitude, longitude, radiusKm },
    });
    return data.data;
  },

  /** GET /v1/search/by-city */
  findByCity: async (city: string): Promise<User[]> => {
    const { data } = await apiClient.get("/v1/search/by-city", {
      params: { city },
    });
    return data.data;
  },

  /** GET /v1/search/by-country */
  findByCountry: async (country: string): Promise<User[]> => {
    const { data } = await apiClient.get("/v1/search/by-country", {
      params: { country },
    });
    return data.data;
  },
};

// ── Friend Requests API ─────────────────────────────

export const friendRequestsApi = {
  /** POST /v1/friends/requests — send friend request */
  send: async (receiverId: number): Promise<FriendRequestResponse> => {
    const { data } = await apiClient.post("/v1/friends/requests", {
      receiverId,
    });
    return data.data;
  },

  /** GET /v1/friends/requests/received */
  getReceived: async (): Promise<FriendRequestResponse[]> => {
    const { data } = await apiClient.get("/v1/friends/requests/received");
    return data.data;
  },

  /** GET /v1/friends/requests/sent */
  getSent: async (): Promise<FriendRequestResponse[]> => {
    const { data } = await apiClient.get("/v1/friends/requests/sent");
    return data.data;
  },

  /** PUT /v1/friends/requests/:id — accept or reject */
  respond: async (
    requestId: number,
    status: "ACCEPTED" | "REJECTED",
  ): Promise<FriendRequestResponse> => {
    const { data } = await apiClient.put(`/v1/friends/requests/${requestId}`, {
      action: status,
    });
    return data.data;
  },

  /** DELETE /v1/friends/requests/:id — cancel sent request */
  cancel: async (requestId: number): Promise<void> => {
    await apiClient.delete(`/v1/friends/requests/${requestId}`);
  },

  /** GET /v1/friends — list all friends */
  getFriends: async (): Promise<User[]> => {
    const { data } = await apiClient.get("/v1/friends");
    return data.data;
  },

  /** DELETE /v1/friends/:friendId — remove friend */
  removeFriend: async (friendId: number): Promise<void> => {
    await apiClient.delete(`/v1/friends/${friendId}`);
  },
};
