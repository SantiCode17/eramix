// ── Community Types ─────────────────────────────────

export type CommunityCategory = "UNIVERSITY" | "CITY" | "INTEREST" | "GENERAL";

export interface CommunityMemberPreview {
  userId: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
}

export interface CommunityData {
  id: number;
  name: string;
  description: string | null;
  category: CommunityCategory;
  coverImageUrl: string | null;
  isPublic: boolean;
  memberCount: number;
  createdAt: string;
  currentUserRole: string | null;
  isMember: boolean;
  membersPreview: CommunityMemberPreview[];
}

export interface CommunityCommentData {
  id: number;
  postId: number;
  authorId: number;
  authorFirstName: string;
  authorLastName: string;
  authorProfilePhotoUrl: string | null;
  content: string;
  createdAt: string;
}

export interface CommunityPostData {
  id: number;
  communityId: number;
  authorId: number;
  authorFirstName: string;
  authorLastName: string;
  authorProfilePhotoUrl: string | null;
  content: string;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  likedByCurrentUser: boolean;
  createdAt: string;
  recentComments: CommunityCommentData[];
}

export interface CreatePostRequest {
  content: string;
  imageUrl?: string;
}

export interface CreateCommentRequest {
  content: string;
}

export type CommunitiesStackParamList = {
  CommunitiesList: undefined;
  CommunityFeed: { communityId: number; communityName: string };
  CreateCommunity: undefined;
  CreateCommunityPost: { communityId: number };
  CommunityMembers: { communityId: number };
  CommunityPostComments: { communityId: number; postParam: CommunityPostData };
};
