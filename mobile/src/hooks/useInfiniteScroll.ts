/**
 * useInfiniteScroll — Hook para paginación infinita con backend real
 */
import { useState, useCallback, useRef } from "react";

interface UseInfiniteScrollOptions<T> {
  /** Función que carga datos de una página */
  fetchPage: (page: number, size: number) => Promise<{
    content: T[];
    totalPages: number;
    totalElements: number;
    last: boolean;
  }>;
  /** Tamaño de página (default: 20) */
  pageSize?: number;
}

interface UseInfiniteScrollReturn<T> {
  data: T[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  totalElements: number;
  loadInitial: () => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useInfiniteScroll<T>(
  options: UseInfiniteScrollOptions<T>,
): UseInfiniteScrollReturn<T> {
  const { fetchPage, pageSize = 20 } = options;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  const pageRef = useRef(0);
  const isLoadingRef = useRef(false);

  const loadInitial = useCallback(async () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchPage(0, pageSize);
      setData(result.content);
      setHasMore(!result.last);
      setTotalElements(result.totalElements);
      pageRef.current = 0;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [fetchPage, pageSize]);

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;
    isLoadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextPage = pageRef.current + 1;
      const result = await fetchPage(nextPage, pageSize);
      setData((prev) => [...prev, ...result.content]);
      setHasMore(!result.last);
      setTotalElements(result.totalElements);
      pageRef.current = nextPage;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar más");
    } finally {
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [fetchPage, pageSize, hasMore]);

  const refresh = useCallback(async () => {
    isLoadingRef.current = true;
    setIsRefreshing(true);
    setError(null);

    try {
      const result = await fetchPage(0, pageSize);
      setData(result.content);
      setHasMore(!result.last);
      setTotalElements(result.totalElements);
      pageRef.current = 0;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al refrescar");
    } finally {
      setIsRefreshing(false);
      isLoadingRef.current = false;
    }
  }, [fetchPage, pageSize]);

  return {
    data,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    hasMore,
    totalElements,
    loadInitial,
    loadMore,
    refresh,
  };
}
