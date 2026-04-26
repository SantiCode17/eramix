import { create } from "zustand";
import { searchApi, friendRequestsApi } from "@/api";
import { apiClient } from "@/api/client";
import type { User, DiscoverFilters, FriendRequestResponse } from "@/types";


interface DiscoverState {
  // Card stack
  users: User[];
  currentIndex: number;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;

  // Filters
  filters: DiscoverFilters;

  // Dismissed / requested IDs (avoid re-showing)
  dismissedIds: Set<number>;
  requestedIds: Set<number>;
  friendIds: Set<number>;

  // Friend requests
  receivedRequests: FriendRequestResponse[];
  sentRequests: FriendRequestResponse[];
  requestsLoading: boolean;

  // Actions
  fetchUsers: () => Promise<void>;
  fetchMore: () => Promise<void>;
  setFilters: (filters: Partial<DiscoverFilters>) => void;
  resetFilters: () => void;
  dismissUser: (userId: number) => void;
  sendFriendRequest: (userId: number) => Promise<void>;
  fetchReceivedRequests: () => Promise<void>;
  fetchSentRequests: () => Promise<void>;
  respondToRequest: (
    requestId: number,
    status: "ACCEPTED" | "REJECTED",
  ) => Promise<void>;
  cancelRequest: (requestId: number) => Promise<void>;
  reset: () => void;
}

const DEFAULT_FILTERS: DiscoverFilters = {
  radiusKm: 50,
  interestIds: [],
  languageIds: [],
};

export const useDiscoverStore = create<DiscoverState>((set, get) => ({
  users: [],
  currentIndex: 0,
  loading: false,
  error: null,
  page: 0,
  hasMore: true,

  filters: { ...DEFAULT_FILTERS },

  dismissedIds: new Set(),
  requestedIds: new Set(),
  friendIds: new Set(),

  receivedRequests: [],
  sentRequests: [],
  requestsLoading: false,

  fetchUsers: async () => {
    const { filters, dismissedIds, requestedIds } = get();
    set({ loading: true, error: null, page: 0, currentIndex: 0 });

    // Ensure we have the latest sent requests to avoid showing already liked users
    await get().fetchSentRequests();

    // Fetch friends list to exclude already-friends
    let currentFriendIds = get().friendIds;
    try {
      const { data } = await apiClient.get<{ data: { friendId: number }[] }>("/v1/friends");
      currentFriendIds = new Set((data.data ?? []).map((f) => f.friendId));
      set({ friendIds: currentFriendIds });
    } catch { /* ignore */ }

    try {
      const result = await searchApi.searchUsers({
        destinationCity: filters.destinationCity,
        destinationCountry: filters.destinationCountry,
        universityId: filters.universityId,
        radiusKm: filters.radiusKm,
        page: 0,
        size: 20,
      });

      // Filter out already dismissed/requested/friends users, and those we already liked
      const sentIds = new Set(get().sentRequests.map((r) => r.receiverId));
      const excluded = new Set([...dismissedIds, ...requestedIds, ...currentFriendIds, ...sentIds]);
      const filtered = result.content.filter((u) => !excluded.has(u.id));

      set({
        users: filtered,
        hasMore: !result.last,
        page: 0,
        loading: false,
      });
    } catch {
      set({ users: [], hasMore: false, page: 0, loading: false });
    }
  },

  fetchMore: async () => {
    const { hasMore, loading, page, filters, users, dismissedIds, requestedIds, friendIds } =
      get();
    if (!hasMore || loading) return;

    set({ loading: true });

    try {
      const nextPage = page + 1;
      const result = await searchApi.searchUsers({
        destinationCity: filters.destinationCity,
        destinationCountry: filters.destinationCountry,
        universityId: filters.universityId,
        radiusKm: filters.radiusKm,
        page: nextPage,
        size: 20,
      });

      const sentIds = new Set(get().sentRequests.map((r) => r.receiverId));
      const excluded = new Set([...dismissedIds, ...requestedIds, ...friendIds, ...sentIds]);
      const filtered = result.content.filter((u) => !excluded.has(u.id));

      set({
        users: [...users, ...filtered],
        hasMore: !result.last,
        page: nextPage,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  setFilters: (partial) => {
    set((s) => ({ filters: { ...s.filters, ...partial } }));
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
  },

  dismissUser: (userId) => {
    set((s) => {
      const next = new Set(s.dismissedIds);
      next.add(userId);
      return {
        dismissedIds: next,
        currentIndex: s.currentIndex + 1,
      };
    });

    // Auto-fetch more when running low
    const { users, currentIndex, hasMore } = get();
    if (users.length - currentIndex <= 3 && hasMore) {
      get().fetchMore();
    }
  },

  sendFriendRequest: async (userId) => {
    try {
      await friendRequestsApi.send(userId);
    } catch (err: any) {
      // Silently skip errors — just advance the card
      // 400 = already requested, 403 = already friends, etc.
      const errorMsg = err?.response?.data?.message || err?.message || "Error";
      console.warn("[Discover] sendFriendRequest error (skipping):", errorMsg);
    }
    // Always advance card regardless of error
    set((s) => {
      const next = new Set(s.requestedIds);
      next.add(userId);
      return {
        requestedIds: next,
        currentIndex: s.currentIndex + 1,
      };
    });

    // Auto-fetch more
    const { users, currentIndex, hasMore } = get();
    if (users.length - currentIndex <= 3 && hasMore) {
      get().fetchMore();
    }
  },

  fetchReceivedRequests: async () => {
    set({ requestsLoading: true });
    try {
      const received = await friendRequestsApi.getReceived();
      set({ receivedRequests: received, requestsLoading: false });
    } catch {
      set({ receivedRequests: [], requestsLoading: false });
    }
  },

  fetchSentRequests: async () => {
    set({ requestsLoading: true });
    try {
      const sent = await friendRequestsApi.getSent();
      set({ sentRequests: sent, requestsLoading: false });
    } catch {
      set({ sentRequests: [], requestsLoading: false });
    }
  },

  respondToRequest: async (requestId, status) => {
    try {
      await friendRequestsApi.respond(requestId, status);
      set((s) => ({
        receivedRequests: s.receivedRequests.filter((r) => r.id !== requestId),
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al responder solicitud";
      set({ error: message });
    }
  },

  cancelRequest: async (requestId) => {
    try {
      await friendRequestsApi.cancel(requestId);
      set((s) => ({
        sentRequests: s.sentRequests.filter((r) => r.id !== requestId),
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al cancelar solicitud";
      set({ error: message });
    }
  },

  reset: () => {
    set({
      users: [],
      currentIndex: 0,
      loading: false,
      error: null,
      page: 0,
      hasMore: true,
      filters: { ...DEFAULT_FILTERS },
      dismissedIds: new Set(),
      requestedIds: new Set(),
      friendIds: new Set(),
      receivedRequests: [],
      sentRequests: [],
      requestsLoading: false,
    });
  },
}));
