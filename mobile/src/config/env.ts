/**
 * ════════════════════════════════════════════════════
 *  env.ts — Centralised Environment Configuration
 *  Single source of truth for all API and app config.
 *  NEVER hard-code IPs or URLs elsewhere in the app.
 * ════════════════════════════════════════════════════
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

// ── Environment detection ──────────────────────────
const expoExtra = Constants.expoConfig?.extra ?? {};

export type AppEnv = "development" | "staging" | "production";

/**
 * Resolve the current environment.
 * Priority: expo extra > __DEV__ flag > default "production".
 */
export const APP_ENV: AppEnv =
  (expoExtra.appEnv as AppEnv) ??
  (__DEV__ ? "development" : "production");

// ── Smart host IP detection for development ────────
/**
 * In dev mode, detect the host machine IP from the Expo manifest.
 * When running `expo start --lan`, the manifest debuggerHost
 * contains `<host_ip>:<metro_port>`.  We strip the metro port
 * and replace it with the backend port (8080).
 *
 * Fallback chain:
 *  1. expoExtra.apiUrl           (explicit override in app.json)
 *  2. manifest debuggerHost IP   (auto-detected from Expo LAN)
 *  3. 10.0.2.2                   (Android emulator → host loopback)
 *  4. localhost                   (iOS simulator)
 */
function getDevApiUrl(): string {
  // 1. Explicit override
  if (expoExtra.apiUrl) return expoExtra.apiUrl;

  // 2. Auto-detect from Expo manifest debuggerHost
  const debuggerHost =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    const hostIp = debuggerHost.split(":")[0];
    if (hostIp && hostIp !== "undefined") {
      return `http://${hostIp}:8080`;
    }
  }

  // 3. Platform fallback
  return Platform.OS === "android"
    ? "http://10.0.2.2:8080"
    : "http://localhost:8080";
}

// ── API URL per environment ────────────────────────
const API_URLS: Record<AppEnv, string> = {
  development: getDevApiUrl(),
  staging: "https://staging-api.eramix.eu",
  production: "https://api.eramix.eu",
};

export const API_BASE_URL: string = API_URLS[APP_ENV];

// ── Network tuning ─────────────────────────────────
export const NETWORK = {
  /** Default request timeout in ms */
  timeout: 12_000,
  /** Maximum automatic retries on network errors */
  maxRetries: 3,
  /** Base delay (ms) for exponential back-off: 1s → 2s → 4s */
  retryBaseDelay: 1_000,
  /** After this many consecutive failures the circuit opens */
  circuitBreakerThreshold: 5,
  /** How long (ms) the circuit stays open before half-open probe */
  circuitBreakerCooldown: 30_000,
  /** Debounce delay (ms) for search inputs */
  searchDebounce: 500,
} as const;
