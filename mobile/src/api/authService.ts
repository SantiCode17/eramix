import { apiClient } from "./client";
import type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  MessageResponse,
} from "@/types";

const AUTH_PATH = "/v1/auth";

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>(`${AUTH_PATH}/login`, data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>(`${AUTH_PATH}/register`, data);
    return res.data;
  },

  refresh: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>(`${AUTH_PATH}/refresh`, data);
    return res.data;
  },

  logout: async (data: RefreshTokenRequest): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>(`${AUTH_PATH}/logout`, data);
    return res.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>(`${AUTH_PATH}/forgot-password`, data);
    return res.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    const res = await apiClient.post<MessageResponse>(`${AUTH_PATH}/reset-password`, data);
    return res.data;
  },
};
