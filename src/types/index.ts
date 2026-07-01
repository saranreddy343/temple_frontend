export type UserRole = "ADMIN" | "BORROWER";
export type LoanStatus =
  | "ACTIVE"
  | "DUE_SOON"
  | "OVERDUE"
  | "COMPLETED"
  | "CANCELLED";
export type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE";
export type ExpenseCategory =
  | "FESTIVAL"
  | "MAINTENANCE"
  | "DECORATION"
  | "ELECTRICITY"
  | "WATER"
  | "ANNADANAM"
  | "SALARY"
  | "MISCELLANEOUS";
export type NotificationTargetType =
  | "ALL"
  | "ADMINS_ONLY"
  | "BORROWERS_ONLY"
  | "SPECIFIC_USER";

export interface User {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  role: UserRole;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface TempleFund {
  id: string;
  totalAmount: number;
  availableAmount: number;
  loanedAmount: number;
  updatedAt: string;
}

export interface Loan {
  id: string;
  borrowerId: string;
  loanNumber: string;
  bondNumber?: string;
  principalAmount: number;
  interestRate: number;
  loanDate: string;
  dueDate: string;
  durationMonths: number;
  status: LoanStatus;
  monthlyInterest: number;
  totalInterest: number;
  totalPayable: number;
  remainingPrincipal?: number;
  remainingBalance: number;
  createdBy: string;
  updatedBy?: string;
  closedDate?: string;
  remarks?: string;
  borrower?: User;
  creator?: User;
  payments?: LoanPayment[];
  createdAt: string;
  updatedAt: string;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  principalAmount: number;
  interestAmount: number;
  totalPaid: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  collectedBy: string;
  collector?: User;
  remarks?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  description?: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  receiptImage?: string;
  createdBy: string;
  updatedBy?: string;
  creator?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  targetType: NotificationTargetType;
  targetUserId?: string;
  createdBy?: string;
  status: string;
  /** Deep-link metadata: loanId, expenseId, screen, etc. */
  data?: Record<string, string>;
  createdAt: string;
}

export interface UserNotification {
  id: string;
  notificationId: string;
  userId: string;
  isRead: boolean;
  readAt?: string;
  openedAt?: string;
  notification: Notification;
  createdAt: string;
}

export interface AdminDashboardStats {
  totalTempleFund: number;
  availableFund: number;
  totalLoanedAmount: number;
  distributedAmount: number;
  expectedReturnAmount: number;
  activeLoans: number;
  activeBorrowers: number;
  overdueLoans: number;
  dueSoonLoans: number;
  threeMonthLoans: number;
  sixMonthLoans: number;
  totalExpenses: number;
  currentMonthExpenses: number;
}

export interface BorrowerActiveLoan {
  loanId: string;
  loanNumber: string;
  bondNumber?: string;
  principalAmount: number;
  totalPayable: number;
  remainingBalance: number;
  dueDate: string;
  status: LoanStatus;
  durationMonths: number;
  interestRate: number;
  monthlyInterest: number;
  totalInterest: number;
}

export interface BorrowerDashboardStats {
  activeLoansCount: number;
  completedLoansCount: number;
  totalOutstanding: number;
  nextDueLoan: {
    loanId: string;
    loanNumber: string;
    totalPayable: number;
    dueDate: string;
    status: LoanStatus;
  } | null;
  activeLoans: BorrowerActiveLoan[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// Navigation params
export type RootStackParamList = {
  Auth: undefined;
  Admin: undefined;
  Borrower: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  OTPVerification: { mobile: string; devOtp?: string; expiresIn?: number };
  ForgotPassword: undefined;
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  VillagerList: undefined;
  AddVillager: undefined;
  EditVillager: { userId: string };
  VillagerDetails: { userId: string; mode?: "view" | "edit" };
  LoanList: undefined;
  CreateLoan: { borrowerId?: string } | undefined;
  LoanDetails: { loanId: string };
  EditLoan: { loanId: string };
  CloseLoan: { loanId: string };
  InterestCollection: { loanId: string };
  PrincipalCollection: { loanId: string };
  ExpenseList: undefined;
  AddExpense: undefined;
  ExpenseDetails: { expenseId: string };
  Reports: undefined;
  Profile: undefined;
  AdminNotifications: undefined;
  BroadcastNotification: undefined;
  AuditLogs: undefined;
  Settings: undefined;
};

export type BorrowerStackParamList = {
  BorrowerTabs: undefined;
  LoanDetails: { loanId: string };
  BorrowerNotifications: undefined;
  MyLoans: undefined;
  PaymentHistory: { loanId: string };
  ExpenseList: undefined;
  ExpenseDetails: { expenseId: string };
  Profile: undefined;
};
