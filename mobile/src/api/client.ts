import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ?? "http://192.168.8.106:8090";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Token storage keys ──────────────────────────────
export const TOKEN_KEYS = {
  ACCESS: "eramix_access_token",
  REFRESH: "eramix_refresh_token",
} as const;

// ── Session expired callback ────────────────────────
let onSessionExpired: (() => void) | null = null;
export function setOnSessionExpired(cb: () => void) {
  onSessionExpired = cb;
}

// ── Request interceptor: inject Bearer token ────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth header for auth endpoints (login, register, refresh)
    const skipPaths = ["/v1/auth/login", "/v1/auth/register", "/v1/auth/refresh"];
    const isAuthPath = skipPaths.some((p) => config.url?.includes(p));

    if (!isAuthPath) {
      const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: auto-refresh on 401 ──────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh on 401, not on auth endpoints
    const isAuthEndpoint = originalRequest?.url?.includes("/v1/auth/login") ||
      originalRequest?.url?.includes("/v1/auth/register");

    if (error.response?.status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
        refreshToken,
      });

      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, data.accessToken);
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, data.refreshToken);

      processQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Clear tokens
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);

      // Notify logout callback if registered
      if (onSessionExpired) {
        onSessionExpired();
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
