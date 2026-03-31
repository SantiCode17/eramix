export interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  emoji: string;
  xpReward: number;
  category: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface UserProgress {
  level: number;
  currentXp: number;
  totalXp: number;
  xpToNextLevel: number;
  progressPercent: number;
  achievementsUnlocked: number;
  totalAchievements: number;
}

export interface LeaderboardEntry {
  userId: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  level: number;
  totalXp: number;
  rank: number;
}

export type GamificationStackParamList = {
  GamificationHome: undefined;
  Achievements: undefined;
  Leaderboard: undefined;
};
