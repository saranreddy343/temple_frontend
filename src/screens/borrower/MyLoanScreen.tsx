import React, { memo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { loanAPI } from "../../api/loan.api";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  EmptyState,
  FilterChips,
  SkeletonBlock,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import { PremiumLoanCard } from "../../components/admin/AdminCards";
import { Loan } from "../../types";
import { Spacing } from "../../theme";

const STATUS_FILTERS: Array<{ label: string; value: string | null }> = [
  { label: "Active", value: "ACTIVE" },
  { label: "Due Soon", value: "DUE_SOON" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "All", value: null },
];

const LoanItem = memo(function LoanItem({ loan, onPress }: { loan: Loan; onPress: () => void }) {
  return <PremiumLoanCard loan={loan} onPress={onPress} />;
});

export default function MyLoanScreen() {
  const navigation = useNavigation<any>();
  const palette = useAdminPalette();
  const { user } = useSelector((s: RootState) => s.auth);
  const [statusFilter, setStatusFilter] = useState<string | null>("ACTIVE");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["myLoans", statusFilter],
    queryFn: () =>
      loanAPI.getAll({
        borrowerId: user?.id,
        ...(statusFilter ? { status: statusFilter } : {}),
        limit: 50,
      }),
  });

  const loans: Loan[] = data?.data?.data?.data ?? [];
  const canGoBack = navigation.canGoBack();

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        title="My Loans"
        subtitle="Your complete loan history"
        onBack={canGoBack ? () => navigation.goBack() : undefined}
      />
      <FilterChips
        items={STATUS_FILTERS}
        value={statusFilter}
        onChange={setStatusFilter}
      />
      {isLoading ? (
        <AdminScrollScreen>
          <SkeletonBlock height={160} />
          <SkeletonBlock height={160} />
          <SkeletonBlock height={160} />
        </AdminScrollScreen>
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          renderItem={({ item: loan }) => (
            <LoanItem
              loan={loan}
              onPress={() => navigation.navigate("LoanDetails", { loanId: loan.id })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="cash-multiple"
              title="No Loans Found"
              message={
                statusFilter
                  ? `You have no ${statusFilter.toLowerCase().replace("_", " ")} loans.`
                  : "You have no loans yet."
              }
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
});
