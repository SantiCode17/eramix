// ── Group Chat Types ────────────────────────────────

export interface GroupMember {
  userId: number;
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
}

export interface GroupData {
  id: number;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  creatorId: number;
  maxMembers: number;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  members: GroupMember[];
}

export interface GroupMessageData {
  id: number;
  groupId: number;
  senderId: number;
  senderFirstName: string;
  senderLastName: string;
  senderProfilePhotoUrl: string | null;
  content: string;
  type: "TEXT" | "IMAGE" | "AUDIO" | "LOCATION";
  mediaUrl: string | null;
  createdAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  avatarUrl?: string;
  memberIds: number[];
}

export interface SendGroupMessagePayload {
  groupId: number;
  content: string;
  type?: "TEXT" | "IMAGE" | "LOCATION";
  mediaUrl?: string;
}

export type GroupsStackParamList = {
  GroupsList: undefined;
  GroupChat: { groupId: number; groupName: string };
  CreateGroup: undefined;
  GroupSettings: { groupId: number };
  VoiceMessage: { conversationId: number };
};
