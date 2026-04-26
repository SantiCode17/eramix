/**
 * ════════════════════════════════════════════════════
 *  useLoadingTimeout — Hook para timeout de loading states
 *  Después de `timeout` ms, marca como timed out.
 * ════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef } from "react";

/**
 * Returns true if `isLoading` has been true for longer than `timeout` ms.
 * Resets when `isLoading` becomes false.
 */
export function useLoadingTimeout(isLoading: boolean, timeout: number = 8000): boolean {
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      timerRef.current = setTimeout(() => {
        setTimedOut(true);
      }, timeout);
    } else {
      setTimedOut(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isLoading, timeout]);

  return timedOut;
}
