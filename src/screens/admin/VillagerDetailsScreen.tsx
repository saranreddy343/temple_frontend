import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { userAPI } from "../../api/user.api";
import { loanAPI } from "../../api/loan.api";
import { formatCurrency, maskMobile } from "../../utils/formatters";
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
import { PremiumLoanCard } from "../../components/admin/AdminCards";

export default function VillagerDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const palette = useAdminPalette();
  const userId = route.params?.userId as string;

  const { data: userRes, isLoading, refetch } = useQuery({
    queryKey: ["villager", userId],
    queryFn: () => userAPI.getById(userId),
    enabled: !!userId,
  });

  const { data: loanRes } = useQuery({
    queryKey: ["villagerLoans", userId],
    queryFn: () => loanAPI.getAll({ borrowerId: userId, limit: 20 }),
    enabled: !!userId,
  });

  const user = userRes?.data?.data;
  const loans = loanRes?.data?.data?.data ?? [];
  const activeLoans = loans.filter((loan) => ["ACTIVE", "DUE_SOON", "OVERDUE"].includes(loan.status));
  const threeMonthLoans = activeLoans.filter((loan) => Number(loan.durationMonths) === 3);
  const sixMonthLoans = activeLoans.filter((loan) => Number(loan.durationMonths) === 6);
  const outstanding3 = threeMonthLoans.reduce((sum, loan) => sum + Number(loan.remainingBalance ?? loan.totalPayable ?? 0), 0);
  const outstanding6 = sixMonthLoans.reduce((sum, loan) => sum + Number(loan.remainingBalance ?? loan.totalPayable ?? 0), 0);
  const outstanding = outstanding3 + outstanding6;

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        eyebrow="Villager Profile"
        title={user?.name ?? "Villager"}
        subtitle={user?.mobile ? `${maskMobile(user.mobile)} · ${user.isActive ? "Active" : "Inactive"}` : "Profile intelligence"}
        onBack={() => navigation.goBack()}
      />
      <AdminScrollScreen refreshing={isLoading} onRefresh={refetch}>
        {isLoading || !user ? (
          <>
            <SkeletonBlock height={160} />
            <SkeletonBlock height={220} />
          </>
        ) : (
          <>
            <DashboardCard>
              <View style={styles.profileRow}>
                <View style={[styles.avatar, { backgroundColor: `${palette.primary}18` }]}>
                  <Text style={[styles.avatarText, { color: palette.primary }]}>
                    {user.name
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: palette.text }]}>{user.name}</Text>
                  <Text style={[styles.meta, { color: palette.textMuted }]}>+91 {user.mobile}</Text>
                  <Text style={[styles.meta, { color: palette.textMuted }]}>{user.address ?? "Address not provided"}</Text>
                </View>
              </View>
            </DashboardCard>

            <SectionHeader title="Statistics" subtitle="Borrower lifecycle at a glance" />
            <View style={styles.statsGrid}>
              <StatCard label="3 Months Loans" value={String(threeMonthLoans.length)} icon="timer-sand" tone="info" />
              <StatCard label="6 Months Loans" value={String(sixMonthLoans.length)} icon="calendar-range" tone="secondary" />
              <StatCard label="Outstanding (3M)" value={formatCurrency(outstanding3)} icon="wallet" tone="primary" />
              <StatCard label="Outstanding (6M)" value={formatCurrency(outstanding6)} icon="wallet-outline" tone="warning" />
              <StatCard label="Total Outstanding" value={formatCurrency(outstanding)} icon="wallet-alert" tone="danger" />
            </View>

            <SectionHeader title="Loan Timeline" />
            {loans.length > 0 ? (
              loans.slice(0, 4).map((loan) => (
                <PremiumLoanCard
                  key={loan.id}
                  loan={loan}
                  borrowerName={user.name}
                  onPress={() => navigation.navigate("LoanDetails", { loanId: loan.id })}
                  actions={[
                    { label: "View", icon: "eye", onPress: () => navigation.navigate("LoanDetails", { loanId: loan.id }) },
                    { label: "Edit", icon: "pencil", onPress: () => navigation.navigate("EditLoan", { loanId: loan.id }) },
                    { label: "Complete", icon: "check-decagram", onPress: () => navigation.navigate("CloseLoan", { loanId: loan.id }) },
                  ]}
                />
              ))
            ) : (
              <EmptyState
                title="No loan history yet"
                message="Create the first loan to start this villager's financial timeline."
                actionLabel="Create Loan"
                onAction={() => navigation.navigate("CreateLoan", { borrowerId: user.id })}
                icon="cash-plus"
              />
            )}

            <SectionHeader title="Payment History" />
            <TimelineCard
              items={[
                { title: "Payment records", subtitle: "Detailed payment entries appear after loan collections.", icon: "cash-check", tone: "success" },
                { title: "Receipts", subtitle: "Receipt and collector details are available inside each loan.", icon: "receipt", tone: "primary" },
              ]}
            />

            <SectionHeader title="Notification & Activity History" />
            <TimelineCard
              items={[
                { title: "Notification profile", subtitle: "Broadcast and borrower-specific messages will be tracked here.", icon: "bell", tone: "primary" },
                { title: "Activity audit", subtitle: "Profile updates, loans, and collections form a complete trust ledger.", icon: "timeline-clock", tone: "secondary" },
              ]}
            />
          </>
        )}
      </AdminScrollScreen>
      {user ? (
        <View style={[styles.stickyBar, { backgroundColor: palette.surface, borderColor: palette.border }]}>
          <StickyAction label="Loan" icon="cash-plus" onPress={() => navigation.navigate("CreateLoan", { borrowerId: user.id })} />
          <StickyAction label="Edit" icon="pencil" onPress={() => navigation.navigate("EditVillager", { userId: user.id })} />
          <StickyAction label="Notify" icon="bell-plus" onPress={() => navigation.navigate("BroadcastNotification", { targetUserId: user.id })} />
        </View>
      ) : null}
    </View>
  );
}

function StickyAction({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  const palette = useAdminPalette();
  return (
    <Pressable onPress={onPress} style={[styles.stickyAction, { backgroundColor: `${palette.primary}12` }]}>
      <MaterialCommunityIcons name={icon as never} size={19} color={palette.primary} />
      <Text style={[styles.stickyLabel, { color: palette.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 24, fontWeight: "900" },
  name: { fontSize: 21, fontWeight: "900" },
  meta: { fontSize: 13, marginTop: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 18 },
  stickyBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    padding: 10,
    flexDirection: "row",
    gap: 8,
  },
  stickyAction: { flex: 1, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  stickyLabel: { fontSize: 12, fontWeight: "900" },
});
