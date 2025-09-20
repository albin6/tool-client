import { apiClient } from "./client";
import {
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
  OTPVerification,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  User,
} from "@/types/auth";

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/login", credentials);
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/signup", credentials);
  },

  async verifyOTP(data: OTPVerification): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/verify-otp", data);
  },

  async resendOTP(email: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/resend-otp", { email });
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/forgot-password", data);
  },

  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/reset-password", data);
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>("/auth/me");
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
  },

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem("refreshToken");
    return apiClient.post<AuthResponse>("/auth/refresh", { refreshToken });
  },
};
