import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { expenseAPI } from "../../api/expense.api";
import { Expense, ExpenseCategory } from "../../types";
import {
  AdminHeroHeader,
  EmptyState,
  FilterChips,
  SectionHeader,
  SkeletonBlock,
  StatCard,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import { PremiumExpenseCard } from "../../components/admin/AdminCards";
import { formatCurrency } from "../../utils/formatters";
import { RootState } from "../../store";
import AppFab from "../../components/admin/AppFab";

const CATEGORY_FILTERS: Array<{
  label: string;
  value: ExpenseCategory | undefined;
  icon: string;
}> = [
  { label: "All", value: undefined, icon: "view-grid" },
  { label: "Festivals", value: "FESTIVAL", icon: "party-popper" },
  { label: "Maintenance", value: "MAINTENANCE", icon: "tools" },
  { label: "Utilities", value: "ELECTRICITY", icon: "lightning-bolt" },
  { label: "Salaries", value: "SALARY", icon: "account-cash" },
  { label: "Misc", value: "MISCELLANEOUS", icon: "dots-horizontal" },
];

export default function ExpenseListScreen() {
  const navigation = useNavigation<any>();
  const palette = useAdminPalette();
  const [category, setCategory] = useState<ExpenseCategory | undefined>();
  const now = new Date();
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "ADMIN";

  const { data: summaryRes } = useQuery({
    queryKey: ["expenseSummary", now.getFullYear(), now.getMonth() + 1],
    queryFn: () => expenseAPI.getSummary(now.getFullYear(), now.getMonth() + 1),
  });

  const { data, isLoading, refetch, fetchNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["expenses", category],
      queryFn: ({ pageParam }) =>
        expenseAPI.getAll({ category, page: pageParam, limit: 20 }),
      initialPageParam: 1,
      getNextPageParam: (last) => {
        const d = last.data?.data;
        if (!d) return undefined;
        const loaded = d.page * d.limit;
        return loaded < d.count ? d.page + 1 : undefined;
      },
    });

  const allExpenses: Expense[] =
    data?.pages.flatMap((p) => p.data?.data?.rows ?? []) ?? [];
  const summary = summaryRes?.data?.data;
  const categoryTotal = useMemo(
    () =>
      Object.entries(summary?.byCategory ?? {}).reduce(
        (max, [, value]) => Math.max(max, Number(value)),
        0,
      ),
    [summary],
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        eyebrow="Expenses"
        title={isAdmin ? "Temple Expense Hub" : "Temple Expense History"}
        subtitle={isAdmin ? "Track spending categories, approvals, and operational burn." : "Review temple spending with a simple, read-only ledger."}
      />
      {/* <View style={styles.summaryGrid}>
        <StatCard label="Monthly Expenses" value={formatCurrency(summary?.total ?? 0)} icon="calendar-month" tone="warning" />
        <StatCard label="Annual Expenses" value={formatCurrency((summary?.total ?? 0) * 12)} icon="chart-timeline" tone="secondary" />
        <StatCard label="Festival Expenses" value={formatCurrency(summary?.byCategory?.FESTIVAL ?? categoryTotal)} icon="party-popper" tone="primary" />
      </View> */}
      <SectionHeader
        title="Expense Categories"
        subtitle="Filter by operating area"
        action={isAdmin ? "Add" : undefined}
        onAction={isAdmin ? () => navigation.navigate("AddExpense") : undefined}
      />
      <View>
        <FilterChips
          items={CATEGORY_FILTERS}
          value={category}
          onChange={setCategory}
        />
      </View>
      {/* <SectionHeader
        title="Expense Ledger"
        subtitle={`${allExpenses.length} records loaded`}
      /> */}
      {isLoading && !data ? (
        <>
          <SkeletonBlock />
          <SkeletonBlock />
          <SkeletonBlock />
        </>
      ) : (
        <FlatList
          data={allExpenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PremiumExpenseCard
              expense={item}
              onPress={() =>
                navigation.navigate("ExpenseDetails", { expenseId: item.id })
              }
            />
          )}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <EmptyState
              title="No expenses recorded"
              message="Add a temple expense with category, amount, date, and notes."
              actionLabel="Add Expense"
              icon="receipt-plus"
              onAction={() => navigation.navigate("AddExpense")}
            />
          }
        />
      )}
      {isAdmin ? <AppFab icon="receipt-plus" label="Add Expense" onPress={() => navigation.navigate("AddExpense")} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 18,
    marginTop: 16,
  },
  list: { paddingBottom: 120 },
});
