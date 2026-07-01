import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius, Typography } from "../../theme";
import { Loan } from "../../types";
import {
  formatCurrency,
  formatDate,
  getLoanStatusColor,
  getLoanStatusLabel,
  getDaysLabel,
} from "../../utils/formatters";

interface LoanCardProps {
  loan: Loan;
  onPress: () => void;
}

export default function LoanCard({ loan, onPress }: LoanCardProps) {
  const statusColor = getLoanStatusColor(loan.status);
  const isActive = ["ACTIVE", "DUE_SOON", "OVERDUE"].includes(loan.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.loanInfo}>
          <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
          {loan.borrower && (
            <Text style={styles.borrowerName}>{loan.borrower.name}</Text>
          )}
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getLoanStatusLabel(loan.status)}
          </Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <View style={styles.amountItem}>
          <Text style={styles.label}>Principal</Text>
          <Text style={styles.amount}>
            {formatCurrency(Number(loan.principalAmount))}
          </Text>
        </View>
        <View style={styles.dividerV} />
        <View style={styles.amountItem}>
          <Text style={styles.label}>Interest</Text>
          <Text style={[styles.amount, { color: Colors.warning }]}>
            {formatCurrency(Number(loan.totalInterest))}
          </Text>
        </View>
        <View style={styles.dividerV} />
        <View style={styles.amountItem}>
          <Text style={styles.label}>Total Payable</Text>
          <Text style={[styles.amount, { color: Colors.success }]}>
            {formatCurrency(Number(loan.totalPayable))}
          </Text>
        </View>
      </View>

      {isActive && (
        <View
          style={[
            styles.dueRow,
            {
              borderColor: statusColor + "30",
              backgroundColor: statusColor + "08",
            },
          ]}
        >
          <MaterialCommunityIcons
            name="clock-outline"
            size={13}
            color={statusColor}
          />
          <Text style={[styles.dueText, { color: statusColor }]}>
            Due {formatDate(loan.dueDate)} · {getDaysLabel(loan.dueDate)}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons
            name="calendar"
            size={13}
            color={Colors.textMuted}
          />
          <Text style={styles.footerText}>{formatDate(loan.loanDate)}</Text>
        </View>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons
            name="percent"
            size={13}
            color={Colors.textMuted}
          />
          <Text style={styles.footerText}>{loan.interestRate}% / month</Text>
        </View>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={13}
            color={Colors.textMuted}
          />
          <Text style={styles.footerText}>{loan.durationMonths} months</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  loanInfo: { flex: 1 },
  loanNumber: { ...Typography.h4, color: Colors.text },
  borrowerName: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...Typography.caption, fontWeight: "600" },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  amountItem: { flex: 1, alignItems: "center" },
  label: { ...Typography.caption, color: Colors.textMuted, marginBottom: 2 },
  amount: { ...Typography.body2, fontWeight: "700", color: Colors.text },
  dividerV: { width: 1, backgroundColor: Colors.border },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  dueText: { ...Typography.caption, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { ...Typography.caption, color: Colors.textMuted },
});

interface LoanCardProps {
  loan: Loan;
  onPress: () => void;
}
