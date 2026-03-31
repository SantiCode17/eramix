export interface Challenge {
  id: number;
  title: string;
  description: string;
  emoji: string;
  startDate: string;
  endDate: string;
  active: boolean;
  creatorFirstName: string;
  creatorLastName: string;
  submissionCount: number;
}

export interface ChallengeSubmission {
  id: number;
  challengeId: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  userProfilePhotoUrl: string | null;
  photoUrl: string;
  caption: string | null;
  voteCount: number;
  votedByMe: boolean;
  createdAt: string;
}

export type ChallengesStackParamList = {
  ChallengesList: undefined;
  ChallengeDetail: { challengeId: number };
};
