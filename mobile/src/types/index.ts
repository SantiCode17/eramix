export type { User, UniversitySummary, InterestSummary, UserLanguageSummary, UserPhotoResponse } from "./user";
export type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  MessageResponse,
} from "./auth";

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
  Events: undefined;
  Chat: undefined;
  Notifications: undefined;
  Profile: undefined;
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
