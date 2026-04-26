/**
 * ════════════════════════════════════════════════════
 *  useDebounce — Delay-emit hook for search inputs
 * ════════════════════════════════════════════════════
 */

import { useState, useEffect } from "react";
import { NETWORK } from "@/config/env";

/**
 * Returns a debounced version of `value`.
 * @param value  The raw input value
 * @param delay  Delay in ms (default: NETWORK.searchDebounce = 500)
 */
export function useDebounce<T>(value: T, delay: number = NETWORK.searchDebounce): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
