/**
 * ────────────────────────────────────────────────────────
 *  ocrService.ts — API para escáner OCR
 * ────────────────────────────────────────────────────────
 */

import { apiClient } from "./client";
import type { OcrScanResult } from "@/types/ocr";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Scan ────────────────────────────────────────────

export async function scanDocument(
  imageBase64: string,
  documentType?: string,
): Promise<OcrScanResult> {
  const { data } = await apiClient.post<ApiResponse<OcrScanResult>>(
    "/v1/ocr/scan",
    { imageBase64, documentType },
  );
  return data.data;
}

// ── History ─────────────────────────────────────────

export async function getScanHistory(): Promise<OcrScanResult[]> {
  const { data } = await apiClient.get<ApiResponse<OcrScanResult[]>>(
    "/v1/ocr/scans",
  );
  return data.data;
}

export const ocrApi = {
  scanDocument,
  getScanHistory,
};
