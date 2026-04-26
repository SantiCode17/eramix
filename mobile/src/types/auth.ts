import type { User } from "./user";

// ── Request DTOs ────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date: "2000-01-15"
  homeUniversityId?: number;
  hostUniversityId?: number;
  destinationCity?: string;
  destinationCountry?: string;
  mobilityStartDate?: string;
  mobilityEndDate?: string;
  degree?: string;
  gender?: string;
  lookingForGender?: string;
  showGenderOnProfile?: boolean;
  notificationsEnabled?: boolean;
  intentions?: string[];
  languages?: { languageId: number; proficiencyLevel: string }[];
  interestIds?: number[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ── Response DTOs ───────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface MessageResponse {
  message: string;
}
