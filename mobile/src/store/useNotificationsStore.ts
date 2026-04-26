import { create } from "zustand";
import { apiClient } from "@/api/client";
import type { NotificationData } from "@/types";

interface NotificationsState {
  notifications: NotificationData[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;

  fetchNotifications: () => Promise<void>;
  fetchMore: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  page: 0,
  hasMore: true,

  fetchNotifications: async () => {
    set({ loading: true, error: null, page: 0 });
    try {
      const res = await apiClient.get("/v1/notifications?page=0&size=20");
      set({
        notifications: res.data.content ?? res.data,
        hasMore: !(res.data.last ?? true),
        loading: false,
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error", loading: false });
    }
  },

  fetchMore: async () => {
    const { hasMore, loading, page } = get();
    if (!hasMore || loading) return;

    const nextPage = page + 1;
    try {
      const res = await apiClient.get(`/v1/notifications?page=${nextPage}&size=20`);
      set((s) => ({
        notifications: [...s.notifications, ...(res.data.content ?? res.data)],
        hasMore: !(res.data.last ?? true),
        page: nextPage,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error" });
    }
  },

  markAsRead: async (notificationId: number) => {
    await apiClient.put(`/v1/notifications/${notificationId}/read`);
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await apiClient.put("/v1/notifications/read-all");
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  fetchUnreadCount: async () => {
    try {
      const res = await apiClient.get("/v1/notifications/unread-count");
      set({ unreadCount: res.data.count ?? res.data ?? 0 });
    } catch {
      // silently fail
    }
  },

  reset: () =>
    set({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null,
      page: 0,
      hasMore: true,
    }),
}));
