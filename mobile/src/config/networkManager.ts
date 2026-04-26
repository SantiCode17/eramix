/**
 * ════════════════════════════════════════════════════
 *  networkManager.ts — Circuit Breaker + Offline Mode
 *  Global singleton that tracks backend reachability.
 * ════════════════════════════════════════════════════
 */

import { NETWORK } from "@/config/env";

export type CircuitState = "closed" | "open" | "half-open";

type Listener = () => void;

class NetworkManager {
  private _consecutiveFailures = 0;
  private _circuitState: CircuitState = "closed";
  private _circuitOpenedAt = 0;
  private _listeners: Set<Listener> = new Set();
  private _online = true; // optimistic start

  /**
   * Snapshot value for useSyncExternalStore.
   * MUST be a stable reference that only changes when _online flips.
   */
  private _snapshot = true;

  // ── Public getters ────────────────────────────────
  get online(): boolean {
    return this._online;
  }

  /** Stable snapshot for useSyncExternalStore (getSnapshot) */
  getSnapshot = (): boolean => this._snapshot;

  get circuitState(): CircuitState {
    if (this._circuitState === "open") {
      const elapsed = Date.now() - this._circuitOpenedAt;
      if (elapsed >= NETWORK.circuitBreakerCooldown) {
        this._circuitState = "half-open";
      }
    }
    return this._circuitState;
  }

  // ── Record outcomes ───────────────────────────────
  recordSuccess(): void {
    this._consecutiveFailures = 0;
    if (this._circuitState !== "closed") {
      this._circuitState = "closed";
    }
    if (!this._online) {
      this._online = true;
      this._snapshot = true;
      this._notify();
    }
  }

  recordFailure(): void {
    this._consecutiveFailures += 1;
    if (this._consecutiveFailures >= NETWORK.circuitBreakerThreshold) {
      this._circuitState = "open";
      this._circuitOpenedAt = Date.now();
      if (this._online) {
        this._online = false;
        this._snapshot = false;
        this._notify();
      }
    }
  }

  /** Should we even attempt a request? */
  shouldAttemptRequest(): boolean {
    const st = this.circuitState; // triggers half-open check
    return st !== "open";
  }

  // ── Listener API (for useSyncExternalStore) ───────
  subscribe = (listener: Listener): (() => void) => {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  };

  private _notify(): void {
    // Notify on next micro-tick to avoid triggering during React render
    queueMicrotask(() => {
      this._listeners.forEach((fn) => fn());
    });
  }
}

export const networkManager = new NetworkManager();
