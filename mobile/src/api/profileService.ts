import { apiClient } from "./client";
import type {
  User,
  UserUpdateRequest,
  UserPhotoResponse,
  Interest,
  Language,
  University,
  BlockedUser,
} from "@/types";

// ── Profile API ─────────────────────────────────────

export const profileApi = {
  /** GET /v1/users/me */
  getMyProfile: async (): Promise<User> => {
    const { data } = await apiClient.get("/v1/users/me");
    return data.data;
  },

  /** GET /v1/users/:id */
  getProfile: async (id: number): Promise<User> => {
    const { data } = await apiClient.get(`/v1/users/${id}`);
    return data.data;
  },

  /** PUT /v1/users/me */
  updateProfile: async (request: UserUpdateRequest): Promise<User> => {
    const { data } = await apiClient.put("/v1/users/me", request);
    return data.data;
  },

  /** PUT /v1/users/me/photo — multipart */
  updateProfilePhoto: async (uri: string): Promise<User> => {
    const formData = new FormData();
    const filename = uri.split("/").pop() ?? "photo.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    formData.append("file", {
      uri,
      name: filename,
      type: mimeType,
    } as unknown as Blob);

    const { data } = await apiClient.put("/v1/users/me/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  /** POST /v1/users/me/photos — multipart */
  addPhoto: async (uri: string, displayOrder?: number): Promise<UserPhotoResponse> => {
    const formData = new FormData();
    const filename = uri.split("/").pop() ?? "photo.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    formData.append("file", {
      uri,
      name: filename,
      type: mimeType,
    } as unknown as Blob);

    if (displayOrder !== undefined) {
      formData.append("displayOrder", String(displayOrder));
    }

    const { data } = await apiClient.post("/v1/users/me/photos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  /** DELETE /v1/users/me/photos/:photoId */
  deletePhoto: async (photoId: number): Promise<void> => {
    await apiClient.delete(`/v1/users/me/photos/${photoId}`);
  },

  /** GET /v1/users/me/photos */
  getMyPhotos: async (): Promise<UserPhotoResponse[]> => {
    const { data } = await apiClient.get("/v1/users/me/photos");
    return data.data;
  },

  /** PUT /v1/users/me/location */
  updateLocation: async (latitude: number, longitude: number): Promise<User> => {
    const { data } = await apiClient.put("/v1/users/me/location", {
      latitude,
      longitude,
    });
    return data.data;
  },
};

// ── Catalog API ─────────────────────────────────────

export const catalogApi = {
  /** GET /v1/catalog/interests */
  getInterests: async (): Promise<Interest[]> => {
    const { data } = await apiClient.get("/v1/catalog/interests");
    return data.data;
  },

  /** GET /v1/catalog/languages */
  getLanguages: async (): Promise<Language[]> => {
    const { data } = await apiClient.get("/v1/catalog/languages");
    return data.data;
  },

  /** GET /v1/catalog/universities */
  getUniversities: async (): Promise<University[]> => {
    const { data } = await apiClient.get("/v1/catalog/universities");
    return data.data;
  },

  /** GET /v1/catalog/universities/search?query=... */
  searchUniversities: async (query: string): Promise<University[]> => {
    const { data } = await apiClient.get("/v1/catalog/universities/search", {
      params: { query },
    });
    return data.data;
  },
};

// ── Friends / Block API ─────────────────────────────

export const friendsApi = {
  /** GET /v1/friends/blocked */
  getBlockedUsers: async (): Promise<BlockedUser[]> => {
    const { data } = await apiClient.get("/v1/friends/blocked");
    return data.data;
  },

  /** POST /v1/friends/block/:blockedId */
  blockUser: async (blockedId: number): Promise<void> => {
    await apiClient.post(`/v1/friends/block/${blockedId}`);
  },

  /** DELETE /v1/friends/block/:blockedId */
  unblockUser: async (blockedId: number): Promise<void> => {
    await apiClient.delete(`/v1/friends/block/${blockedId}`);
  },
};

// ── Account API ─────────────────────────────────────

export const accountApi = {
  /** DELETE /v1/auth/account */
  deleteAccount: async (password: string): Promise<void> => {
    await apiClient.delete("/v1/auth/account", {
      data: { password },
    });
  },
};
