import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { loanAPI } from "../../api/loan.api";
import {
  formatCurrency,
  formatDate,
  getDaysLabel,
  getLoanStatusLabel,
} from "../../utils/formatters";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  DashboardCard,
  EmptyState,
  SectionHeader,
  SkeletonBlock,
  StatCard,
  TimelineCard,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";

export default function LoanDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const palette = useAdminPalette();
  const loanId: string = route.params?.loanId;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["loan", loanId],
    queryFn: () => loanAPI.getById(loanId),
    enabled: !!loanId,
  });

  const loan = data?.data?.data;
  const isActive = loan ? ["ACTIVE", "DUE_SOON", "OVERDUE"].includes(loan.status) : false;

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        eyebrow="Loan Detail"
        title={loan?.loanNumber ?? "Loan"}
        subtitle={loan ? `${getLoanStatusLabel(loan.status)} · ${loan.borrower?.name ?? "Borrower"}` : "Financial record"}
        onBack={() => navigation.goBack()}
      />
      <AdminScrollScreen refreshing={isLoading} onRefresh={refetch}>
        {isLoading ? (
          <>
            <SkeletonBlock height={170} />
            <SkeletonBlock height={220} />
          </>
        ) : !loan ? (
          <EmptyState title="Loan not found" message="This loan record could not be loaded." icon="alert-circle" />
        ) : (
          <>
            <DashboardCard>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={[styles.summaryLabel, { color: palette.textMuted }]}>Total Payable</Text>
                  <Text style={[styles.summaryValue, { color: palette.text }]}>{formatCurrency(Number(loan.totalPayable))}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(loan.status) + "16" }]}>
                  <Text style={[styles.statusText, { color: statusColor(loan.status) }]}>{getLoanStatusLabel(loan.status)}</Text>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((Number(loan.principalAmount) / Number(loan.totalPayable || 1)) * 100, 100)}%`,
                      backgroundColor: palette.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dueText, { color: statusColor(loan.status) }]}>
                Due {formatDate(loan.dueDate)} · {getDaysLabel(loan.dueDate)}
              </Text>
            </DashboardCard>

            <SectionHeader title="Loan Summary" subtitle="Principal, interest, and schedule" />
            <View style={styles.statsGrid}>
              <StatCard label="Principal" value={formatCurrency(Number(loan.principalAmount))} icon="cash" />
              <StatCard label="Interest" value={formatCurrency(Number(loan.totalInterest))} icon="percent" tone="warning" />
              <StatCard label="Monthly" value={formatCurrency(Number(loan.monthlyInterest))} icon="calendar-month" tone="primary" />
              <StatCard label="Duration" value={`${loan.durationMonths} MONTHS`} icon="timeline-clock" tone={Number(loan.durationMonths) === 3 ? "info" : "secondary"} />
            </View>

            <SectionHeader title="Borrower Info" />
            <DashboardCard>
              <InfoRow icon="account" label="Name" value={loan.borrower?.name ?? "-"} />
              <InfoRow icon="phone" label="Mobile" value={loan.borrower?.mobile ?? "-"} />
              <InfoRow icon="calendar" label="Loan Date" value={formatDate(loan.loanDate)} />
              <InfoRow icon="account-tie" label="Sanctioned By" value={loan.creator?.name ?? "-"} />
            </DashboardCard>

            <SectionHeader title="Payment Schedule" />
            <TimelineCard
              items={[
                { title: "Loan sanctioned", subtitle: formatDate(loan.loanDate), icon: "cash-plus", tone: "primary" },
                { title: "Monthly interest cycle", subtitle: `${formatCurrency(Number(loan.monthlyInterest))} expected monthly`, icon: "percent", tone: "warning" },
                { title: "Final due date", subtitle: formatDate(loan.dueDate), icon: "calendar-clock", tone: loan.status === "OVERDUE" ? "danger" : "success" },
              ]}
            />

            <SectionHeader title="Payment History" />
            {loan.payments && loan.payments.length > 0 ? (
              <TimelineCard
                items={loan.payments.map((payment) => ({
                  title: `${payment.paymentMethod} payment`,
                  subtitle: `${formatCurrency(Number(payment.totalPaid))} · ${formatDate(payment.paymentDate)}`,
                  icon: "cash-check",
                  tone: "success",
                }))}
              />
            ) : (
              <EmptyState title="No payments recorded" message="Collections and receipts will appear here after a payment is captured." icon="receipt-text" />
            )}
          </>
        )}
      </AdminScrollScreen>
      {loan && isActive ? (
        <View style={[styles.stickyBar, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <StickyAction label="Edit" icon="pencil" onPress={() => navigation.navigate("EditLoan", { loanId: loan.id })} />
          <StickyAction label="Completed" icon="check-decagram" onPress={() => navigation.navigate("CloseLoan", { loanId: loan.id })} />
        </View>
      ) : null}
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const palette = useAdminPalette();
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <MaterialCommunityIcons name={icon as never} size={17} color={palette.textMuted} />
        <Text style={[styles.infoLabel, { color: palette.textMuted }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

function StickyAction({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  const palette = useAdminPalette();
  return (
    <Pressable onPress={onPress} style={[styles.stickyAction, { backgroundColor: `${palette.primary}12` }]}>
      <MaterialCommunityIcons name={icon as never} size={18} color={palette.primary} />
      <Text style={[styles.stickyText, { color: palette.primary }]}>{label}</Text>
    </Pressable>
  );
}

const statusColor = (status: string) => {
  if (status === "OVERDUE") return "#EF4444";
  if (status === "DUE_SOON") return "#F59E0B";
  if (status === "COMPLETED") return "#22C55E";
  return "#5EBEA5";
};

const styles = StyleSheet.create({
  summaryTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  summaryLabel: { fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  summaryValue: { fontSize: 30, fontWeight: "900", marginTop: 6 },
  statusBadge: { borderRadius: 999, paddingHorizontal: 12, height: 34, alignItems: "center", justifyContent: "center" },
  statusText: { fontSize: 12, fontWeight: "900" },
  progressTrack: { height: 9, borderRadius: 999, backgroundColor: "#E2E8F0", marginTop: 20, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  dueText: { fontSize: 13, fontWeight: "900", marginTop: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 18 },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  infoLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoLabel: { fontSize: 13, fontWeight: "700" },
  infoValue: { fontSize: 14, fontWeight: "900", flex: 1, textAlign: "right" },
  stickyBar: { position: "absolute", left: 16, right: 16, bottom: 16, borderRadius: 24, borderWidth: 1, padding: 10, flexDirection: "row", gap: 8 },
  stickyAction: { flex: 1, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 5 },
  stickyText: { fontSize: 12, fontWeight: "900" },
});
