import { apiClient } from "./client";
import type { Challenge, ChallengeSubmission } from "@/types/challenges";

export async function getActiveChallenges(): Promise<Challenge[]> {
  const { data } = await apiClient.get("/challenges");
  return data.data;
}

export async function createChallenge(req: {
  title: string; description: string; emoji?: string; startDate: string; endDate: string;
}): Promise<Challenge> {
  const { data } = await apiClient.post("/challenges", req);
  return data.data;
}

export async function submitPhoto(challengeId: number, req: {
  photoUrl: string; caption?: string;
}): Promise<ChallengeSubmission> {
  const { data } = await apiClient.post(`/challenges/${challengeId}/submissions`, req);
  return data.data;
}

export async function getSubmissions(challengeId: number): Promise<ChallengeSubmission[]> {
  const { data } = await apiClient.get(`/challenges/${challengeId}/submissions`);
  return data.data;
}

export async function voteSubmission(submissionId: number): Promise<void> {
  await apiClient.post(`/challenges/submissions/${submissionId}/vote`);
}
