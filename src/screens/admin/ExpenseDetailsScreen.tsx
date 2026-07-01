import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { expenseAPI } from "../../api/expense.api";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  DashboardCard,
  EmptyState,
  SectionHeader,
  SkeletonBlock,
  TimelineCard,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";

export default function ExpenseDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const palette = useAdminPalette();
  const expenseId: string = route.params?.expenseId;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["expense", expenseId],
    queryFn: () => expenseAPI.getById(expenseId),
    enabled: !!expenseId,
  });

  const expense = data?.data?.data;
  const color = categoryColor(expense?.category);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        eyebrow="Expense Detail"
        title={expense?.title ?? "Expense"}
        subtitle={expense ? `${expense.category.replace("_", " ")} · ${formatDate(expense.expenseDate)}` : "Ledger record"}
        onBack={() => navigation.goBack()}
      />
      <AdminScrollScreen refreshing={isLoading} onRefresh={refetch}>
        {isLoading ? (
          <>
            <SkeletonBlock height={180} />
            <SkeletonBlock height={220} />
          </>
        ) : !expense ? (
          <EmptyState title="Expense not found" message="This ledger entry could not be loaded." icon="alert-circle" />
        ) : (
          <>
            <DashboardCard>
              <View style={styles.heroAmount}>
                <View style={[styles.categoryIcon, { backgroundColor: `${color}16` }]}>
                  <MaterialCommunityIcons name={categoryIcon(expense.category) as never} size={32} color={color} />
                </View>
                <Text style={[styles.amount, { color: palette.text }]}>{formatCurrency(Number(expense.amount))}</Text>
                <Text style={[styles.category, { color }]}>{expense.category.replace("_", " ")}</Text>
              </View>
            </DashboardCard>

            <SectionHeader title="Receipt Image" subtitle="Attachment preview" />
            <DashboardCard>
              <View style={[styles.receiptPlaceholder, { backgroundColor: `${palette.primary}10`, borderColor: palette.border }]}>
                <MaterialCommunityIcons name="image-outline" size={34} color={palette.primary} />
                <Text style={[styles.receiptText, { color: palette.textMuted }]}>
                  {expense.receiptImage ? "Receipt image attached" : "No receipt image uploaded"}
                </Text>
              </View>
            </DashboardCard>

            <SectionHeader title="Expense Details" />
            <DashboardCard>
              <Info label="Title" value={expense.title} />
              <Info label="Created By" value={expense.creator?.name ?? "Temple Admin"} />
              <Info label="Expense Date" value={formatDate(expense.expenseDate)} />
              <Info label="Description" value={expense.description ?? "No additional notes"} />
            </DashboardCard>

            <SectionHeader title="Expense Timeline" />
            <TimelineCard
              items={[
                { title: "Expense recorded", subtitle: formatDate(expense.createdAt), icon: "receipt-plus", tone: "primary" },
                { title: "Category assigned", subtitle: expense.category.replace("_", " "), icon: categoryIcon(expense.category), tone: "warning" },
                { title: "Ledger updated", subtitle: "Temple operating expenses recalculated", icon: "chart-timeline", tone: "success" },
              ]}
            />
          </>
        )}
      </AdminScrollScreen>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  const palette = useAdminPalette();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: palette.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

const categoryColor = (category?: string) => {
  const map: Record<string, string> = {
    FESTIVAL: "#F59E0B",
    MAINTENANCE: "#6366F1",
    DECORATION: "#EC4899",
    ELECTRICITY: "#EAB308",
    WATER: "#06B6D4",
    ANNADANAM: "#22C55E",
    SALARY: "#3B82F6",
    MISCELLANEOUS: "#64748B",
  };
  return map[category ?? ""] ?? "#5EBEA5";
};

const categoryIcon = (category?: string) => {
  const map: Record<string, string> = {
    FESTIVAL: "party-popper",
    MAINTENANCE: "tools",
    DECORATION: "flower",
    ELECTRICITY: "lightning-bolt",
    WATER: "water",
    ANNADANAM: "food",
    SALARY: "account-cash",
    MISCELLANEOUS: "dots-horizontal",
  };
  return map[category ?? ""] ?? "receipt";
};

const styles = StyleSheet.create({
  heroAmount: { alignItems: "center", paddingVertical: 8 },
  categoryIcon: { width: 80, height: 80, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  amount: { fontSize: 34, fontWeight: "900", marginTop: 18 },
  category: { fontSize: 13, fontWeight: "900", marginTop: 8, textTransform: "uppercase" },
  receiptPlaceholder: { height: 160, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  receiptText: { fontSize: 13, fontWeight: "800" },
  infoRow: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E2E8F0" },
  infoLabel: { fontSize: 12, fontWeight: "800", marginBottom: 5 },
  infoValue: { fontSize: 14, fontWeight: "800", lineHeight: 20 },
});
