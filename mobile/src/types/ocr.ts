/**
 * ────────────────────────────────────────────────────────
 *  ocr.ts — Types para escáner OCR
 * ────────────────────────────────────────────────────────
 */

export interface ExtractedField {
  key: string;
  value: string;
}

export interface OcrScanResult {
  id: number;
  documentType: string;
  rawText: string;
  confidenceScore: number;
  extractedFields: ExtractedField[];
  createdAt: string;
}

export type OcrStackParamList = {
  OcrHome: undefined;
  ScanResult: { scanId: number };
  ScanHistory: undefined;
};
