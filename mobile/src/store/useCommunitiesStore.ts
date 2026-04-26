import { create } from "zustand";
import { apiClient } from "@/api/client";
import type {
  CommunityData,
  CommunityPostData,
  CreatePostRequest,
  CreateCommentRequest,
} from "@/types";
import { MOCK_COMMUNITIES } from "@/utils/mockData";

interface CommunitiesState {
  communities: CommunityData[];
  myCommunities: CommunityData[];
  selectedCommunity: CommunityData | null;
  posts: CommunityPostData[];
  loading: boolean;
  error: string | null;
  activeTab: "my" | "explore" | "suggested";

  fetchCommunities: () => Promise<void>;
  fetchMyCommunities: () => Promise<void>;
  fetchCommunityPosts: (communityId: number) => Promise<void>;
  joinCommunity: (communityId: number) => Promise<void>;
  leaveCommunity: (communityId: number) => Promise<void>;
  createPost: (communityId: number, data: CreatePostRequest) => Promise<void>;
  likePost: (postId: number) => Promise<void>;
  commentOnPost: (postId: number, data: CreateCommentRequest) => Promise<void>;
  setActiveTab: (tab: "my" | "explore" | "suggested") => void;
  selectCommunity: (community: CommunityData) => void;
  reset: () => void;
}

export const useCommunitiesStore = create<CommunitiesState>((set, get) => ({
  communities: [],
  myCommunities: [],
  selectedCommunity: null,
  posts: [],
  loading: false,
  error: null,
  activeTab: "explore",

  fetchCommunities: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get("/v1/communities?page=0&size=30");
      set({ communities: res.data.content ?? res.data, loading: false });
    } catch (err) {
      console.warn("[Communities] API falló, usando datos mock");
      set({ communities: [...MOCK_COMMUNITIES], loading: false });
    }
  },

  fetchMyCommunities: async () => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get("/v1/communities/my?page=0&size=30");
      set({ myCommunities: res.data.content ?? res.data, loading: false });
    } catch (err) {
      console.warn("[Communities] fetchMyCommunities falló, usando mock");
      set({ myCommunities: MOCK_COMMUNITIES.filter(c => c.isMember), loading: false });
    }
  },

  fetchCommunityPosts: async (communityId: number) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.get(`/v1/communities/${communityId}/posts?page=0&size=30`);
      set({ posts: res.data.content ?? res.data, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Error", loading: false });
    }
  },

  joinCommunity: async (communityId: number) => {
    await apiClient.post(`/v1/communities/${communityId}/join`);
    const community = get().communities.find((c) => c.id === communityId);
    if (community) {
      set((s) => ({
        myCommunities: [...s.myCommunities, { ...community, isMember: true }],
        communities: s.communities.map((c) =>
          c.id === communityId ? { ...c, isMember: true, memberCount: (c.memberCount ?? 0) + 1 } : c,
        ),
      }));
    }
  },

  leaveCommunity: async (communityId: number) => {
    await apiClient.delete(`/v1/communities/${communityId}/leave`);
    set((s) => ({
      myCommunities: s.myCommunities.filter((c) => c.id !== communityId),
      communities: s.communities.map((c) =>
        c.id === communityId ? { ...c, isMember: false, memberCount: Math.max(0, (c.memberCount ?? 1) - 1) } : c,
      ),
    }));
  },

  createPost: async (communityId: number, data: CreatePostRequest) => {
    const res = await apiClient.post(`/v1/communities/${communityId}/posts`, data);
    set((s) => ({ posts: [res.data, ...s.posts] }));
  },

  likePost: async (postId: number) => {
    await apiClient.post(`/v1/communities/posts/${postId}/like`);
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByCurrentUser: !p.likedByCurrentUser,
              likeCount: p.likedByCurrentUser
                ? Math.max(0, (p.likeCount ?? 1) - 1)
                : (p.likeCount ?? 0) + 1,
            }
          : p,
      ),
    }));
  },

  commentOnPost: async (postId: number, data: CreateCommentRequest) => {
    await apiClient.post(`/v1/communities/posts/${postId}/comments`, data);
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId ? { ...p, commentCount: (p.commentCount ?? 0) + 1 } : p,
      ),
    }));
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  selectCommunity: (community) => set({ selectedCommunity: community }),
  reset: () =>
    set({
      communities: [],
      myCommunities: [],
      selectedCommunity: null,
      posts: [],
      loading: false,
      error: null,
      activeTab: "explore",
    }),
}));
