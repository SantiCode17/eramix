/**
 * ════════════════════════════════════════════════════
 *  useNetworkStatus — React hook for online/offline state
 *  Uses useSyncExternalStore with stable subscribe + getSnapshot
 *  references from the NetworkManager singleton.
 * ════════════════════════════════════════════════════
 */

import { useSyncExternalStore } from "react";
import { networkManager } from "@/config/networkManager";

/**
 * Returns `true` when the backend is considered reachable.
 *
 * ⚠️  getSnapshot and subscribe MUST be stable references
 *     (not recreated per render) to avoid infinite loops.
 *     They are bound methods on the networkManager singleton.
 */
export function useNetworkStatus(): boolean {
  return useSyncExternalStore(
    networkManager.subscribe,
    networkManager.getSnapshot,
    networkManager.getSnapshot,   // server snapshot (SSR fallback)
  );
}
