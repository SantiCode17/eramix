/**
 * ────────────────────────────────────────────────────────
 *  client.ts — Axios API client with retry, circuit
 *  breaker, and centralised environment configuration.
 * ────────────────────────────────────────────────────────
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { parseApiError, logError } from "@/utils/errorHandler";
import { API_BASE_URL, NETWORK, APP_ENV } from "@/config/env";
import { networkManager } from "@/config/networkManager";

const __DEV_MODE__ = __DEV__;

if (__DEV_MODE__) {
  console.log(
    `\n🌐 [API] ${APP_ENV} — ${API_BASE_URL}/api — timeout ${NETWORK.timeout}ms`,
  );
}

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: NETWORK.timeout,
  headers: {
    "Content-Type": "application/json",
    "X-Client-Platform": Platform.OS,
    "X-Client-Version": Constants.expoConfig?.version ?? "unknown",
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

// ── Request counter para tracking ───────────────────
let requestCounter = 0;

// ── Request interceptor: inject Bearer + logging + circuit breaker ────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Circuit breaker: skip request if circuit is open
    if (!networkManager.shouldAttemptRequest()) {
      const err = new axios.AxiosError(
        "Circuit breaker open — backend offline",
        "ERR_NETWORK",
        config,
      );
      return Promise.reject(err);
    }

    const requestId = ++requestCounter;
    const method = config.method?.toUpperCase() ?? "?";
    const url = config.url ?? "";

    // Attach requestId para correlacionar con la response
    (config as any).__requestId = requestId;
    (config as any).__startTime = Date.now();

    // Skip auth header for auth endpoints
    const skipPaths = ["/v1/auth/login", "/v1/auth/register", "/v1/auth/refresh"];
    const isAuthPath = skipPaths.some((p) => url.includes(p));

    if (!isAuthPath) {
      const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else if (__DEV_MODE__) {
        console.warn(`⚠️ [API #${requestId}] No hay token guardado — request sin autenticación`);
      }
    }

    // Fix for React Native FormData (allows Axios to set the boundary correctly)
    if (config.data && (config.data instanceof FormData || config.data.constructor?.name === "FormData" || config.data._parts)) {
      delete config.headers["Content-Type"];
      if (config.headers.delete) {
        config.headers.delete("Content-Type");
      }
    }

    if (__DEV_MODE__) {
      console.log(
        `📤 [API #${requestId}] ${method} ${url}`,
        config.data ? `| body: ${JSON.stringify(config.data).slice(0, 200)}` : "",
      );
    }

    return config;
  },
  (error) => {
    console.error("🔴 [API] Error en request interceptor:", error.message);
    return Promise.reject(error);
  },
);

// ── Response interceptor: logging + auto-refresh ────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // ─── Record success in circuit breaker ───
    networkManager.recordSuccess();

    // ─── Respuesta exitosa: log ───
    if (__DEV_MODE__) {
      const reqId = (response.config as any).__requestId ?? "?";
      const startTime = (response.config as any).__startTime;
      const duration = startTime ? `${Date.now() - startTime}ms` : "?";
      const method = response.config.method?.toUpperCase() ?? "?";
      const url = response.config.url ?? "";

      console.log(
        `📥 [API #${reqId}] ${response.status} ${method} ${url} (${duration})`,
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      __requestId?: number;
      __startTime?: number;
    };

    const reqId = config?.__requestId ?? "?";
    const startTime = config?.__startTime;
    const duration = startTime ? `${Date.now() - startTime}ms` : "?";
    const method = config?.method?.toUpperCase() ?? "?";
    const url = config?.url ?? "";

    // ─── Retry with exponential back-off for network errors ───
    const isNetworkError =
      !error.response &&
      (error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        error.code === "ECONNREFUSED");

    const retryCount = (config as any).__retryCount ?? 0;

    // Don't retry if circuit breaker is now open (avoid retry storm)
    const circuitOpen = !networkManager.shouldAttemptRequest();

    if (isNetworkError && retryCount < NETWORK.maxRetries && !(config as any)._skipRetry && !circuitOpen) {
      (config as any).__retryCount = retryCount + 1;
      const delay = NETWORK.retryBaseDelay * Math.pow(2, retryCount); // 1s, 2s, 4s
      if (__DEV_MODE__) {
        console.log(`🔄 [API #${reqId}] Retry ${retryCount + 1}/${NETWORK.maxRetries} in ${delay}ms`);
      }
      await new Promise((r) => setTimeout(r, delay));

      // Re-check circuit breaker after waiting (it may have opened during the delay)
      if (!networkManager.shouldAttemptRequest()) {
        return Promise.reject(error);
      }

      return apiClient(config);
    }

    // ─── Record failure in circuit breaker ───
    if (isNetworkError) {
      networkManager.recordFailure();
    }

    // ─── Auto-refresh en 401 ───
    const isAuthEndpoint =
      config?.url?.includes("/v1/auth/login") ||
      config?.url?.includes("/v1/auth/register");

    // If it's a 401 that can be auto-refreshed, log softly and proceed with refresh
    const is401Refreshable =
      error.response?.status === 401 &&
      !config?._retry &&
      !isAuthEndpoint;

    if (is401Refreshable) {
      if (__DEV_MODE__) {
        console.log(
          `🔄 [API #${reqId}] Token expirado — renovando sesión... | ${method} ${url} (${duration})`,
        );
      }
    } else {
      // ─── Log detallado del error (dev only) — solo para errores reales ───
      if (__DEV_MODE__) {
        // Skip logging expected 4xx errors for friend-request endpoints
        // (400 = mutual match / already sent, 409 = conflict — handled gracefully by caller)
        const isFriendRequestEndpoint = url?.includes("/v1/friends/requests");
        const isExpected4xx =
          isFriendRequestEndpoint &&
          error.response?.status != null &&
          error.response.status >= 400 &&
          error.response.status < 500;

        if (!isExpected4xx) {
          if (error.response) {
            console.error(
              `🔴 [API #${reqId}] HTTP ${error.response.status} | ${method} ${url} (${duration})`,
            );
          } else if (error.request) {
            console.error(
              `🔴 [API #${reqId}] NO RESPONSE | ${method} ${url} (${duration}) — ${error.code}`,
            );
          }
        }
      }
    }

    if (
      error.response?.status !== 401 ||
      config?._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            config.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(config));
          },
          reject,
        });
      });
    }

    config._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
      if (!refreshToken) {
        console.warn("⚠️ [API] No hay refresh token — sesión expirada");
        throw new Error("No hay refresh token disponible");
      }

      console.log("🔄 [API] Renovando token de acceso...");

      const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
        refreshToken,
      });

      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, data.accessToken);
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, data.refreshToken);

      console.log("✅ [API] Token renovado correctamente");

      processQueue(null, data.accessToken);

      config.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(config);
    } catch (refreshError) {
      const parsed = parseApiError(refreshError, "Token Refresh");
      logError(parsed);

      processQueue(refreshError, null);

      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);

      console.warn("🔐 [API] Sesión cerrada — tokens eliminados");

      if (onSessionExpired) {
        onSessionExpired();
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ── Health check helper ─────────────────────────────
/**
 * Verifica si el backend está disponible.
 */
export async function checkBackendHealth(): Promise<{
  available: boolean;
  latency?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await axios.get(`${API_BASE_URL}/api/health`, { timeout: 5000 });
    return { available: true, latency: Date.now() - start };
  } catch (err) {
    const parsed = parseApiError(err, "Health Check");
    return {
      available: false,
      latency: Date.now() - start,
      error: parsed.details,
    };
  }
}
