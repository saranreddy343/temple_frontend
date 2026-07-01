import apiClient from "./client";
import {
  ApiResponse,
  AdminDashboardStats,
  BorrowerDashboardStats,
} from "../types";

interface DistributionData {
  status: string;
  count: string;
  totalAmount: string;
}

interface ExpenseTrendData {
  category: string;
  total: string;
  count: string;
}

export const dashboardAPI = {
  getAdminStats: () =>
    apiClient.get<ApiResponse<AdminDashboardStats>>("/dashboard/admin/stats"),

  getBorrowerStats: () =>
    apiClient.get<ApiResponse<BorrowerDashboardStats>>(
      "/dashboard/borrower/stats",
    ),

  getLoanDistribution: () =>
    apiClient.get<ApiResponse<DistributionData[]>>(
      "/dashboard/loan-distribution",
    ),

  getExpenseTrend: (year?: number) =>
    apiClient.get<ApiResponse<ExpenseTrendData[]>>("/dashboard/expense-trend", {
      params: { year },
    }),
};
