/**
 * ────────────────────────────────────────────────────────
 *  client.ts — Axios API client con logging avanzado
 * ────────────────────────────────────────────────────────
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { parseApiError, logError } from "@/utils/errorHandler";

// ── Configuración base ──────────────────────────────
const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ?? "http://192.168.8.106:8080";

const __DEV_MODE__ = __DEV__;

// Log de configuración al iniciar
console.log(
  `\n🌐 [API Client] Configuración inicializada`,
  `\n   Base URL: ${API_BASE_URL}`,
  `\n   Full URL: ${API_BASE_URL}/api`,
  `\n   Timeout: 15000ms`,
  `\n   Platform: ${Platform.OS} ${Platform.Version}`,
  `\n   DEV mode: ${__DEV_MODE__}`,
);

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
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

// ── Request interceptor: inject Bearer + logging ────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
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

    // ─── Log detallado del error ───
    if (error.response) {
      const { status, data } = error.response;
      const serverMsg = typeof data === "object" && data
        ? (data as any).message || (data as any).error || ""
        : String(data ?? "");

      console.error(
        `\n🔴 [API #${reqId}] HTTP ${status} | ${method} ${url} (${duration})`,
        `\n   Server: "${serverMsg}"`,
        `\n   Body: ${JSON.stringify(data).slice(0, 500)}`,
      );
    } else if (error.request) {
      console.error(
        `\n🔴 [API #${reqId}] SIN RESPUESTA | ${method} ${url} (${duration})`,
        `\n   Code: ${error.code}`,
        `\n   Message: ${error.message}`,
        `\n   El servidor en ${API_BASE_URL} no responde.`,
        `\n   Posibles causas:`,
        `\n     1. El backend Spring Boot no está ejecutándose`,
        `\n     2. La IP/puerto ${API_BASE_URL} no es accesible desde este dispositivo`,
        `\n     3. Un firewall está bloqueando la conexión`,
        `\n     4. El dispositivo no tiene conexión de red`,
      );
    } else {
      console.error(
        `\n🔴 [API #${reqId}] ERROR DE CONFIGURACIÓN`,
        `\n   Message: ${error.message}`,
      );
    }

    // ─── Auto-refresh en 401 ───
    const isAuthEndpoint =
      config?.url?.includes("/v1/auth/login") ||
      config?.url?.includes("/v1/auth/register");

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
