/**
 * ────────────────────────────────────────────────────────
 *  privacy.ts — Types para GDPR/privacidad
 * ────────────────────────────────────────────────────────
 */

export interface ConsentStatus {
  analyticsConsent: boolean;
  marketingConsent: boolean;
  locationTracking: boolean;
  dataSharingPartners: boolean;
  lastUpdated: string;
}

export interface ConsentUpdateRequest {
  analyticsConsent?: boolean;
  marketingConsent?: boolean;
  locationTracking?: boolean;
  dataSharingPartners?: boolean;
}

export interface DataExportResponse {
  requestId: string;
  status: string;
  requestedAt: string;
  estimatedCompletionAt: string;
}
