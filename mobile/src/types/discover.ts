// ── Discover & Search types matching backend DTOs ───

export interface UserSearchRequest {
  destinationCity?: string;
  destinationCountry?: string;
  universityId?: number;
  radiusKm?: number;
  latitude?: number;
  longitude?: number;
  page?: number;
  size?: number;
}

export interface NearbyUserResponse {
  id: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  destinationCity?: string;
  destinationCountry?: string;
  distanceKm: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type FriendRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface FriendRequestResponse {
  id: number;
  senderId: number;
  senderFirstName: string;
  senderLastName: string;
  senderProfilePhotoUrl?: string;
  receiverId: number;
  receiverFirstName: string;
  receiverLastName: string;
  receiverProfilePhotoUrl?: string;
  status: FriendRequestStatus;
  createdAt: string;
}

// ── Discover filter state ───────────────────────────

export interface DiscoverFilters {
  destinationCity?: string;
  destinationCountry?: string;
  universityId?: number;
  radiusKm: number;
  interestIds: number[];
  languageIds: number[];
}

// ── Navigation ──────────────────────────────────────

export type DiscoverStackParamList = {
  DiscoverMain: undefined;
  NearbyMap: undefined;
  FriendRequests: undefined;
  UserDetail: { userId: number };
};
