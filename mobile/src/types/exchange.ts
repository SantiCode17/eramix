// ── Language Exchange Types ─────────────────────────

export interface LanguageInfo {
  languageId: number;
  languageName: string;
  proficiencyLevel: string;
}

export interface ExchangePartner {
  userId: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  destinationCity: string | null;
  averageRating: number | null;
  sessionsCompleted: number;
  teaches: LanguageInfo[];
  learns: LanguageInfo[];
}

export interface ExchangeRequest {
  id: number;
  requesterId: number;
  requesterFirstName: string;
  requesterLastName: string;
  requesterProfilePhotoUrl: string | null;
  targetId: number;
  targetFirstName: string;
  targetLastName: string;
  targetProfilePhotoUrl: string | null;
  offerLanguageId: number;
  offerLanguageName: string;
  wantLanguageId: number;
  wantLanguageName: string;
  message: string | null;
  status: string;
  createdAt: string;
}

export interface ExchangeSession {
  id: number;
  requestId: number;
  userAId: number;
  userAFirstName: string;
  userALastName: string;
  userAProfilePhotoUrl: string | null;
  userBId: number;
  userBFirstName: string;
  userBLastName: string;
  userBProfilePhotoUrl: string | null;
  offerLanguageName: string;
  wantLanguageName: string;
  scheduledAt: string | null;
  durationMinutes: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface ExchangeReview {
  id: number;
  sessionId: number;
  reviewerId: number;
  reviewerFirstName: string;
  reviewerLastName: string;
  revieweeId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export type ExchangeStackParamList = {
  ExchangeHome: undefined;
  FindPartner: undefined;
  ExchangeRequests: undefined;
  ExchangeSessionDetail: { sessionId: number };
};
