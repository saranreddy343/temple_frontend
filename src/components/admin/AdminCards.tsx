import React, { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { BorderRadius, Colors, Spacing, Typography } from "../../theme";
import { Expense, Loan, User } from "../../types";
import {
  AdminTone,
  DashboardCard,
  toneColor,
  useAdminPalette,
} from "./PremiumAdminUI";
import {
  formatCurrency,
  formatDate,
  getInitials,
  getLoanStatusLabel,
} from "../../utils/formatters";

type CardAction = {
  label: string;
  icon: string;
  onPress: () => void;
};

export const VillagerCard = memo(function VillagerCard({
  user,
  activeLoans = 0,
  outstanding = 0,
  dueStatus,
  actions,
  onPress,
}: {
  user: User;
  activeLoans?: number;
  outstanding?: number;
  dueStatus?: string;
  actions: CardAction[];
  onPress: () => void;
}) {
  const palette = useAdminPalette();
  const isActive = user.isActive;
  const statusColor = isActive ? palette.success : palette.danger;
  const statusLabel = dueStatus ?? (isActive ? "ACTIVE" : "INACTIVE");
  return (
    <DashboardCard>
      <Pressable onPress={onPress}>
        <View style={styles.entityTop}>
          <View style={[styles.avatar, { backgroundColor: `${statusColor}18` }]}>
            <Text style={[styles.avatarText, { color: statusColor }]}>{getInitials(user.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.entityTitle, { color: palette.text }]}>{user.name}</Text>
            <Text style={[styles.entitySub, { color: palette.textMuted }]}>+91 {user.mobile}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: `${statusColor}14` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        <View style={styles.metricsRow}>
          <Metric label="Active Loans" value={String(activeLoans)} />
          <Metric label="Outstanding" value={formatCurrency(outstanding)} />
        </View>
        <ActionRow actions={actions} />
      </Pressable>
    </DashboardCard>
  );
});

export const PremiumLoanCard = memo(function PremiumLoanCard({
  loan,
  borrowerName,
  onPress,
  actions,
}: {
  loan: Loan;
  borrowerName?: string;
  onPress: () => void;
  actions?: CardAction[];
}) {
  const palette = useAdminPalette();
  const durationTone: AdminTone = Number(loan.durationMonths) === 3 ? "info" : "secondary";
  const durationColor = toneColor(palette, durationTone);
  const statusTone: AdminTone =
    loan.status === "OVERDUE" ? "danger" : loan.status === "DUE_SOON" ? "warning" : loan.status === "COMPLETED" ? "success" : "primary";
  const status = toneColor(palette, statusTone);
  const dueDate = new Date(loan.dueDate);
  const days = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return (
    <DashboardCard>
      <Pressable onPress={onPress}>
        <View style={styles.entityTop}>
          <View style={[styles.iconBadge, { backgroundColor: `${durationColor}14` }]}>
            <MaterialCommunityIcons name={Number(loan.durationMonths) === 3 ? "timer-sand" : "calendar-range"} size={22} color={durationColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.entityTitle, { color: palette.text }]}>{borrowerName ?? loan.borrower?.name ?? "Borrower"}</Text>
            <Text style={[styles.entitySub, { color: palette.textMuted }]}>{loan.loanNumber}{loan.bondNumber ? ` · Bond ${loan.bondNumber}` : ""}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: `${durationColor}14` }]}>
            <Text style={[styles.statusText, { color: durationColor }]}>{loan.durationMonths} MONTHS</Text>
          </View>
        </View>
        <View style={styles.metricsRow}>
          <Metric label="Principal" value={formatCurrency(Number(loan.principalAmount))} />
          <Metric label="Interest" value={formatCurrency(Number(loan.totalInterest))} />
        </View>
        <View style={styles.metricsRowCompact}>
          <Metric label="Total Payable" value={formatCurrency(Number(loan.totalPayable))} />
          <Metric label="Due Date" value={formatDate(loan.dueDate)} />
        </View>
        <View style={[styles.dueBand, { backgroundColor: `${status}10`, borderColor: `${status}25` }]}>
          <MaterialCommunityIcons name={loan.status === "OVERDUE" ? "alert-circle" : "calendar-clock"} size={16} color={status} />
          <Text style={[styles.dueText, { color: status }]}>
            {getLoanStatusLabel(loan.status)} · {days >= 0 ? `${days} days left` : `${Math.abs(days)} days overdue`}
          </Text>
        </View>
        {actions ? <ActionRow actions={actions} /> : null}
      </Pressable>
    </DashboardCard>
  );
});

export const PremiumExpenseCard = memo(function PremiumExpenseCard({
  expense,
  onPress,
}: {
  expense: Expense;
  onPress: () => void;
}) {
  const palette = useAdminPalette();
  const color = categoryColor(expense.category);
  return (
    <DashboardCard>
      <Pressable onPress={onPress}>
        <View style={styles.entityTop}>
          <View style={[styles.iconBadge, { backgroundColor: `${color}14` }]}>
            <MaterialCommunityIcons name={categoryIcon(expense.category) as never} size={22} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.entityTitle, { color: palette.text }]} numberOfLines={1}>{expense.category.replace("_", " ")}</Text>
            <Text style={[styles.entitySub, { color: palette.textMuted }]}>{expense.title}</Text>
          </View>
          <Text style={[styles.amountText, { color: palette.text }]}>{formatCurrency(Number(expense.amount))}</Text>
        </View>
        <View style={styles.expenseMetaRow}>
          <Text style={[styles.expenseMeta, { color: palette.textMuted }]}>{formatDate(expense.expenseDate)}</Text>
          <Text style={[styles.expenseMeta, { color: palette.textMuted }]}>Added by {(expense.creator as any)?.name ?? "Admin"}</Text>
        </View>
      </Pressable>
    </DashboardCard>
  );
});

export function StepperShell({
  steps,
  activeStep,
}: {
  steps: string[];
  activeStep: number;
}) {
  const palette = useAdminPalette();
  return (
    <View style={styles.stepper}>
      {steps.map((step, index) => {
        const active = index <= activeStep;
        return (
          <View key={step} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                { backgroundColor: active ? palette.primary : palette.border },
              ]}
            >
              <Text style={styles.stepNumber}>{index + 1}</Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                { color: active ? palette.text : palette.textMuted },
              ]}
            >
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const palette = useAdminPalette();
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: palette.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: palette.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

function ActionRow({ actions }: { actions: CardAction[] }) {
  const palette = useAdminPalette();
  return (
    <View style={styles.actionRow}>
      {actions.map((action) => (
        <Pressable
          key={action.label}
          onPress={action.onPress}
          style={[styles.smallAction, { borderColor: palette.border }]}
        >
          <MaterialCommunityIcons
            name={action.icon as never}
            size={15}
            color={palette.primary}
          />
          <Text style={[styles.smallActionText, { color: palette.primary }]}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const categoryColor = (category: string) => {
  const map: Record<string, string> = {
    FESTIVAL: "#F59E0B",
    MAINTENANCE: "#6366F1",
    DECORATION: "#EC4899",
    ELECTRICITY: "#EAB308",
    WATER: "#06B6D4",
    ANNADANAM: "#22C55E",
    SALARY: "#3B82F6",
    MISCELLANEOUS: "#64748B",
  };
  return map[category] ?? Colors.primary;
};

const categoryIcon = (category: string) => {
  const map: Record<string, string> = {
    FESTIVAL: "party-popper",
    MAINTENANCE: "tools",
    DECORATION: "flower",
    ELECTRICITY: "lightning-bolt",
    WATER: "water",
    ANNADANAM: "food",
    SALARY: "account-cash",
    MISCELLANEOUS: "dots-horizontal",
  };
  return map[category] ?? "receipt";
};

const styles = StyleSheet.create({
  entityTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { ...Typography.h4, fontWeight: "900" },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  entityTitle: { ...Typography.body1, fontWeight: "900" },
  entitySub: { ...Typography.caption, marginTop: 4 },
  amountText: { ...Typography.h4, fontWeight: "900" },
  statusPill: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: "900" },
  metricsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  metricsRowCompact: { flexDirection: "row", gap: 10, marginTop: 10 },
  metric: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    backgroundColor: "#F8FAFC",
    padding: 12,
  },
  metricValue: { ...Typography.body2, fontWeight: "900" },
  metricLabel: { ...Typography.caption, marginTop: 3 },
  dueBand: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  dueText: { ...Typography.caption, fontWeight: "800", flex: 1 },
  expenseMetaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14, gap: 12 },
  expenseMeta: { ...Typography.caption, fontWeight: "700", flex: 1 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" },
  smallAction: {
    height: 34,
    paddingHorizontal: 11,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  smallActionText: { fontSize: 12, fontWeight: "900" },
  stepper: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  stepItem: { flex: 1, alignItems: "center" },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: { color: "white", fontSize: 12, fontWeight: "900" },
  stepLabel: {
    fontSize: 10,
    fontWeight: "800",
    marginTop: 6,
    textAlign: "center",
  },
});
