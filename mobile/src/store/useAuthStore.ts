import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TOKEN_KEYS, setOnSessionExpired } from "@/api/client";
import { authApi } from "@/api/authService";
import { profileApi } from "@/api/profileService";
import { webSocketService } from "@/services/webSocketService";
import type { User, LoginRequest, RegisterRequest } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  forceOnboarding: boolean;
  slideOrder: string[];

  // Actions
  initialize: () => Promise<void>;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
  clearSession: () => void;
  setSlideOrder: (order: string[]) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  forceOnboarding: false,
  slideOrder: [],

  initialize: async () => {
    try {
      set({ isLoading: true });
      const accessToken = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
      const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
      
      const savedOrder = await AsyncStorage.getItem("eramix_card_order");
      if (savedOrder) {
        try { set({ slideOrder: JSON.parse(savedOrder) }); } catch {}
      }

      if (accessToken) {
        set({ accessToken, isAuthenticated: true });
        try {
          const user = await profileApi.getMyProfile();
          set({ user });
        } catch {
          // Access token expired — try refresh
          if (refreshToken) {
            const success = await get().refreshSession();
            if (!success) {
              set({ user: null, accessToken: null, isAuthenticated: false });
            }
          } else {
            set({ user: null, accessToken: null, isAuthenticated: false });
          }
        }
        return;
      }

      if (refreshToken) {
        const success = await get().refreshSession();
        if (success) return;
      }

      // No valid session
      set({ user: null, accessToken: null, isAuthenticated: false });
    } catch {
      set({ user: null, accessToken: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const data = await authApi.login(credentials);
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, data.accessToken);
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, data.refreshToken);
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await authApi.register(data);
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, response.accessToken);
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, response.refreshToken);
      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  refreshSession: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
      if (!refreshToken) return false;

      const data = await authApi.refresh({ refreshToken });
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, data.accessToken);
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, data.refreshToken);
      set({
        user: data.user,
        accessToken: data.accessToken,
        isAuthenticated: true,
      });
      return true;
    } catch {
      get().clearSession();
      return false;
    }
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
      if (refreshToken) {
        await authApi.logout({ refreshToken }).catch(() => {});
      }
    } finally {
      get().clearSession();
    }
  },

  updateUser: (partial) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...partial } });
    }
  },

  clearSession: () => {
    webSocketService.disconnect();
    SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS).catch(() => {});
    SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH).catch(() => {});
    AsyncStorage.removeItem("eramix_onboarding_complete").catch(() => {});
    set({ user: null, accessToken: null, isAuthenticated: false, forceOnboarding: true, slideOrder: [] });
  },

  setSlideOrder: (order) => {
    set({ slideOrder: order });
    AsyncStorage.setItem("eramix_card_order", JSON.stringify(order)).catch(() => {});
  },
}));

// Register the session-expired callback so the API interceptor
// can trigger logout without circular imports
setOnSessionExpired(() => {
  useAuthStore.getState().clearSession();
});
