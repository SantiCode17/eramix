/**
 * useWebSocket — Hook para gestionar conexiones WebSocket con STOMP
 * Compatible con el backend Spring Boot de EraMix
 *
 * Features:
 * - Exponential backoff reconnection (1s → 2s → 4s → 8s → 16s → 30s max)
 * - Token refresh on reconnect
 * - AppState-aware (auto-reconnect on foreground)
 * - Heartbeat monitoring
 */
import { useEffect, useRef, useCallback, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { Client, type IMessage } from "@stomp/stompjs";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEYS } from "@/api/client";

const WS_BASE =
  Constants.expoConfig?.extra?.apiUrl?.replace("http", "ws") ??
  "ws://192.168.8.106:8080";

const MIN_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

interface UseWebSocketOptions {
  /** Suscripciones STOMP (ej: "/topic/chat/123") */
  subscriptions?: string[];
  /** Callback cuando se recibe un mensaje */
  onMessage?: (destination: string, body: unknown) => void;
  /** Callback cuando se conecta */
  onConnect?: () => void;
  /** Callback cuando se desconecta */
  onDisconnect?: () => void;
  /** Auto-conectar al montar */
  autoConnect?: boolean;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    subscriptions = [],
    onMessage,
    onConnect,
    onDisconnect,
    autoConnect = true,
  } = options;

  const clientRef = useRef<Client | null>(null);
  const reconnectAttempt = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Calculate delay with exponential backoff + jitter */
  const getReconnectDelay = useCallback(() => {
    const base = MIN_RECONNECT_DELAY * Math.pow(2, reconnectAttempt.current);
    const capped = Math.min(base, MAX_RECONNECT_DELAY);
    // Add ±20% jitter to prevent thundering herd
    const jitter = capped * (0.8 + Math.random() * 0.4);
    return Math.round(jitter);
  }, []);

  const connect = useCallback(async () => {
    if (clientRef.current?.active) return;

    // Always get fresh token on (re)connect
    const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);

    const client = new Client({
      brokerURL: `${WS_BASE}/ws`,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 0, // We handle reconnect ourselves
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        reconnectAttempt.current = 0; // Reset backoff on success
        setIsConnected(true);
        setError(null);

        // Suscribirse a los topics
        subscriptions.forEach((dest) => {
          client.subscribe(dest, (message: IMessage) => {
            try {
              const body = JSON.parse(message.body);
              onMessage?.(dest, body);
            } catch {
              onMessage?.(dest, message.body);
            }
          });
        });

        onConnect?.();
      },

      onDisconnect: () => {
        setIsConnected(false);
        onDisconnect?.();
        // Schedule reconnect with backoff
        scheduleReconnect();
      },

      onStompError: (frame) => {
        setError(frame.headers?.message ?? "Error de conexión STOMP");
        console.error("[WebSocket] STOMP error:", frame.body);
        scheduleReconnect();
      },

      onWebSocketError: (_event) => {
        setError("Error de WebSocket");
        scheduleReconnect();
      },

      onWebSocketClose: () => {
        setIsConnected(false);
        scheduleReconnect();
      },
    });

    clientRef.current = client;
    client.activate();
  }, [subscriptions, onMessage, onConnect, onDisconnect, getReconnectDelay]);

  /** Schedule reconnect with exponential backoff */
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) return; // Already scheduled
    reconnectAttempt.current += 1;
    const delay = getReconnectDelay();
    console.log(`[WebSocket] Reconnect #${reconnectAttempt.current} in ${delay}ms`);
    reconnectTimerRef.current = setTimeout(() => {
      reconnectTimerRef.current = null;
      connect();
    }, delay);
  }, [connect, getReconnectDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const send = useCallback(
    (destination: string, body: unknown) => {
      if (!clientRef.current?.connected) {
        console.warn("[WebSocket] No conectado. No se puede enviar.");
        return;
      }
      clientRef.current.publish({
        destination,
        body: typeof body === "string" ? body : JSON.stringify(body),
      });
    },
    [],
  );

  // ── AppState awareness: reconnect when returning to foreground ──
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === "active" && !clientRef.current?.active) {
        reconnectAttempt.current = 0; // Fresh start
        connect();
      } else if (nextState === "background") {
        // Optionally disconnect to save battery
        // disconnect(); // Uncomment if you want aggressive battery saving
      }
    };

    const subscription = AppState.addEventListener("change", handleAppState);
    return () => subscription.remove();
  }, [connect]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return { isConnected, error, connect, disconnect, send, reconnectAttempt: reconnectAttempt.current };
}
