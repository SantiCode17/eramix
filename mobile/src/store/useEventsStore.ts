import { create } from "zustand";
import { apiClient } from "@/api/client";
import type {
  EventData,
  EventCreateRequest,
} from "@/types";
import { MOCK_EVENTS } from "@/utils/mockData";

interface EventsState {
  events: EventData[];
  selectedEvent: EventData | null;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  activeCategory: string;

  fetchEvents: (category?: string) => Promise<void>;
  fetchMore: () => Promise<void>;
  fetchEventById: (id: number) => Promise<void>;
  createEvent: (data: EventCreateRequest) => Promise<void>;
  joinEvent: (eventId: number) => Promise<void>;
  leaveEvent: (eventId: number) => Promise<void>;
  setCategory: (category: string) => void;
  reset: () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  page: 0,
  hasMore: true,
  activeCategory: "all",

  fetchEvents: async (category?: string) => {
    const cat = category ?? get().activeCategory;
    set({ loading: true, error: null, page: 0, activeCategory: cat });

    try {
      const params = cat && cat !== "all" ? `?category=${cat}&page=0&size=20` : "?page=0&size=20";
      const res = await apiClient.get(`/v1/events${params}`);
      set({
        events: res.data.content ?? res.data,
        hasMore: !(res.data.last ?? true),
        loading: false,
      });
    } catch (err) {
      console.warn("[Events] API falló, usando datos mock");
      const cat = category ?? get().activeCategory;
      const filtered = cat && cat !== "all" ? MOCK_EVENTS.filter(e => e.category === cat) : [...MOCK_EVENTS];
      set({ events: filtered, hasMore: false, loading: false });
    }
  },

  fetchMore: async () => {
    const { hasMore, loading, page, activeCategory } = get();
    if (!hasMore || loading) return;

    const nextPage = page + 1;
    try {
      const params = activeCategory !== "all"
        ? `?category=${activeCategory}&page=${nextPage}&size=20`
        : `?page=${nextPage}&size=20`;
      const res = await apiClient.get(`/v1/events${params}`);
      set((s) => ({
        events: [...s.events, ...(res.data.content ?? res.data)],
        hasMore: !(res.data.last ?? true),
        page: nextPage,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error al cargar más eventos" });
    }
  },

  fetchEventById: async (id: number) => {
    try {
      const res = await apiClient.get(`/v1/events/${id}`);
      set({ selectedEvent: res.data });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error al cargar evento" });
    }
  },

  createEvent: async (data: EventCreateRequest) => {
    const res = await apiClient.post("/v1/events", data);
    set((s) => ({ events: [res.data, ...s.events] }));
  },

  joinEvent: async (eventId: number) => {
    await apiClient.post(`/v1/events/${eventId}/join`);
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId ? { ...e, isParticipant: true, participantCount: (e.participantCount ?? 0) + 1 } : e,
      ),
      selectedEvent:
        s.selectedEvent?.id === eventId
          ? { ...s.selectedEvent, isParticipant: true, participantCount: (s.selectedEvent.participantCount ?? 0) + 1 }
          : s.selectedEvent,
    }));
  },

  leaveEvent: async (eventId: number) => {
    await apiClient.delete(`/v1/events/${eventId}/leave`);
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId ? { ...e, isParticipant: false, participantCount: Math.max(0, (e.participantCount ?? 1) - 1) } : e,
      ),
      selectedEvent:
        s.selectedEvent?.id === eventId
          ? { ...s.selectedEvent, isParticipant: false, participantCount: Math.max(0, (s.selectedEvent.participantCount ?? 1) - 1) }
          : s.selectedEvent,
    }));
  },

  setCategory: (category: string) => {
    set({ activeCategory: category });
    get().fetchEvents(category);
  },

  reset: () =>
    set({
      events: [],
      selectedEvent: null,
      loading: false,
      error: null,
      page: 0,
      hasMore: true,
      activeCategory: "all",
    }),
}));
