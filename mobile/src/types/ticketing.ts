/**
 * ────────────────────────────────────────────────────────
 *  ticketing.ts — Types para ticketing cripto
 * ────────────────────────────────────────────────────────
 */

export interface TicketListing {
  id: number;
  organizerId: number;
  eventTitle: string;
  description: string;
  venue: string;
  eventDate: string;
  pricePerTicket: number;
  currency: string;
  totalTickets: number;
  remainingTickets: number;
  imageUrl: string;
  createdAt: string;
}

export interface CryptographicTicket {
  id: number;
  ticketListingId: number;
  eventTitle: string;
  ticketCode: string;
  qrPayload: string;
  isRedeemed: boolean;
  purchasedAt: string;
}

export interface ValidateTicketResponse {
  valid: boolean;
  eventTitle: string;
  ticketCode: string;
  holderName: string;
  message: string;
}

export interface CreateTicketListingRequest {
  eventTitle: string;
  description: string;
  venue: string;
  eventDate: string;
  pricePerTicket: number;
  currency: string;
  totalTickets: number;
  imageUrl?: string;
}

export type TicketingStackParamList = {
  TicketingHome: undefined;
  TicketDetail: { ticketId: number };
  PurchaseTicket: { listingId: number };
  MyTickets: undefined;
  ScanTicket: undefined;
};
