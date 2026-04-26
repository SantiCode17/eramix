/**
 * ════════════════════════════════════════════════════
 *  React Query hooks for Discover / Search domain
 *  Search · Nearby · Friend Requests
 * ════════════════════════════════════════════════════
 */
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { searchApi, friendRequestsApi } from "@/api";
import type { User, UserSearchRequest, FriendRequestResponse } from "@/types";

// ── Query Keys ──
export const discoverKeys = {
  all: ["discover"] as const,
  search: (filters: Record<string, unknown>) => [...discoverKeys.all, "search", filters] as const,
  nearby: (lat: number, lng: number, radius: number) => [...discoverKeys.all, "nearby", lat, lng, radius] as const,
  byCity: (city: string) => [...discoverKeys.all, "city", city] as const,
  friendRequests: {
    received: ["friend-requests", "received"] as const,
    sent: ["friend-requests", "sent"] as const,
  },
};

// ── Search Users (infinite) ──
export function useSearchUsers(filters: UserSearchRequest, enabled = true) {
  return useInfiniteQuery({
    queryKey: discoverKeys.search(filters as unknown as Record<string, unknown>),
    queryFn: ({ pageParam = 0 }) =>
      searchApi.searchUsers({ ...filters, page: pageParam, size: filters.size ?? 20 }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
    enabled,
    staleTime: 30 * 1000,
  });
}

// ── Nearby Users ──
export function useNearbyUsers(lat: number, lng: number, radiusKm = 50, enabled = true) {
  return useQuery({
    queryKey: discoverKeys.nearby(lat, lng, radiusKm),
    queryFn: () => searchApi.findNearby(lat, lng, radiusKm),
    enabled,
    staleTime: 60 * 1000,
  });
}

// ── By City ──
export function useCityUsers(city: string, enabled = true) {
  return useQuery<User[]>({
    queryKey: discoverKeys.byCity(city),
    queryFn: () => searchApi.findByCity(city),
    enabled: !!city && enabled,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Friend Requests ──
export function useReceivedFriendRequests() {
  return useQuery<FriendRequestResponse[]>({
    queryKey: discoverKeys.friendRequests.received,
    queryFn: friendRequestsApi.getReceived,
    staleTime: 30 * 1000,
  });
}

export function useSentFriendRequests() {
  return useQuery<FriendRequestResponse[]>({
    queryKey: discoverKeys.friendRequests.sent,
    queryFn: friendRequestsApi.getSent,
    staleTime: 30 * 1000,
  });
}

export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiverId: number) => friendRequestsApi.send(receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discoverKeys.friendRequests.sent });
    },
  });
}

export function useRespondFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, status }: { requestId: number; status: "ACCEPTED" | "REJECTED" }) =>
      friendRequestsApi.respond(requestId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discoverKeys.friendRequests.received });
      queryClient.invalidateQueries({ queryKey: discoverKeys.friendRequests.sent });
    },
  });
}
