/**
 * ────────────────────────────────────────────────────────
 *  ticketingService.ts — API para ticketing cripto
 * ────────────────────────────────────────────────────────
 */

import { apiClient } from "./client";
import type {
  TicketListing,
  CryptographicTicket,
  ValidateTicketResponse,
} from "@/types/ticketing";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Listings ────────────────────────────────────────

export async function getTicketListings(): Promise<TicketListing[]> {
  const { data } = await apiClient.get<ApiResponse<TicketListing[]>>(
    "/v1/tickets/listings",
  );
  return data.data;
}

// ── Purchase ────────────────────────────────────────

export async function purchaseTicket(
  listingId: number,
): Promise<CryptographicTicket> {
  const { data } = await apiClient.post<ApiResponse<CryptographicTicket>>(
    `/v1/tickets/${listingId}/purchase`,
  );
  return data.data;
}

// ── My Tickets ──────────────────────────────────────

export async function getMyTickets(): Promise<CryptographicTicket[]> {
  const { data } = await apiClient.get<ApiResponse<CryptographicTicket[]>>(
    "/v1/tickets/my-tickets",
  );
  return data.data;
}

// ── QR Code ─────────────────────────────────────────

export async function getTicketQR(ticketId: number): Promise<string> {
  const { data } = await apiClient.get<ApiResponse<string>>(
    `/v1/tickets/${ticketId}/qr`,
  );
  return data.data;
}

// ── Validation ──────────────────────────────────────

export async function validateTicket(
  ticketCode: string,
  totpCode: string,
): Promise<ValidateTicketResponse> {
  const { data } = await apiClient.post<ApiResponse<ValidateTicketResponse>>(
    "/v1/tickets/validate",
    { ticketCode, totpCode },
  );
  return data.data;
}

export const ticketingApi = {
  getTicketListings,
  purchaseTicket,
  getMyTickets,
  getTicketQR,
  validateTicket,
};
