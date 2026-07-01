import apiClient from "./client";
import { ApiResponse, User } from "../types";

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface SendOTPResponse {
  expiresIn: number;
  /** Only present when USE_DEV_OTP=true or NODE_ENV=development */
  devOtp?: string;
}

export const authAPI = {
  adminLogin: (data: { mobile: string; password: string }) =>
    apiClient.post<ApiResponse<LoginResponse>>("/auth/admin/login", data),

  sendOTP: (data: { mobile: string }) =>
    apiClient.post<ApiResponse<SendOTPResponse>>("/auth/otp/send", data),

  verifyOTP: (data: { mobile: string; otp: string }) =>
    apiClient.post<ApiResponse<LoginResponse>>("/auth/otp/verify", data),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      "/auth/token/refresh",
      { refreshToken },
    ),

  getMe: () => apiClient.get<ApiResponse<User>>("/auth/me"),

  updateMe: (data: { name: string; address?: string }) =>
    apiClient.patch<ApiResponse<User>>("/auth/me", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.patch<ApiResponse<null>>("/auth/password", data),

  updateFCMToken: (fcmToken: string) =>
    apiClient.patch<ApiResponse<null>>("/auth/fcm-token", { fcmToken }),
};
