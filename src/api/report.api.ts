import apiClient from "./client";
import { ApiResponse, Loan } from "../types";

export interface InterestReportItem {
  id: string;
  month: number;
  year: number;
  interestAmount: number;
  paidDate: string;
  remarks?: string;
  loan?: {
    id: string;
    loanNumber: string;
    borrower?: {
      id: string;
      name: string;
      mobile: string;
    };
  };
}

type ReportFormat = "json" | "pdf" | "excel";

export const reportAPI = {
  getLoanReport: (params?: { status?: string; format?: ReportFormat }) =>
    apiClient.get<ApiResponse<Loan[]>>("/reports/loans", { params }),

  getInterestReport: (params?: {
    month?: number;
    year?: number;
    format?: ReportFormat;
  }) =>
    apiClient.get<ApiResponse<InterestReportItem[]>>("/reports/interest", {
      params,
    }),

  exportLoanReport: (format: Extract<ReportFormat, "pdf" | "excel">) =>
    apiClient.get<ArrayBuffer>("/reports/loans", {
      params: { format },
      responseType: "arraybuffer",
    }),

  exportInterestReport: (format: "excel") =>
    apiClient.get<ArrayBuffer>("/reports/interest", {
      params: { format },
      responseType: "arraybuffer",
    }),
};
