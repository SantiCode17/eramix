/**
 * useDebouncedSearch — Hook para búsqueda con debounce
 */
import { useState, useEffect, useRef } from "react";

export function useDebouncedSearch(delay = 400) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, delay]);

  const clear = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  return { query, debouncedQuery, setQuery, clear };
}
