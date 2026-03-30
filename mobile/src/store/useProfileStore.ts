import { create } from "zustand";
import { profileApi, catalogApi, friendsApi } from "@/api";
import type {
  User,
  UserUpdateRequest,
  UserPhotoResponse,
  Interest,
  Language,
  University,
  BlockedUser,
} from "@/types";

interface ProfileState {
  // Profile
  profile: User | null;
  isLoadingProfile: boolean;

  // Photos
  photos: UserPhotoResponse[];
  isLoadingPhotos: boolean;

  // Catalogs
  interests: Interest[];
  languages: Language[];
  universities: University[];
  isLoadingCatalogs: boolean;

  // Blocked users
  blockedUsers: BlockedUser[];
  isLoadingBlocked: boolean;

  // Actions — profile
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UserUpdateRequest) => Promise<User>;
  updateProfilePhoto: (uri: string) => Promise<void>;

  // Actions — photos
  fetchPhotos: () => Promise<void>;
  addPhoto: (uri: string, displayOrder?: number) => Promise<void>;
  deletePhoto: (photoId: number) => Promise<void>;

  // Actions — catalogs
  fetchInterests: () => Promise<void>;
  fetchLanguages: () => Promise<void>;
  fetchUniversities: () => Promise<void>;

  // Actions — blocked
  fetchBlockedUsers: () => Promise<void>;
  unblockUser: (blockedId: number) => Promise<void>;

  // Reset
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoadingProfile: false,
  photos: [],
  isLoadingPhotos: false,
  interests: [],
  languages: [],
  universities: [],
  isLoadingCatalogs: false,
  blockedUsers: [],
  isLoadingBlocked: false,

  // ── Profile ───────────────────────────────────────

  fetchProfile: async () => {
    set({ isLoadingProfile: true });
    try {
      const profile = await profileApi.getMyProfile();
      set({ profile, photos: profile.photos ?? [] });
    } finally {
      set({ isLoadingProfile: false });
    }
  },

  updateProfile: async (data) => {
    const updated = await profileApi.updateProfile(data);
    set({ profile: updated });
    return updated;
  },

  updateProfilePhoto: async (uri) => {
    const updated = await profileApi.updateProfilePhoto(uri);
    set({ profile: updated });
  },

  // ── Photos ────────────────────────────────────────

  fetchPhotos: async () => {
    set({ isLoadingPhotos: true });
    try {
      const photos = await profileApi.getMyPhotos();
      set({ photos });
    } finally {
      set({ isLoadingPhotos: false });
    }
  },

  addPhoto: async (uri, displayOrder) => {
    const newPhoto = await profileApi.addPhoto(uri, displayOrder);
    set((s) => ({ photos: [...s.photos, newPhoto] }));
  },

  deletePhoto: async (photoId) => {
    await profileApi.deletePhoto(photoId);
    set((s) => ({ photos: s.photos.filter((p) => p.id !== photoId) }));
  },

  // ── Catalogs ──────────────────────────────────────

  fetchInterests: async () => {
    if (get().interests.length > 0) return;
    set({ isLoadingCatalogs: true });
    try {
      const interests = await catalogApi.getInterests();
      set({ interests });
    } finally {
      set({ isLoadingCatalogs: false });
    }
  },

  fetchLanguages: async () => {
    if (get().languages.length > 0) return;
    set({ isLoadingCatalogs: true });
    try {
      const languages = await catalogApi.getLanguages();
      set({ languages });
    } finally {
      set({ isLoadingCatalogs: false });
    }
  },

  fetchUniversities: async () => {
    if (get().universities.length > 0) return;
    set({ isLoadingCatalogs: true });
    try {
      const universities = await catalogApi.getUniversities();
      set({ universities });
    } finally {
      set({ isLoadingCatalogs: false });
    }
  },

  // ── Blocked ───────────────────────────────────────

  fetchBlockedUsers: async () => {
    set({ isLoadingBlocked: true });
    try {
      const blockedUsers = await friendsApi.getBlockedUsers();
      set({ blockedUsers });
    } finally {
      set({ isLoadingBlocked: false });
    }
  },

  unblockUser: async (blockedId) => {
    await friendsApi.unblockUser(blockedId);
    set((s) => ({
      blockedUsers: s.blockedUsers.filter((b) => b.receiverId !== blockedId),
    }));
  },

  // ── Reset ─────────────────────────────────────────

  reset: () =>
    set({
      profile: null,
      isLoadingProfile: false,
      photos: [],
      isLoadingPhotos: false,
      interests: [],
      languages: [],
      universities: [],
      isLoadingCatalogs: false,
      blockedUsers: [],
      isLoadingBlocked: false,
    }),
}));
