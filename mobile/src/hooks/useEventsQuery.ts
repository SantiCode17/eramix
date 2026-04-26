/**
 * ════════════════════════════════════════════════════
 *  React Query hooks for Events domain
 *  Pagination · Background refresh · Optimistic join
 * ════════════════════════════════════════════════════
 */
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import * as eventsApi from "@/api/events";
import type { EventData, EventCreateRequest, EventParticipant } from "@/types/events";

// ── Query Keys ──
export const eventKeys = {
  all: ["events"] as const,
  upcoming: (category?: string) => [...eventKeys.all, "upcoming", category ?? "all"] as const,
  detail: (id: number) => [...eventKeys.all, "detail", id] as const,
  participants: (id: number) => [...eventKeys.all, "participants", id] as const,
  myEvents: () => [...eventKeys.all, "mine"] as const,
  joined: () => [...eventKeys.all, "joined"] as const,
};

// ── Upcoming Events (infinite scroll) ──
export function useUpcomingEvents(category?: string) {
  return useInfiniteQuery({
    queryKey: eventKeys.upcoming(category),
    queryFn: ({ pageParam = 0 }) => eventsApi.getUpcomingEvents(category, pageParam, 20),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.page + 1),
    staleTime: 60 * 1000, // 1 min
  });
}

// ── Single Event Detail ──
export function useEventDetail(id: number | undefined) {
  return useQuery<EventData>({
    queryKey: eventKeys.detail(id!),
    queryFn: () => eventsApi.getEvent(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

// ── My Events (created by me) ──
export function useMyEvents() {
  return useQuery<EventData[]>({
    queryKey: eventKeys.myEvents(),
    queryFn: eventsApi.getMyEvents,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Joined Events ──
export function useJoinedEvents() {
  return useQuery<EventData[]>({
    queryKey: eventKeys.joined(),
    queryFn: eventsApi.getJoinedEvents,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Participants ──
export function useEventParticipants(eventId: number | undefined) {
  return useQuery<EventParticipant[]>({
    queryKey: eventKeys.participants(eventId!),
    queryFn: () => eventsApi.getParticipants(eventId!),
    enabled: !!eventId,
  });
}

// ── Create Event ──
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: EventCreateRequest) => eventsApi.createEvent(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

// ── Join Event (optimistic) ──
export function useJoinEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, status = "GOING" }: { eventId: number; status?: string }) =>
      eventsApi.joinEvent(eventId, status),
    onSuccess: (_data, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.participants(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.joined() });
    },
  });
}

// ── Leave Event ──
export function useLeaveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => eventsApi.leaveEvent(eventId),
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.joined() });
    },
  });
}

// ── Delete Event ──
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => eventsApi.deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
