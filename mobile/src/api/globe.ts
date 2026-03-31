import { apiClient } from "./client";
import type { CountryStats } from "@/types/globe";

// ── Globe API ───────────────────────────────────────

interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

/**
 * Fetch country statistics for the 3D globe.
 * Returns student counts and university info per country.
 */
export async function fetchCountryStats(): Promise<CountryStats[]> {
  const { data } = await apiClient.get<ApiResponse<CountryStats[]>>(
    "/v1/globe/stats"
  );
  return data.data;
}
