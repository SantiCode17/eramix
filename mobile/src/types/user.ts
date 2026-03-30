// ── User types matching backend DTOs ─────────────────

export interface UniversitySummary {
  id: number;
  name: string;
  city: string;
  country: string;
}

export interface InterestSummary {
  id: number;
  name: string;
  category: string;
  icon?: string;
}

export interface UserLanguageSummary {
  id: number;
  code: string;
  name: string;
  proficiencyLevel: string;
}

export interface UserPhotoResponse {
  id: number;
  photoUrl: string;
  displayOrder: number;
  createdAt: string;
}

// ── Update request types ─────────────────────────────

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  homeUniversityId?: number;
  hostUniversityId?: number;
  destinationCity?: string;
  destinationCountry?: string;
  mobilityStartDate?: string;
  mobilityEndDate?: string;
  interestIds?: number[];
  languages?: UserLanguageRequest[];
}

export interface UserLanguageRequest {
  languageId: number;
  proficiencyLevel: string;
}

export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
}

// ── Catalog types ────────────────────────────────────

export interface Interest {
  id: number;
  name: string;
  category: string;
  emoji?: string;
}

export interface Language {
  id: number;
  code: string;
  name: string;
}

export interface University {
  id: number;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

// ── Social types ─────────────────────────────────────

export interface BlockedUser {
  id: number;
  senderId: number;
  senderFirstName: string;
  senderLastName: string;
  senderProfilePhotoUrl?: string;
  receiverId: number;
  receiverFirstName: string;
  receiverLastName: string;
  receiverProfilePhotoUrl?: string;
  status: string;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  profilePhotoUrl?: string;
  dateOfBirth: string;
  bio?: string;
  homeUniversity?: UniversitySummary;
  hostUniversity?: UniversitySummary;
  destinationCity?: string;
  destinationCountry?: string;
  mobilityStartDate?: string;
  mobilityEndDate?: string;
  latitude?: number;
  longitude?: number;
  locationUpdatedAt?: string;
  isActive?: boolean;
  isVerified?: boolean;
  lastSeen?: string;
  createdAt?: string;
  interests?: InterestSummary[];
  languages?: UserLanguageSummary[];
  photos?: UserPhotoResponse[];
  friendCount?: number;
  eventCount?: number;
}
