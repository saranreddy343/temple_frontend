export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr: string | Date): string => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
};

export const formatMonthYear = (month: number, year: number): string => {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

export const getLoanStatusColor = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "#22C55E";
    case "DUE_SOON":
      return "#F59E0B";
    case "OVERDUE":
      return "#EF4444";
    case "COMPLETED":
      return "#3B82F6";
    case "CANCELLED":
      return "#718096";
    default:
      return "#718096";
  }
};

export const getLoanStatusLabel = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "DUE_SOON":
      return "Due Soon";
    case "OVERDUE":
      return "Overdue";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
};

export const getDaysLabel = (dueDate: string): string => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const days = Math.ceil(
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  return `${days} days left`;
};

export const getScheduleStatusColor = (status: string): string => {
  switch (status) {
    case "PAID":
      return "#22C55E";
    case "OVERDUE":
      return "#EF4444";
    case "PENDING":
      return "#F59E0B";
    default:
      return "#718096";
  }
};

export const maskMobile = (mobile: string): string => {
  return `${mobile.slice(0, 2)}XXXXXX${mobile.slice(-2)}`;
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
