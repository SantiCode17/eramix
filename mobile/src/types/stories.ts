// ── Story Types ──────────────────────────────────────

export interface StoryData {
  id: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  userProfilePhotoUrl: string | null;
  mediaUrl: string;
  caption: string | null;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  viewedByCurrentUser: boolean;
}

/** Grouped stories by user for the stories bar */
export interface UserStories {
  userId: number;
  userName: string;
  userPhoto: string | null;
  stories: StoryData[];
  hasUnviewed: boolean;
}
