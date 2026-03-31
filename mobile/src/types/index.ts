export type {
  User,
  UniversitySummary,
  InterestSummary,
  UserLanguageSummary,
  UserPhotoResponse,
  UserUpdateRequest,
  UserLanguageRequest,
  LocationUpdateRequest,
  Interest,
  Language,
  University,
  BlockedUser,
} from "./user";
export type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  MessageResponse,
} from "./auth";
export type {
  UserSearchRequest,
  NearbyUserResponse,
  PageResponse,
  FriendRequestResponse,
  FriendRequestStatus,
  DiscoverFilters,
  DiscoverStackParamList,
} from "./discover";
export type {
  UniversityInfo,
  CountryStats,
  CountryPin,
  GlobeStackParamList,
} from "./globe";
export type {
  MessageData,
  MessageType,
  ConversationData,
  SendMessagePayload,
  TypingEvent,
  ChatStackParamList,
} from "./chat";
export type {
  EventData,
  EventCreateRequest,
  EventParticipant,
  EventsStackParamList,
} from "./events";
export type {
  StoryData,
  UserStories,
} from "./stories";
export type {
  NotificationType,
  NotificationData,
} from "./notifications";
export type {
  GroupMember,
  GroupData,
  GroupMessageData,
  CreateGroupRequest,
  SendGroupMessagePayload,
  GroupsStackParamList,
} from "./groups";
export type {
  CommunityCategory,
  CommunityMemberPreview,
  CommunityData,
  CommunityCommentData,
  CommunityPostData,
  CreatePostRequest,
  CreateCommentRequest,
  CommunitiesStackParamList,
} from "./communities";

// ── Navigation types ────────────────────────────────

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
};

export type MainTabParamList = {
  Discover: undefined;
  Globe: undefined;
  Events: undefined;
  Chat: undefined;
  Groups: undefined;
  Communities: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  EditPhotos: undefined;
  Interests: undefined;
  Languages: undefined;
  ViewProfile: { userId: number };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  PrivacySettings: undefined;
  NotificationSettings: undefined;
  BlockedUsers: undefined;
  DeleteAccount: undefined;
};

export type DrawerParamList = {
  HomeTabs: undefined;
  Settings: undefined;
  About: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
