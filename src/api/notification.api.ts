import apiClient from "./client";
import { ApiResponse, UserNotification, PaginatedResponse } from "../types";

export interface NotificationStats {
  sentToday: number;
  failed: number;
  pending: number;
  totalUnread: number;
}

export const notificationAPI = {
  getAll: (params?: { page?: number; limit?: number; type?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<UserNotification>>>(
      "/notifications",
      { params },
    ),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>(
      "/notifications/unread-count",
    ),

  getStats: () =>
    apiClient.get<ApiResponse<NotificationStats>>("/notifications/stats"),

  markRead: (id: string) =>
    apiClient.patch<ApiResponse<null>>(`/notifications/${id}/read`),

  markOpened: (id: string) =>
    apiClient.patch<ApiResponse<null>>(`/notifications/${id}/opened`),

  markAllRead: () =>
    apiClient.patch<ApiResponse<null>>("/notifications/mark-all-read"),

  deleteNotification: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/notifications/${id}`),

  broadcast: (data: {
    title: string;
    message: string;
    type: string;
    targetType: string;
    targetUserId?: string;
  }) => apiClient.post<ApiResponse<unknown>>("/notifications/broadcast", data),
};
