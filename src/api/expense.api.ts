import apiClient from "./client";
import { ApiResponse, Expense, PaginatedResponse } from "../types";

interface ExpenseFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const expenseAPI = {
  getAll: (params?: ExpenseFilters) =>
    apiClient.get<
      ApiResponse<{
        count: number;
        rows: Expense[];
        page: number;
        limit: number;
      }>
    >("/expenses", { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Expense>>(`/expenses/${id}`),

  getSummary: (year: number, month?: number) =>
    apiClient.get<
      ApiResponse<{
        total: number;
        byCategory: Record<string, number>;
        count: number;
      }>
    >("/expenses/summary", { params: { year, month } }),

  create: (data: {
    title: string;
    description?: string;
    category: string;
    amount: number;
    expenseDate: string;
    receiptImage?: string;
  }) => apiClient.post<ApiResponse<Expense>>("/expenses", data),

  update: (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      category: string;
      amount: number;
      expenseDate: string;
    }>,
  ) => apiClient.put<ApiResponse<Expense>>(`/expenses/${id}`, data),
};
