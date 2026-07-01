import React, { memo, useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { RootState } from "../../store";
import { dashboardAPI } from "../../api/dashboard.api";
import { notificationAPI } from "../../api/notification.api";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  EmptyState,
  SectionHeader,
  SkeletonBlock,
  StatCard,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import { PremiumLoanCard } from "../../components/admin/AdminCards";
import { formatCurrency, formatDate, getDaysLabel } from "../../utils/formatters";
import { BorrowerActiveLoan, Loan } from "../../types";
import { Shadows, Spacing } from "../../theme";

// Maps the compact dashboard loan shape to the full Loan interface for PremiumLoanCard
function toLoan(a: BorrowerActiveLoan): Loan {
  return {
    id: a.loanId,
    borrowerId: "",
    loanNumber: a.loanNumber,
    bondNumber: a.bondNumber,
    principalAmount: a.principalAmount,
    interestRate: a.interestRate,
    loanDate: "",
    dueDate: a.dueDate,
    durationMonths: a.durationMonths,
    status: a.status,
    monthlyInterest: a.monthlyInterest,
    totalInterest: a.totalInterest,
    totalPayable: a.totalPayable,
    remainingBalance: a.remainingBalance,
    createdBy: "",
    createdAt: "",
    updatedAt: "",
  } as Loan;
}

const BorrowerSummaryCard = memo(function BorrowerSummaryCard({
  totalPayable,
  totalBorrowed,
  totalOutstanding,
}: {
  totalPayable: number;
  totalBorrowed: number;
  totalOutstanding: number;
}) {
  return (
    <LinearGradient
      colors={["#1E293B", "#334155"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.summaryCard}
    >
      <View style={styles.summaryTop}>
        <View>
          <Text style={styles.summaryLabel}>Total Repayable</Text>
          <Text style={styles.summaryTotal}>{formatCurrency(totalPayable)}</Text>
        </View>
        <View style={styles.summarySeal}>
          <MaterialCommunityIcons name="wallet-outline" size={26} color="white" />
        </View>
      </View>
      <View style={styles.summaryMetrics}>
        <View style={styles.summaryMetric}>
          <Text style={styles.summaryMetricLabel}>Borrowed</Text>
          <Text style={styles.summaryMetricValue}>{formatCurrency(totalBorrowed)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryMetric}>
          <Text style={styles.summaryMetricLabel}>Outstanding</Text>
          <Text style={styles.summaryMetricValue}>{formatCurrency(totalOutstanding)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
});

export default function BorrowerDashboardScreen() {
  const navigation = useNavigation<any>();
  const palette = useAdminPalette();
  const { user } = useSelector((s: RootState) => s.auth);

  const { data: statsRes, isLoading, refetch } = useQuery({
    queryKey: ["borrowerStats"],
    queryFn: () => dashboardAPI.getBorrowerStats(),
    refetchInterval: 60000,
  });

  const { data: unreadRes } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: () => notificationAPI.getUnreadCount(),
    refetchInterval: 30000,
  });

  const stats = statsRes?.data?.data;
  const unreadCount = unreadRes?.data?.data?.count ?? 0;

  const computed = useMemo(() => {
    const loans = stats?.activeLoans ?? [];
    const totalBorrowed = loans.reduce((s, l) => s + Number(l.principalAmount), 0);
    const totalPayable = loans.reduce((s, l) => s + Number(l.totalPayable), 0);
    const threeMonths = loans.filter((l) => l.durationMonths === 3).length;
    const sixMonths = loans.filter((l) => l.durationMonths === 6).length;
    return { totalBorrowed, totalPayable, threeMonths, sixMonths };
  }, [stats?.activeLoans]);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        title={`Welcome, ${user?.name?.split(" ")[0] ?? "Borrower"} 🙏`}
        subtitle={today}
        rightIcon="bell-outline"
        rightBadge={unreadCount}
        onRightPress={() => navigation.navigate("BorrowerNotifications")}
      />
      <AdminScrollScreen refreshing={isLoading} onRefresh={refetch}>
        {isLoading && !stats ? (
          <>
            <View style={{ paddingHorizontal: Spacing.lg, marginTop: -22 }}>
              <SkeletonBlock height={120} />
            </View>
            <SkeletonBlock height={88} />
            <SkeletonBlock height={88} />
            <SkeletonBlock height={160} />
          </>
        ) : stats ? (
          <>
            <View style={{ paddingHorizontal: Spacing.lg, marginTop: -22 }}>
              <BorrowerSummaryCard
                totalPayable={computed.totalPayable}
                totalBorrowed={computed.totalBorrowed}
                totalOutstanding={stats.totalOutstanding}
              />
            </View>

            <SectionHeader title="Loan Overview" subtitle="Your active loan positions" />

            <View style={styles.statsGrid}>
              <View style={styles.statsCol}>
                <StatCard label="Active Loans" value={String(stats.activeLoansCount)} icon="handshake" tone="success" />
              </View>
              <View style={styles.statsCol}>
                <StatCard label="Outstanding" value={formatCurrency(stats.totalOutstanding)} icon="cash-minus" tone="warning" />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statsCol}>
                <StatCard label="3 Month Loans" value={String(computed.threeMonths)} icon="timer-sand" tone="info" />
              </View>
              <View style={styles.statsCol}>
                <StatCard label="6 Month Loans" value={String(computed.sixMonths)} icon="calendar-range" tone="secondary" />
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statsCol}>
                <StatCard label="Completed" value={String(stats.completedLoansCount)} icon="check-circle" tone="success" />
              </View>
              {stats.nextDueLoan ? (
                <View style={styles.statsCol}>
                  <StatCard
                    label="Next Due"
                    value={formatDate(stats.nextDueLoan.dueDate)}
                    icon="calendar-clock"
                    tone="danger"
                    helper={getDaysLabel(stats.nextDueLoan.dueDate)}
                  />
                </View>
              ) : null}
            </View>

            {stats.nextDueLoan ? (
              <>
                <SectionHeader title="Next Repayment" subtitle="Upcoming payment due" />
                <Animated.View
                  entering={FadeInDown.delay(80).duration(350)}
                  style={[styles.nextDueCard, { borderColor: `${palette.warning}40`, backgroundColor: `${palette.warning}06` }]}
                >
                  <View style={styles.nextDueRow}>
                    <View style={[styles.nextDueIcon, { backgroundColor: `${palette.warning}18` }]}>
                      <MaterialCommunityIcons name="bell-ring" size={20} color={palette.warning} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.nextDueLoan, { color: palette.text }]}>{stats.nextDueLoan.loanNumber}</Text>
                      <Text style={[styles.nextDueDate, { color: palette.textMuted }]}>
                        {formatDate(stats.nextDueLoan.dueDate)} · {getDaysLabel(stats.nextDueLoan.dueDate)}
                      </Text>
                    </View>
                    <Text style={[styles.nextDueAmount, { color: palette.warning }]}>
                      {formatCurrency(stats.nextDueLoan.totalPayable)}
                    </Text>
                  </View>
                </Animated.View>
              </>
            ) : null}

            {stats.activeLoans?.length > 0 ? (
              <>
                <SectionHeader
                  title="Active Loans"
                  subtitle={`${stats.activeLoansCount} loan${stats.activeLoansCount !== 1 ? "s" : ""}`}
                  action="View All"
                  onAction={() => navigation.navigate("My Loans")}
                />
                {stats.activeLoans.map((a) => (
                  <PremiumLoanCard
                    key={a.loanId}
                    loan={toLoan(a)}
                    borrowerName={`${a.durationMonths} Month Loan`}
                    onPress={() => navigation.navigate("LoanDetails", { loanId: a.loanId })}
                  />
                ))}
              </>
            ) : (
              <EmptyState
                icon="handshake-outline"
                title="No Active Loans"
                message="You have no active loans right now. Contact the temple admin for assistance."
              />
            )}

            <SectionHeader title="Quick Access" />
            <View style={styles.quickRow}>
              <Pressable
                style={[styles.quickTile, { borderColor: palette.border, backgroundColor: palette.surface }]}
                onPress={() => navigation.navigate("Expenses")}
              >
                <View style={[styles.quickIcon, { backgroundColor: `${palette.warning}16` }]}>
                  <MaterialCommunityIcons name="receipt" size={22} color={palette.warning} />
                </View>
                <Text style={[styles.quickLabel, { color: palette.text }]}>Temple Expenses</Text>
              </Pressable>
              <Pressable
                style={[styles.quickTile, { borderColor: palette.border, backgroundColor: palette.surface }]}
                onPress={() => navigation.navigate("BorrowerNotifications")}
              >
                <View style={[styles.quickIcon, { backgroundColor: `${palette.primary}16` }]}>
                  <MaterialCommunityIcons name="bell-outline" size={22} color={palette.primary} />
                </View>
                <Text style={[styles.quickLabel, { color: palette.text }]}>Notifications</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </AdminScrollScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: { borderRadius: 24, padding: 20, ...Shadows.lg },
  summaryTop: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "700" },
  summaryTotal: { color: "white", fontSize: 30, fontWeight: "900", marginTop: 8 },
  summarySeal: {
    width: 52, height: 52, borderRadius: 18, alignItems: "center",
    justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)",
  },
  summaryMetrics: { flexDirection: "row", alignItems: "center", marginTop: 24 },
  summaryMetric: { flex: 1 },
  summaryMetricLabel: { color: "rgba(255,255,255,0.62)", fontSize: 12 },
  summaryMetricValue: { color: "white", fontSize: 16, fontWeight: "800", marginTop: 4 },
  summaryDivider: { width: 1, height: 42, backgroundColor: "rgba(255,255,255,0.18)", marginHorizontal: 16 },
  statsGrid: { flexDirection: "row", paddingHorizontal: Spacing.lg, gap: 12 },
  statsCol: { flex: 1 },
  nextDueCard: { marginHorizontal: Spacing.lg, borderRadius: 18, borderWidth: 1.5, padding: Spacing.md },
  nextDueRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  nextDueIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  nextDueLoan: { fontSize: 15, fontWeight: "700" },
  nextDueDate: { fontSize: 12, marginTop: 2 },
  nextDueAmount: { fontSize: 18, fontWeight: "800" },
  quickRow: { flexDirection: "row", paddingHorizontal: Spacing.lg, gap: 12, marginBottom: 12 },
  quickTile: { flex: 1, alignItems: "center", padding: Spacing.md, borderRadius: 18, borderWidth: 1, gap: 8 },
  quickIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  quickLabel: { fontSize: 12, fontWeight: "600", textAlign: "center" },
});
