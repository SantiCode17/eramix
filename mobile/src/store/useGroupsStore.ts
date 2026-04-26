import { create } from "zustand";
import { apiClient } from "@/api/client";
import type {
  GroupData,
  GroupMessageData,
  CreateGroupRequest,
  SendGroupMessagePayload,
} from "@/types";

interface GroupsState {
  groups: GroupData[];
  selectedGroup: GroupData | null;
  messages: GroupMessageData[];
  loading: boolean;
  error: string | null;

  fetchGroups: () => Promise<void>;
  fetchGroupById: (id: number) => Promise<void>;
  createGroup: (data: CreateGroupRequest) => Promise<void>;
  fetchGroupMessages: (groupId: number) => Promise<void>;
  sendMessage: (payload: SendGroupMessagePayload) => void;
  addMessage: (message: GroupMessageData) => void;
  leaveGroup: (groupId: number) => Promise<void>;
  reset: () => void;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  selectedGroup: null,
  messages: [],
  loading: false,
  error: null,

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get("/v1/groups?page=0&size=30");
      set({ groups: res.data.content ?? res.data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error", loading: false });
    }
  },

  fetchGroupById: async (id: number) => {
    try {
      const res = await apiClient.get(`/v1/groups/${id}`);
      set({ selectedGroup: res.data });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error" });
    }
  },

  createGroup: async (data: CreateGroupRequest) => {
    const res = await apiClient.post("/v1/groups", data);
    set((s) => ({ groups: [res.data, ...s.groups] }));
  },

  fetchGroupMessages: async (groupId: number) => {
    set({ loading: true });
    try {
      const res = await apiClient.get(`/v1/groups/${groupId}/messages?page=0&size=50`);
      const msgs: GroupMessageData[] = res.data.content ?? res.data;
      set({ messages: msgs.reverse(), loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error", loading: false });
    }
  },

  sendMessage: (_payload: SendGroupMessagePayload) => {
    // Messages are sent via WebSocket, this is handled in the chat screen
  },

  addMessage: (message: GroupMessageData) => {
    set((s) => ({ messages: [...s.messages, message] }));
  },

  leaveGroup: async (groupId: number) => {
    await apiClient.delete(`/v1/groups/${groupId}/leave`);
    set((s) => ({ groups: s.groups.filter((g) => g.id !== groupId) }));
  },

  reset: () =>
    set({
      groups: [],
      selectedGroup: null,
      messages: [],
      loading: false,
      error: null,
    }),
}));
