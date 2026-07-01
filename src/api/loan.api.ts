import apiClient from "./client";
import { ApiResponse, Loan, LoanPayment, PaginatedResponse } from "../types";

interface LoanFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  borrowerId?: string;
}

export const loanAPI = {
  getAll: (params?: LoanFilters) =>
    apiClient.get<ApiResponse<PaginatedResponse<Loan>>>("/loans", { params }),

  getById: (id: string) => apiClient.get<ApiResponse<Loan>>(`/loans/${id}`),

  getPayments: (id: string) =>
    apiClient.get<ApiResponse<LoanPayment[]>>(`/loans/${id}/payments`),

  create: (data: {
    borrowerId: string;
    loanNumber?: string;
    bondNumber?: string;
    principalAmount: number;
    interestRate: number;
    loanDate: string;
    durationMonths: number;
    remarks?: string;
  }) => apiClient.post<ApiResponse<Loan>>("/loans", data),

  update: (id: string, data: Partial<{
    loanNumber: string;
    bondNumber: string;
    principalAmount: number;
    interestRate: number;
    durationMonths: number;
    remarks: string;
  }>) => apiClient.put<ApiResponse<Loan>>(`/loans/${id}`, data),

  close: (
    id: string,
    data: {
      paymentMethod: string;
      paymentDate: string;
      remarks?: string;
    },
  ) => apiClient.post<ApiResponse<LoanPayment>>(`/loans/${id}/close`, data),

  collectInterest: (data: {
    loanId: string;
    month: number;
    year: number;
    paidDate: string;
    remarks?: string;
  }) =>
    apiClient.post<ApiResponse<LoanPayment>>(
      `/loans/${data.loanId}/collect-interest`,
      data,
    ),

  collectPrincipal: (data: {
    loanId: string;
    amount: number;
    paidDate: string;
    remarks?: string;
  }) =>
    apiClient.post<ApiResponse<LoanPayment>>(
      `/loans/${data.loanId}/collect-principal`,
      data,
    ),

  cancel: (id: string, reason?: string) =>
    apiClient.post<ApiResponse<Loan>>(`/loans/${id}/cancel`, { reason }),
};
