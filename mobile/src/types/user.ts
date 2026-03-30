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
  languageId: number;
  languageName: string;
  level: string;
}

export interface UserPhotoResponse {
  id: number;
  photoUrl: string;
  position: number;
  uploadedAt: string;
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
