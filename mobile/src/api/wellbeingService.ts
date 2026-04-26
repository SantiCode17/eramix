/**
 * ────────────────────────────────────────────────────────
 *  wellbeingService.ts — API para bienestar y SOS
 * ────────────────────────────────────────────────────────
 */

import { apiClient } from "./client";
import type {
  WellbeingCheckin,
  WellbeingSummary,
  EmergencyContact,
  SOSActivation,
} from "@/types/wellbeing";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Check-ins ───────────────────────────────────────

export async function createCheckin(
  moodScore: number,
): Promise<WellbeingCheckin> {
  const { data } = await apiClient.post<ApiResponse<WellbeingCheckin>>(
    "/v1/wellbeing/checkin",
    { moodScore },
  );
  return data.data;
}

export async function getCheckins(): Promise<WellbeingCheckin[]> {
  const { data } = await apiClient.get<ApiResponse<WellbeingCheckin[]>>(
    "/v1/wellbeing/checkins",
  );
  return data.data;
}

// ── Summary ─────────────────────────────────────────

export async function getWellbeingSummary(): Promise<WellbeingSummary> {
  const { data } = await apiClient.get<ApiResponse<WellbeingSummary>>(
    "/v1/wellbeing/summary",
  );
  return data.data;
}

// ── SOS ─────────────────────────────────────────────

export async function activateSOS(
  activationType: string,
  countryCode: string,
): Promise<SOSActivation> {
  const { data } = await apiClient.post<ApiResponse<SOSActivation>>(
    "/v1/wellbeing/sos",
    { activationType, countryCode },
  );
  return data.data;
}

// ── Emergency Contacts ──────────────────────────────

export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  const { data } = await apiClient.get<ApiResponse<EmergencyContact[]>>(
    "/v1/wellbeing/emergency-contacts",
  );
  return data.data;
}

export async function addEmergencyContact(body: {
  name: string;
  phoneNumber: string;
  relationship: string;
}): Promise<EmergencyContact> {
  const { data } = await apiClient.post<ApiResponse<EmergencyContact>>(
    "/v1/wellbeing/emergency-contacts",
    body,
  );
  return data.data;
}

export async function deleteEmergencyContact(
  contactId: number,
): Promise<void> {
  await apiClient.delete(`/v1/wellbeing/emergency-contacts/${contactId}`);
}

export const wellbeingApi = {
  createCheckin,
  getCheckins,
  getWellbeingSummary,
  activateSOS,
  getEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
};
