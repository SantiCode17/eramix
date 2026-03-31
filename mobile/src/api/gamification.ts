import { apiClient } from "./client";
import type { Achievement, UserProgress, LeaderboardEntry } from "@/types/gamification";

export async function getProgress(): Promise<UserProgress> {
  const { data } = await apiClient.get("/gamification/progress");
  return data.data;
}

export async function getAchievements(): Promise<Achievement[]> {
  const { data } = await apiClient.get("/gamification/achievements");
  return data.data;
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { data } = await apiClient.get("/gamification/leaderboard", { params: { limit } });
  return data.data;
}
