// ── Event Types ─────────────────────────────────────

export interface EventData {
  id: number;
  creatorId: number;
  creatorFirstName: string;
  creatorLastName: string;
  creatorProfilePhotoUrl: string | null;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  startDatetime: string;
  endDatetime: string | null;
  maxParticipants: number | null;
  isPublic: boolean;
  participantCount: number;
  currentUserStatus: string | null; // "GOING" | "INTERESTED" | null
  createdAt: string;
  coverImageUrl?: string | null;
}

export interface EventCreateRequest {
  title: string;
  description?: string;
  category?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  startDatetime: string;
  endDatetime?: string;
  maxParticipants?: number;
  isPublic?: boolean;
  coverImageUrl?: string;
}

export interface EventParticipant {
  userId: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  status: string;
  joinedAt: string;
}

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { eventId: number };
  CreateEvent: undefined;
};
