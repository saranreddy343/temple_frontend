import React, { useMemo, useRef, useState, useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { loanAPI } from "../../api/loan.api";
import { LoanStatus } from "../../types";
import {
  AdminHeroHeader,
  EmptyState,
  FilterChips,
  SearchBar,
  SectionHeader,
  SkeletonBlock,
  StatCard,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import { PremiumLoanCard } from "../../components/admin/AdminCards";
import AppFab from "../../components/admin/AppFab";

const FILTERS: Array<{
  label: string;
  value: LoanStatus | undefined;
  icon: string;
}> = [
  { label: "All", value: undefined, icon: "view-grid" },
  { label: "Active", value: "ACTIVE", icon: "handshake" },
  { label: "Due Soon", value: "DUE_SOON", icon: "calendar-clock" },
  { label: "Overdue", value: "OVERDUE", icon: "alert-circle" },
  { label: "Completed", value: "COMPLETED", icon: "check-circle" },
];

export default function LoanListScreen() {
  const navigation = useNavigation<any>();
  const palette = useAdminPalette();
  const [status, setStatus] = useState<LoanStatus | undefined>(undefined);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(
      () => setDebouncedSearch(searchText.trim()),
      350,
    );
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchText]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["loans", status, debouncedSearch],
    queryFn: () =>
      loanAPI.getAll({
        status,
        search: debouncedSearch || undefined,
        limit: 100,
      }),
    placeholderData: keepPreviousData,
  });

  const loans = data?.data?.data?.data ?? [];
  const summary = useMemo(
    () => ({
      active: loans.filter((loan) => loan.status === "ACTIVE").length,
      due: loans.filter((loan) => loan.status === "DUE_SOON").length,
      overdue: loans.filter((loan) => loan.status === "OVERDUE").length,
    }),
    [loans],
  );

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        eyebrow="Lending"
        title="Loan Command Center"
        subtitle="Monitor dues, risk, repayments, and borrower commitments."
      />
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search borrower or loan number"
      />
      <View>
        <FilterChips items={FILTERS} value={status} onChange={setStatus} />
      </View>
      {/* <View style={styles.summaryGrid}>
        <StatCard label="Active" value={String(summary.active)} icon="handshake" />
        <StatCard label="Due Soon" value={String(summary.due)} icon="calendar-clock" tone="warning" />
        <StatCard label="Overdue" value={String(summary.overdue)} icon="alert-circle" tone="danger" />
      </View> */}
      {/* <SectionHeader
        title="Loan Portfolio"
        subtitle={`${loans.length} loans visible`}
        action="New Loan"
        onAction={() => navigation.navigate("CreateLoan")}
      /> */}
      {isLoading && !data ? (
        <>
          <SkeletonBlock />
          <SkeletonBlock />
          <SkeletonBlock />
        </>
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => item.id}
          style={{ paddingHorizontal: 18 }}
          renderItem={({ item }) => (
            <PremiumLoanCard
              loan={item}
              onPress={() =>
                navigation.navigate("LoanDetails", { loanId: item.id })
              }
              actions={[
                {
                  label: "View",
                  icon: "eye",
                  onPress: () => navigation.navigate("LoanDetails", { loanId: item.id }),
                },
                {
                  label: "Edit",
                  icon: "pencil",
                  onPress: () => navigation.navigate("EditLoan", { loanId: item.id }),
                },
                {
                  label: "Mark Completed",
                  icon: "check-decagram",
                  onPress: () => navigation.navigate("CloseLoan", { loanId: item.id }),
                },
              ]}
            />
          )}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <EmptyState
              title="No loans match this view"
              message="Create a loan or adjust filters to review borrower commitments."
              actionLabel="Create Loan"
              icon="cash-plus"
              onAction={() => navigation.navigate("CreateLoan")}
            />
          }
        />
      )}
      <AppFab icon="cash-plus" label="Add Loan" onPress={() => navigation.navigate("CreateLoan")} />
    </View>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 18,
  },
  list: { paddingBottom: 120 },
});
