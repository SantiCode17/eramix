import { apiClient } from "./client";

export interface SmartMatchUser {
  id: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  destinationCity: string;
  destinationCountry: string;
  bio: string | null;
  compatibilityScore: number;
  sharedInterests: string[];
  sharedLanguages: string[];
}

export interface ActivityFeedItem {
  id: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  userProfilePhotoUrl: string | null;
  type: 'ACHIEVEMENT' | 'EVENT_JOIN' | 'FRIEND_ADD' | 'STORY' | 'POST' | 'LEVEL_UP';
  title: string;
  body: string;
  data: string | null;
  createdAt: string;
}

export interface ErasmusCountdown {
  mobilityStart: string;
  mobilityEnd: string;
  destinationCity: string;
  destinationCountry: string;
  daysUntilStart: number;
  daysUntilEnd: number;
  isActive: boolean;
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  category: 'DOCUMENTS' | 'HOUSING' | 'TRAVEL' | 'SOCIAL' | 'UNIVERSITY';
}

// ── Smart Matching ──────────────────────────────────

export const smartMatchApi = {
  /** GET /v1/users/smart-match — AI friend suggestions */
  getSuggestions: async (limit = 10): Promise<SmartMatchUser[]> => {
    const { data } = await apiClient.get("/v1/users/smart-match", {
      params: { limit },
    });
    return data.data;
  },

  /** POST /v1/users/smart-match/:id/like */
  likeSuggestion: async (userId: number): Promise<void> => {
    await apiClient.post(`/v1/users/smart-match/${userId}/like`);
  },

  /** POST /v1/users/smart-match/:id/skip */
  skipSuggestion: async (userId: number): Promise<void> => {
    await apiClient.post(`/v1/users/smart-match/${userId}/skip`);
  },
};

// ── Activity Feed ───────────────────────────────────

export const activityFeedApi = {
  /** GET /v1/stories/feed — Social activity feed (stories from friends) */
  getFeed: async (page = 0, size = 20): Promise<ActivityFeedItem[]> => {
    const { data } = await apiClient.get("/v1/stories/feed", {
      params: { page, size },
    });
    return data.data?.content ?? data.data ?? [];
  },
};

// ── Erasmus Countdown ───────────────────────────────

export const countdownApi = {
  /** GET /v1/users/me/countdown */
  getCountdown: async (): Promise<ErasmusCountdown> => {
    const { data } = await apiClient.get("/v1/users/me/countdown");
    return data.data;
  },

  /** PUT /v1/users/me/checklist/:itemId */
  toggleChecklistItem: async (itemId: string, completed: boolean): Promise<void> => {
    await apiClient.put(`/v1/users/me/checklist/${itemId}`, { completed });
  },
};

// ── Translation ─────────────────────────────────────

export const translationApi = {
  /** POST /v1/translate */
  translate: async (text: string, targetLang: string): Promise<string> => {
    const { data } = await apiClient.post("/v1/translate", {
      text,
      targetLanguage: targetLang,
    });
    return data.data?.translatedText ?? text;
  },
};

// ── User Badges (from Part IV backend) ──────────────

export const badgesApi = {
  /** GET /v1/users/me/badges */
  getMyBadges: async () => {
    const { data } = await apiClient.get("/v1/users/me/badges");
    return data.data;
  },

  /** GET /v1/users/me/progress */
  getMyProgress: async () => {
    const { data } = await apiClient.get("/v1/users/me/progress");
    return data.data;
  },
};

// ── Voice Messages ──────────────────────────────────

export const voiceMessageApi = {
  /** POST /v1/chat/voice — Upload voice message */
  sendVoiceMessage: async (
    conversationId: number,
    audioBlob: Blob
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("audio", audioBlob);
    formData.append("conversationId", String(conversationId));
    await apiClient.post("/v1/chat/voice", formData);
  },
};

// ── Cultural Map ────────────────────────────────────

export interface CulturalPOI {
  id: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  address: string;
  tags: string[];
}

export const culturalMapApi = {
  /** GET /v1/cultural-map/pois */
  getPOIs: async (
    lat: number,
    lng: number,
    radiusKm = 5,
    category?: string
  ): Promise<CulturalPOI[]> => {
    const { data } = await apiClient.get("/v1/cultural-map/pois", {
      params: { lat, lng, radiusKm, category },
    });
    return data.data ?? [];
  },

  /** POST /v1/cultural-map/pois/:id/favorite */
  toggleFavorite: async (poiId: number): Promise<void> => {
    await apiClient.post(`/v1/cultural-map/pois/${poiId}/favorite`);
  },
};

// ── Time Capsule ────────────────────────────────────

export interface TimeCapsuleData {
  id: number;
  message: string;
  mood: string;
  createdAt: string;
  revealAt: string;
  isRevealed: boolean;
}

export const timeCapsuleApi = {
  /** GET /v1/time-capsules */
  getCapsules: async (): Promise<TimeCapsuleData[]> => {
    const { data } = await apiClient.get("/v1/time-capsules");
    return data.data ?? [];
  },

  /** POST /v1/time-capsules */
  createCapsule: async (payload: {
    message: string;
    mood: string;
    revealAt: string;
  }): Promise<TimeCapsuleData> => {
    const { data } = await apiClient.post("/v1/time-capsules", payload);
    return data.data;
  },
};

// ── Erasmus Passport ────────────────────────────────

export interface PassportStamp {
  id: number;
  country: string;
  city: string;
  flag: string;
  date: string;
  type: string;
  description: string;
  isCollected: boolean;
  xpReward: number;
}

export const passportApi = {
  /** GET /v1/passport/stamps */
  getStamps: async (): Promise<PassportStamp[]> => {
    const { data } = await apiClient.get("/v1/passport/stamps");
    return data.data ?? [];
  },

  /** POST /v1/passport/stamps/:id/collect */
  collectStamp: async (stampId: number): Promise<void> => {
    await apiClient.post(`/v1/passport/stamps/${stampId}/collect`);
  },
};

// ── Live Location ───────────────────────────────────

export const liveLocationApi = {
  /** POST /v1/location/share — Start sharing location */
  startSharing: async (durationMinutes: number): Promise<void> => {
    await apiClient.post("/v1/location/share", { durationMinutes });
  },

  /** DELETE /v1/location/share — Stop sharing */
  stopSharing: async (): Promise<void> => {
    await apiClient.delete("/v1/location/share");
  },

  /** GET /v1/location/nearby — Get friends sharing their location */
  getNearbyFriends: async () => {
    const { data } = await apiClient.get("/v1/location/nearby");
    return data.data ?? [];
  },
};

// ── Daily Streaks ───────────────────────────────────

export interface DailyChallenge {
  id: number;
  title: string;
  description: string;
  xpReward: number;
  type: string;
  progress: number;
  target: number;
  completed: boolean;
}

export const dailyStreaksApi = {
  /** GET /v1/daily/challenges */
  getChallenges: async (): Promise<DailyChallenge[]> => {
    const { data } = await apiClient.get("/v1/daily/challenges");
    return data.data ?? [];
  },

  /** POST /v1/daily/claim-streak */
  claimStreak: async (): Promise<{ streakDays: number; xpAwarded: number }> => {
    const { data } = await apiClient.post("/v1/daily/claim-streak");
    return data.data;
  },

  /** GET /v1/daily/streak-info */
  getStreakInfo: async (): Promise<{
    currentStreak: number;
    longestStreak: number;
    lastClaimDate: string;
  }> => {
    const { data } = await apiClient.get("/v1/daily/streak-info");
    return data.data;
  },
};
