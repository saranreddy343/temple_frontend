import React, { useMemo } from "react";
import { StyleSheet, View, Text, ScrollView, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "../../api/dashboard.api";
import { notificationAPI } from "../../api/notification.api";
import { RootState } from "../../store";
import { formatCurrency } from "../../utils/formatters";
import { PieChart } from "react-native-gifted-charts";

import {
  ActionTile,
  AdminHeroHeader,
  AdminScrollScreen,
  FinancialSummaryCard,
  MiniBarChart,
  SectionHeader,
  SkeletonBlock,
  StatCard,
  TimelineCard,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";

const today = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).format(new Date());

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const palette = useAdminPalette();
  const { user } = useSelector((s: RootState) => s.auth);

  const {
    data: statsRes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => dashboardAPI.getAdminStats(),
    refetchInterval: 60000,
  });

  const { data: distributionRes } = useQuery({
    queryKey: ["loanDistribution"],
    queryFn: () => dashboardAPI.getLoanDistribution(),
  });

  const { data: expenseTrendRes } = useQuery({
    queryKey: ["expenseTrend"],
    queryFn: () => dashboardAPI.getExpenseTrend(new Date().getFullYear()),
  });

  const { data: unreadRes } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: () => notificationAPI.getUnreadCount(),
    refetchInterval: 30000,
  });

  const stats = statsRes?.data?.data;
  const unreadCount = unreadRes?.data?.data?.count ?? 0;
  const distribution = distributionRes?.data?.data ?? [];
  const expenses = expenseTrendRes?.data?.data ?? [];

  console.log("stats->", stats, distribution, expenses);

  const charts = useMemo(() => {
    const loanBars =
      distribution.length > 0
        ? distribution.map((item) => ({
            label: item.status.slice(0, 3),
            value: Number(item.count),
          }))
        : [
            { label: "Act", value: stats?.activeLoans ?? 0 },
            { label: "Due", value: stats?.dueSoonLoans ?? 0 },
            { label: "Ovd", value: stats?.overdueLoans ?? 0 },
            { label: "Cls", value: 2 },
          ];

    const expenseBars =
      expenses.length > 0
        ? expenses.slice(0, 5).map((item) => ({
            label: item.category.slice(0, 3),
            value: Number(item.total),
          }))
        : [
            { label: "Fest", value: stats?.currentMonthExpenses ?? 0 },
            {
              label: "Ops",
              value: Math.max((stats?.totalExpenses ?? 0) * 0.2, 1),
            },
            {
              label: "Util",
              value: Math.max((stats?.totalExpenses ?? 0) * 0.12, 1),
            },
            {
              label: "Misc",
              value: Math.max((stats?.totalExpenses ?? 0) * 0.08, 1),
            },
          ];

    return { loanBars, expenseBars };
  }, [distribution, expenses, stats]);

  const expenseDonutData = useMemo(() => {
    const colors = ["#7C6CF2", "#4DA6FF", "#FF8C42", "#F06292", "#26A69A"];

    return expenses.length > 0
      ? expenses.slice(0, 5).map((item, index) => ({
          value: Number(item.total),
          text: `₹${item.total}`,
          label: item.category,
          color: colors[index % colors.length],
        }))
      : [
          {
            value: stats?.currentMonthExpenses ?? 0,
            text: `₹${stats?.currentMonthExpenses ?? 0}`,
            label: "Festival",
            color: "#7C6CF2",
          },
          {
            value: Math.max((stats?.totalExpenses ?? 0) * 0.2, 1),
            text: "Ops",
            label: "Operations",
            color: "#4DA6FF",
          },
          {
            value: Math.max((stats?.totalExpenses ?? 0) * 0.12, 1),
            text: "Util",
            label: "Utilities",
            color: "#FF8C42",
          },
          {
            value: Math.max((stats?.totalExpenses ?? 0) * 0.08, 1),
            text: "Misc",
            label: "Miscellaneous",
            color: "#F06292",
          },
        ];
  }, [expenses, stats]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        eyebrow="Temple Finance"
        title={`Good Morning, ${user?.name?.split(" ")[0] ?? "Admin"}`}
        subtitle={`Sri Temple Trust · ${today}`}
        rightBadge={unreadCount}
        onRightPress={() => navigation.navigate("AdminNotifications")}
      />
      <AdminScrollScreen refreshing={isLoading} onRefresh={refetch}>
        {isLoading && !stats ? (
          <>
            <SkeletonBlock height={150} />
            <SkeletonBlock height={220} />
          </>
        ) : (
          <>
            <FinancialSummaryCard
              total={formatCurrency(stats?.totalTempleFund ?? 0)}
              loaned={formatCurrency(stats?.totalLoanedAmount ?? 0)}
              available={formatCurrency(stats?.availableFund ?? 0)}
            />

            <SectionHeader
              title="Quick Actions"
              subtitle="Most used admin flows"
            />
            <View style={styles.actionsGrid}>
              <ActionTile
                label="Add Villager"
                icon="account-plus"
                onPress={() => navigation.navigate("AddVillager")}
              />
              <ActionTile
                label="Create Loan"
                icon="cash-plus"
                tone="success"
                onPress={() => navigation.navigate("CreateLoan")}
              />
              <ActionTile
                label="Add Expense"
                icon="receipt-plus"
                tone="warning"
                onPress={() => navigation.navigate("AddExpense")}
              />
              <ActionTile
                label="Send Notification"
                icon="bullhorn"
                tone="secondary"
                onPress={() => navigation.navigate("BroadcastNotification")}
              />
            </View>

            <SectionHeader
              title="Quick Statistics"
              subtitle="Live operating health"
            />
            <View style={styles.statsGrid}>
              <StatCard
                label="Active Loans"
                value={String(stats?.activeBorrowers ?? stats?.activeLoans ?? 0)}
                icon="handshake"
                tone="primary"
              />
              <StatCard
                label="Expected Return Amount"
                value={formatCurrency(stats?.expectedReturnAmount ?? 0)}
                icon="cash-check"
                tone="success"
              />
              <StatCard
                label="Distributed Amount"
                value={formatCurrency(stats?.distributedAmount ?? stats?.totalLoanedAmount ?? 0)}
                icon="cash-fast"
                tone="warning"
              />
              <StatCard
                label="3 Months Loans"
                value={String(stats?.threeMonthLoans ?? 0)}
                icon="timer-sand"
                tone="info"
              />
              <StatCard
                label="6 Months Loans"
                value={String(stats?.sixMonthLoans ?? 0)}
                icon="calendar-range"
                tone="secondary"
              />
            </View>

            {/* <SectionHeader
              title="Analytics"
              subtitle="Distribution and cash movement"
            /> */}
            {/* <SectionHeader title="Monthly Loan Distribution" />
            <MiniBarChart data={charts.loanBars} /> */}
            {/* <SectionHeader title="Expense Breakdown" /> */}
            {/* <MiniBarChart data={charts.expenseBars} tone="warning" /> */}
            {/* <View
              style={{
                backgroundColor: palette.surface,
                borderRadius: 20,
                marginHorizontal: 24,
                flexDirection: "row",
                gap: 24,
                alignItems: "center",
                boxSizing: "border-box",
              }}
            >
              <PieChart
                data={expenseDonutData}
                donut
                radius={80}
                innerRadius={50}
                showText
                textColor="black"
                textSize={12}
                centerLabelComponent={() => (
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ fontSize: 22, fontWeight: "bold" }}>
                      ₹
                      {expenseDonutData
                        .reduce((sum, item) => sum + item.value, 0)
                        .toLocaleString()}
                    </Text>
                    <Text style={{ color: "#666" }}>Expenses</Text>
                  </View>
                )}
              />

              <View style={{ marginTop: 20 }}>
                {expenseDonutData.map((item, index) => {
                  const total = expenseDonutData.reduce(
                    (sum, expense) => sum + expense.value,
                    0,
                  );

                  const percentage = ((item.value / total) * 100).toFixed(0);

                  return (
                    <View key={index} style={styles.legendRow}>
                      <View style={styles.leftSection}>
                        <View
                          style={[styles.dot, { backgroundColor: item.color }]}
                        />
                        <View
                          style={{
                            gap: 2,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            boxSizing: "border-box",
                            width: 120,
                          }}
                        >
                          <Text style={styles.label}>
                            {item.label || "N/A"}{" "}
                          </Text>
                          <Text style={styles.value}>
                            ₹{item.value.toLocaleString()} ({percentage}%)
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View> */}
            {/* <SectionHeader title="Cash Flow Trend" />
            <MiniBarChart
              data={[
                { label: "Fund", value: stats?.totalTempleFund ?? 0 },
                { label: "Loan", value: stats?.totalLoanedAmount ?? 0 },
                { label: "Cash", value: stats?.availableFund ?? 0 },
                { label: "Exp", value: stats?.totalExpenses ?? 0 },
              ]}
              tone="success"
            /> */}

            {/* <SectionHeader
              title="Recent Activity"
              subtitle="Operational timeline"
            />
            <TimelineCard
              items={[
                {
                  title: "New villager added",
                  subtitle: "Ready for loan onboarding",
                  icon: "account-plus",
                  tone: "success",
                },
                {
                  title: "Loan created",
                  subtitle: "Fund allocated from temple treasury",
                  icon: "cash-plus",
                  tone: "primary",
                },
                {
                  title: "Expense added",
                  subtitle: "Festival and operations ledger updated",
                  icon: "receipt",
                  tone: "warning",
                },
                {
                  title: "Loan closed",
                  subtitle: "Principal and interest reconciled",
                  icon: "check-decagram",
                  tone: "success",
                },
              ]}
            /> */}
          </>
        )}
      </AdminScrollScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#f4f9f5",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },

  amount: {
    fontSize: 22,
    fontWeight: "700",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 4,
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 14,
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },

  label: {
    fontSize: 10,
    color: "#334155",
  },

  value: {
    fontSize: 10,
    fontWeight: "600",
  },
});
