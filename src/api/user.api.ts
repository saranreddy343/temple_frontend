import apiClient from "./client";
import { ApiResponse, User, PaginatedResponse } from "../types";

interface UserFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const userAPI = {
  getAll: (params?: UserFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<User>>>("/users", { params }),

  getById: (id: string) => apiClient.get<ApiResponse<User>>(`/users/${id}`),

  create: (data: { name: string; mobile: string; address?: string }) =>
    apiClient.post<ApiResponse<User>>("/users", data),

  update: (
    id: string,
    data: Partial<{ name: string; mobile: string; address: string; isActive: boolean }>,
  ) => apiClient.put<ApiResponse<User>>(`/users/${id}`, data),

  deactivate: (id: string) =>
    apiClient.delete<ApiResponse<null>>(`/users/${id}`),
};
