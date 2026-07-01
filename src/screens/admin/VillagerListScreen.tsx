import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { userAPI } from "../../api/user.api";
import { User } from "../../types";
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
import { VillagerCard } from "../../components/admin/AdminCards";
import AppFab from "../../components/admin/AppFab";

type VillagerFilter = "ALL" | "ACTIVE" | "INACTIVE" | "HAS_LOAN" | "OVERDUE";

const FILTERS: Array<{ label: string; value: VillagerFilter; icon: string }> = [
  { label: "All", value: "ALL", icon: "account-group" },
  { label: "Active", value: "ACTIVE", icon: "check-circle" },
  { label: "Inactive", value: "INACTIVE", icon: "close-circle" },
  { label: "Has Active Loan", value: "HAS_LOAN", icon: "cash" },
  { label: "Overdue Loans", value: "OVERDUE", icon: "alert-circle" },
];

export default function VillagerListScreen() {
  const navigation = useNavigation<any>();
  const palette = useAdminPalette();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<VillagerFilter>("ALL");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["villagers", search, filter],
    queryFn: () =>
      userAPI.getAll({
        search: search || undefined,
        isActive:
          filter === "ACTIVE"
            ? true
            : filter === "INACTIVE"
              ? false
              : undefined,
        limit: 80,
      }),
    placeholderData: keepPreviousData,
  });

  const villagers: User[] = data?.data?.data?.data ?? [];
  const summary = useMemo(
    () => ({
      total: villagers.length,
      active: villagers.filter((v) => v.isActive).length,
      inactive: villagers.filter((v) => !v.isActive).length,
    }),
    [villagers],
  );

  console.log("Villagers", villagers);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        eyebrow="People"
        title="Villager Directory"
        subtitle="Search, review borrowing posture, and take action quickly."
      />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name or mobile number"
      />
      <View>
        <FilterChips items={FILTERS} value={filter} onChange={setFilter} />
      </View>

      {/* <View style={styles.summaryGrid}>
        <StatCard
          label="Total Villagers"
          value={String(summary.total)}
          icon="account-group"
        />
        <StatCard
          label="Active Borrowers"
          value={String(summary.active)}
          icon="account-check"
          tone="success"
        />
        <StatCard
          label="Overdue Borrowers"
          value="0"
          icon="alert-circle"
          tone="danger"
        />
      </View> */}
      {/* <SectionHeader
        title="Villagers"
        subtitle="Premium borrower cards with quick actions"
      /> */}
      {isLoading && !data ? (
        <>
          <SkeletonBlock />
          <SkeletonBlock />
          <SkeletonBlock />
        </>
      ) : (
        <FlatList
          data={villagers}
          keyExtractor={(item) => item.id}
          style={{ paddingHorizontal: 18 }}
          renderItem={({ item }) => (
            <VillagerCard
              user={item}
              activeLoans={0}
              outstanding={0}
              dueStatus={item.isActive ? "ACTIVE" : "INACTIVE"}
              onPress={() =>
                navigation.navigate("VillagerDetails", { userId: item.id })
              }
              actions={[
                {
                  label: "View",
                  icon: "eye",
                  onPress: () =>
                    navigation.navigate("VillagerDetails", {
                      userId: item.id,
                    }),
                },
                {
                  label: "Edit",
                  icon: "pencil",
                  onPress: () =>
                    navigation.navigate("EditVillager", { userId: item.id }),
                },
                {
                  label: "Create Loan",
                  icon: "cash-plus",
                  onPress: () =>
                    navigation.navigate("CreateLoan", {
                      borrowerId: item.id,
                    }),
                },
              ]}
            />
          )}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <EmptyState
              title="No villagers found"
              message="Try a different search or add a new villager to start building the lending ledger."
              actionLabel="Add Villager"
              icon="account-plus"
              onAction={() => navigation.navigate("AddVillager")}
            />
          }
        />
      )}
      <AppFab icon="account-plus" label="Add Villager" onPress={() => navigation.navigate("AddVillager")} />
    </View>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  list: { paddingBottom: 120 },
});
