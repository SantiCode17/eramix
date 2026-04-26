/**
 * ────────────────────────────────────────────────────────
 *  privacyService.ts — API para GDPR/privacidad
 * ────────────────────────────────────────────────────────
 */

import { apiClient } from "./client";
import type {
  ConsentStatus,
  ConsentUpdateRequest,
  DataExportResponse,
} from "@/types/privacy";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Consents ────────────────────────────────────────

export async function getConsentStatus(): Promise<ConsentStatus> {
  const { data } = await apiClient.get<ApiResponse<ConsentStatus>>(
    "/v1/privacy/consents",
  );
  return data.data;
}

export async function updateConsents(
  body: ConsentUpdateRequest,
): Promise<ConsentStatus> {
  const { data } = await apiClient.put<ApiResponse<ConsentStatus>>(
    "/v1/privacy/consents",
    body,
  );
  return data.data;
}

// ── Data Export ─────────────────────────────────────

export async function requestDataExport(): Promise<DataExportResponse> {
  const { data } = await apiClient.post<ApiResponse<DataExportResponse>>(
    "/v1/privacy/data-export",
  );
  return data.data;
}

// ── Delete Account ──────────────────────────────────

export async function requestAccountDeletion(): Promise<void> {
  await apiClient.delete("/v1/privacy/account");
}

export const privacyApi = {
  getConsentStatus,
  updateConsents,
  requestDataExport,
  requestAccountDeletion,
};
