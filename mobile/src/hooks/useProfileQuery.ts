/**
 * ════════════════════════════════════════════════════
 *  React Query hooks for Profile domain
 *  Caching · Background refresh · Optimistic updates
 * ════════════════════════════════════════════════════
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi, catalogApi, friendsApi } from "@/api";
import type { User, UserUpdateRequest, UserPhotoResponse, Interest, Language, University } from "@/types";

// ── Query Keys ──
export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
  user: (id: number) => [...profileKeys.all, "user", id] as const,
  photos: () => [...profileKeys.all, "photos"] as const,
  catalogs: {
    interests: ["catalogs", "interests"] as const,
    languages: ["catalogs", "languages"] as const,
    universities: ["catalogs", "universities"] as const,
  },
  blocked: ["blocked-users"] as const,
};

// ── My Profile ──
export function useMyProfile() {
  return useQuery<User>({
    queryKey: profileKeys.me(),
    queryFn: profileApi.getMyProfile,
    staleTime: 2 * 60 * 1000, // 2 min
  });
}

// ── User by ID ──
export function useUserProfile(id: number | undefined) {
  return useQuery<User>({
    queryKey: profileKeys.user(id!),
    queryFn: () => profileApi.getProfile(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ── My Photos ──
export function useMyPhotos() {
  return useQuery<UserPhotoResponse[]>({
    queryKey: profileKeys.photos(),
    queryFn: profileApi.getMyPhotos,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Update Profile (optimistic) ──
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserUpdateRequest) => profileApi.updateProfile(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me() });
      const previous = queryClient.getQueryData<User>(profileKeys.me());
      if (previous) {
        // Only spread scalar fields for optimistic UI — server response replaces fully
        const { languages: _l, interests: _i, ...safeFields } = data as Record<string, unknown>;
        queryClient.setQueryData<User>(profileKeys.me(), { ...previous, ...safeFields } as User);
      }
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(profileKeys.me(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}

// ── Update Profile Photo ──
export function useUpdateProfilePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uri: string) => profileApi.updateProfilePhoto(uri),
    onSuccess: (updated) => {
      queryClient.setQueryData(profileKeys.me(), updated);
    },
  });
}

// ── Add Photo ──
export function useAddPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uri, displayOrder }: { uri: string; displayOrder?: number }) =>
      profileApi.addPhoto(uri, displayOrder),
    onSuccess: (newPhoto) => {
      queryClient.setQueryData<UserPhotoResponse[]>(profileKeys.photos(), (old) =>
        old ? [...old, newPhoto] : [newPhoto],
      );
    },
  });
}

// ── Delete Photo ──
export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: number) => profileApi.deletePhoto(photoId),
    onMutate: async (photoId) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.photos() });
      const previous = queryClient.getQueryData<UserPhotoResponse[]>(profileKeys.photos());
      queryClient.setQueryData<UserPhotoResponse[]>(profileKeys.photos(), (old) =>
        old?.filter((p) => p.id !== photoId) ?? [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(profileKeys.photos(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.photos() });
    },
  });
}

// ── Reorder Photos ──
export function useReorderPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoOrders: Array<{ photoId: number; order: number }>) =>
      profileApi.reorderPhotos(photoOrders),
    onMutate: async (photoOrders) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.photos() });
      const previous = queryClient.getQueryData<UserPhotoResponse[]>(profileKeys.photos());
      // Apply optimistic reorder
      if (previous) {
        const orderMap = new Map(photoOrders.map((e) => [e.photoId, e.order]));
        const reordered = [...previous].sort(
          (a, b) => (orderMap.get(a.id) ?? a.displayOrder) - (orderMap.get(b.id) ?? b.displayOrder),
        );
        queryClient.setQueryData(profileKeys.photos(), reordered);
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(profileKeys.photos(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.photos() });
    },
  });
}

// ── Catalogs ──
export function useInterests() {
  return useQuery<Interest[]>({
    queryKey: profileKeys.catalogs.interests,
    queryFn: catalogApi.getInterests,
    staleTime: 30 * 60 * 1000, // 30 min — rarely changes
  });
}

export function useLanguages() {
  return useQuery<Language[]>({
    queryKey: profileKeys.catalogs.languages,
    queryFn: catalogApi.getLanguages,
    staleTime: 30 * 60 * 1000,
  });
}

export function useUniversities() {
  return useQuery<University[]>({
    queryKey: profileKeys.catalogs.universities,
    queryFn: catalogApi.getUniversities,
    staleTime: 30 * 60 * 1000,
  });
}

// ── Blocked Users ──
export function useBlockedUsers() {
  return useQuery({
    queryKey: profileKeys.blocked,
    queryFn: friendsApi.getBlockedUsers,
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockedId: number) => friendsApi.unblockUser(blockedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.blocked });
    },
  });
}
