import React, { memo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { loanAPI } from "../../api/loan.api";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  DashboardCard,
  EmptyState,
  SectionHeader,
  SkeletonBlock,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import { Spacing } from "../../theme";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { RootState } from "../../store";
import { Loan, LoanPayment } from "../../types";

const METHOD_ICONS: Record<string, string> = {
  CASH: "cash",
  UPI: "cellphone",
  BANK_TRANSFER: "bank-transfer",
  CHEQUE: "checkbook",
};

const LoanPaymentCard = memo(function LoanPaymentCard({
  loan,
  palette,
}: {
  loan: Loan;
  palette: ReturnType<typeof useAdminPalette>;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["loanPayments", loan.id],
    queryFn: () => loanAPI.getPayments(loan.id),
  });

  const payments: LoanPayment[] = data?.data?.data ?? [];

  return (
    <View style={{ paddingHorizontal: Spacing.lg }}>
      <DashboardCard>
        <View style={[styles.loanHeader, { borderBottomColor: palette.border }]}>
          <View>
            <Text style={[styles.loanNumber, { color: palette.text }]}>{loan.loanNumber}</Text>
            <Text style={[styles.loanDate, { color: palette.textMuted }]}>
              Closed {loan.closedDate ? formatDate(loan.closedDate) : "-"}
            </Text>
          </View>
          <View style={[styles.closedBadge, { backgroundColor: `${palette.success}14` }]}>
            <Text style={[styles.closedBadgeText, { color: palette.success }]}>CLOSED</Text>
          </View>
        </View>

        {isLoading ? (
          <SkeletonBlock height={60} />
        ) : payments.length === 0 ? (
          <Text style={[styles.noPaymentsText, { color: palette.textMuted }]}>No payment records</Text>
        ) : (
          payments.map((payment, idx) => (
            <View key={payment.id}>
              <View style={styles.paymentRow}>
                <View style={[styles.iconBg, { backgroundColor: `${palette.success}14` }]}>
                  <MaterialCommunityIcons
                    name={(METHOD_ICONS[payment.paymentMethod] ?? "cash") as never}
                    size={18}
                    color={palette.success}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.paymentMethod, { color: palette.text }]}>
                    {payment.paymentMethod.replace("_", " ")}
                  </Text>
                  <Text style={[styles.paymentDate, { color: palette.textMuted }]}>
                    {formatDate(payment.paymentDate)}
                  </Text>
                  <View style={styles.breakdownRow}>
                    <Text style={[styles.breakdownItem, { color: palette.textMuted }]}>
                      P: {formatCurrency(Number(payment.principalAmount))}
                    </Text>
                    <Text style={{ color: palette.textMuted, fontSize: 11 }}> + </Text>
                    <Text style={[styles.breakdownItem, { color: palette.warning }]}>
                      I: {formatCurrency(Number(payment.interestAmount))}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.totalPaid, { color: palette.success }]}>
                  {formatCurrency(Number(payment.totalPaid))}
                </Text>
              </View>
              {idx < payments.length - 1 && (
                <View style={[styles.divider, { backgroundColor: palette.border }]} />
              )}
            </View>
          ))
        )}

        <View style={[styles.summaryBand, { borderTopColor: palette.border, backgroundColor: `${palette.primary}06` }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: palette.textMuted }]}>Principal</Text>
            <Text style={[styles.summaryValue, { color: palette.text }]}>
              {formatCurrency(Number(loan.principalAmount))}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: palette.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: palette.textMuted }]}>Interest</Text>
            <Text style={[styles.summaryValue, { color: palette.warning }]}>
              {formatCurrency(Number(loan.totalInterest))}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: palette.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: palette.textMuted }]}>Total Paid</Text>
            <Text style={[styles.summaryValue, { color: palette.success }]}>
              {formatCurrency(Number(loan.totalPayable))}
            </Text>
          </View>
        </View>
      </DashboardCard>
    </View>
  );
});

export default function PaymentHistoryScreen() {
  const navigation = useNavigation<any>();
  const palette = useAdminPalette();
  const { user } = useSelector((s: RootState) => s.auth);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["myCompletedLoans"],
    queryFn: () => loanAPI.getAll({ borrowerId: user?.id, status: "COMPLETED", limit: 50 }),
  });

  const completedLoans: Loan[] = data?.data?.data?.data ?? [];
  const canGoBack = navigation.canGoBack();

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        title="Payment History"
        subtitle="Closed and settled loans"
        onBack={canGoBack ? () => navigation.goBack() : undefined}
      />
      {isLoading ? (
        <AdminScrollScreen>
          <SkeletonBlock height={180} />
          <SkeletonBlock height={180} />
        </AdminScrollScreen>
      ) : (
        <FlatList
          data={completedLoans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item: loan }) => (
            <LoanPaymentCard loan={loan} palette={palette} />
          )}
          ListHeaderComponent={
            completedLoans.length > 0 ? (
              <SectionHeader
                title="Completed Loans"
                subtitle={`${completedLoans.length} loan${completedLoans.length !== 1 ? "s" : ""}`}
              />
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="cash-check"
              title="No Payment History"
              message="Completed and closed loans will appear here."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 100 },
  loanHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1 },
  loanNumber: { fontSize: 15, fontWeight: "800" },
  loanDate: { fontSize: 12, marginTop: 2 },
  closedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  closedBadgeText: { fontSize: 11, fontWeight: "700" },
  noPaymentsText: { fontSize: 12, fontStyle: "italic", paddingVertical: 8 },
  paymentRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 10 },
  iconBg: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  paymentMethod: { fontSize: 13, fontWeight: "600", textTransform: "capitalize" },
  paymentDate: { fontSize: 11, marginTop: 2 },
  breakdownRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  breakdownItem: { fontSize: 11 },
  totalPaid: { fontSize: 16, fontWeight: "800", marginTop: 4 },
  divider: { height: 1, marginLeft: 46 },
  summaryBand: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, marginTop: 12, borderTopWidth: 1, borderRadius: 10 },
  summaryItem: { alignItems: "center" },
  summaryLabel: { fontSize: 11 },
  summaryValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  summaryDivider: { width: 1, height: 36 },
});

