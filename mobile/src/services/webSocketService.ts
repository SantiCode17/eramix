import { Client, IFrame, IMessage } from "@stomp/stompjs";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { TOKEN_KEYS } from "@/api/client";
import type { MessageData, TypingEvent } from "@/types/chat";

// ── Configuration ───────────────────────────────────

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ?? "http://172.20.10.4:8080";

// Transform http(s) → ws(s) for raw WebSocket
const WS_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws/websocket";

const RECONNECT_BASE_DELAY = 1000;
const RECONNECT_MAX_DELAY = 30000;
const RECONNECT_JITTER = 0.3;

// ── Types ───────────────────────────────────────────

type MessageListener = (message: MessageData) => void;
type TypingListener = (event: TypingEvent) => void;
type ConnectionListener = (connected: boolean) => void;

// ── WebSocket Service (Singleton) ───────────────────

class WebSocketService {
  private client: Client | null = null;
  private messageListeners = new Set<MessageListener>();
  private typingListeners = new Set<TypingListener>();
  private connectionListeners = new Set<ConnectionListener>();
  private reconnectAttempts = 0;
  private isConnecting = false;
  private userId: number | null = null;

  // ── Connect ─────────────────────────────────────

  async connect(userId: number): Promise<void> {
    if (this.client?.connected || this.isConnecting) return;

    this.userId = userId;
    this.isConnecting = true;

    const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
    if (!token) {
      console.warn("[WS] No access token available, skipping connect");
      this.isConnecting = false;
      return;
    }

    this.client = new Client({
      brokerURL: `${WS_URL}?token=${encodeURIComponent(token)}`,
      connectHeaders: {},
      debug: __DEV__ ? (msg) => console.log("[STOMP]", msg) : () => {},
      reconnectDelay: 0, // We handle reconnect manually
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,

      onConnect: () => {
        console.log("[WS] Connected");
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyConnection(true);
        this.subscribeToQueues();
      },

      onStompError: (frame: IFrame) => {
        console.error("[WS] STOMP error:", frame.headers.message);
        this.isConnecting = false;
        this.notifyConnection(false);
        this.scheduleReconnect();
      },

      onWebSocketClose: () => {
        console.log("[WS] Connection closed");
        this.isConnecting = false;
        this.notifyConnection(false);
        if (this.userId) {
          this.scheduleReconnect();
        }
      },

      onWebSocketError: (event) => {
        console.error("[WS] WebSocket error:", event);
        this.isConnecting = false;
      },
    });

    this.client.activate();
  }

  // ── Subscribe to user queues ────────────────────

  private subscribeToQueues(): void {
    if (!this.client?.connected) return;

    // Subscribe to personal message queue
    this.client.subscribe(
      "/user/queue/messages",
      (stompMessage: IMessage) => {
        try {
          const message: MessageData = JSON.parse(stompMessage.body);
          this.messageListeners.forEach((listener) => listener(message));
        } catch (e) {
          console.error("[WS] Error parsing message:", e);
        }
      },
    );

    // Subscribe to typing events
    this.client.subscribe(
      "/user/queue/typing",
      (stompMessage: IMessage) => {
        try {
          const event: TypingEvent = JSON.parse(stompMessage.body);
          this.typingListeners.forEach((listener) => listener(event));
        } catch (e) {
          console.error("[WS] Error parsing typing event:", e);
        }
      },
    );
  }

  // ── Send message via STOMP ──────────────────────

  sendMessage(conversationId: number, content: string, type = "TEXT"): void {
    if (!this.client?.connected) {
      console.warn("[WS] Not connected, cannot send message");
      return;
    }

    this.client.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify({
        conversationId,
        content,
        type,
      }),
    });
  }

  // ── Send typing indicator ──────────────────────

  sendTyping(conversationId: number, typing: boolean): void {
    if (!this.client?.connected) return;

    this.client.publish({
      destination: "/app/chat.typing",
      body: JSON.stringify({
        conversationId,
        typing,
      }),
    });
  }

  // ── Reconnect with exponential backoff + jitter ─

  private scheduleReconnect(): void {
    if (this.isConnecting || !this.userId) return;

    const delay = Math.min(
      RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts),
      RECONNECT_MAX_DELAY,
    );
    const jitteredDelay = delay * (1 + (Math.random() - 0.5) * 2 * RECONNECT_JITTER);

    console.log(
      `[WS] Reconnecting in ${Math.round(jitteredDelay)}ms (attempt ${this.reconnectAttempts + 1})`,
    );

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(this.userId!);
    }, jitteredDelay);
  }

  // ── Disconnect ──────────────────────────────────

  disconnect(): void {
    this.userId = null;
    this.reconnectAttempts = 0;
    this.isConnecting = false;

    if (this.client) {
      try {
        this.client.deactivate();
      } catch (e) {
        console.warn("[WS] Error during deactivation:", e);
      }
      this.client = null;
    }

    this.notifyConnection(false);
  }

  // ── Listeners ───────────────────────────────────

  onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  onTyping(listener: TypingListener): () => void {
    this.typingListeners.add(listener);
    return () => this.typingListeners.delete(listener);
  }

  onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }

  private notifyConnection(connected: boolean): void {
    this.connectionListeners.forEach((listener) => listener(connected));
  }

  // ── Status ──────────────────────────────────────

  get isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}

// Export singleton
export const webSocketService = new WebSocketService();
