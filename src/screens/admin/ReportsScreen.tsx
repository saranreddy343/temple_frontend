import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Buffer } from "buffer";
import { reportAPI } from "../../api/report.api";
import { formatCurrency } from "../../utils/formatters";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  DashboardCard,
  EmptyState,
  MiniBarChart,
  SectionHeader,
  SkeletonBlock,
  StatCard,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";

type ReportType = "loans" | "interest";
type ExportFormat = "pdf" | "excel";

export default function ReportsScreen() {
  const palette = useAdminPalette();
  const [reportType, setReportType] = useState<ReportType>("loans");
  const [loading, setLoading] = useState(false);

  const { data: loanReportRes, isLoading: loanLoading } = useQuery({
    queryKey: ["report", "loans"],
    queryFn: () => reportAPI.getLoanReport({ format: "json" }),
    enabled: reportType === "loans",
  });

  const { data: interestReportRes, isLoading: interestLoading } = useQuery({
    queryKey: ["report", "interest"],
    queryFn: () => reportAPI.getInterestReport({ format: "json" }),
    enabled: reportType === "interest",
  });

  const isLoading = reportType === "loans" ? loanLoading : interestLoading;
  const loanData = loanReportRes?.data?.data ?? [];
  const interestData = interestReportRes?.data?.data ?? [];

  const stats = useMemo(
    () =>
      reportType === "loans"
        ? {
            total: loanData.length,
            primary: loanData.filter((loan) => loan.status === "ACTIVE").length,
            secondary: loanData.filter((loan) => loan.status === "OVERDUE").length,
            amount: loanData.reduce((sum, loan) => sum + Number(loan.principalAmount ?? 0), 0),
          }
        : {
            total: interestData.length,
            primary: interestData.length,
            secondary: 0,
            amount: interestData.reduce((sum, item) => sum + Number(item.interestAmount ?? 0), 0),
          },
    [interestData, loanData, reportType],
  );

  const downloadReport = async (format: ExportFormat) => {
    setLoading(true);
    try {
      const response =
        reportType === "loans"
          ? await reportAPI.exportLoanReport(format)
          : await reportAPI.exportInterestReport("excel");
      const base64 = Buffer.from(response.data).toString("base64");
      const ext = format === "pdf" ? "pdf" : "xlsx";
      const mimeType =
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const filename = `${reportType}_report_${Date.now()}.${ext}`;

      if (format === "pdf") {
        await Print.printAsync({ uri: `data:application/pdf;base64,${base64}` });
      } else {
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Sharing.shareAsync(fileUri, { mimeType });
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert("Export failed", err.response?.data?.message ?? "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const chartData =
    reportType === "loans"
      ? [
          { label: "All", value: stats.total },
          { label: "Act", value: stats.primary },
          { label: "Ovd", value: stats.secondary },
        ]
      : [
          { label: "Cnt", value: stats.total },
          { label: "Int", value: Math.max(stats.amount / 1000, 1) },
          { label: "Net", value: Math.max(stats.amount / 2000, 1) },
        ];

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        eyebrow="Insights"
        title="Reports Studio"
        subtitle="Export audit-ready ledgers and review trust-level performance."
      />
      <AdminScrollScreen>
        <SectionHeader title="Report Type" subtitle="Choose the dataset to analyze" />
        <View style={styles.typeGrid}>
          <TypeCard label="Loan Report" icon="cash-multiple" selected={reportType === "loans"} onPress={() => setReportType("loans")} />
          <TypeCard label="Interest Report" icon="percent" selected={reportType === "interest"} onPress={() => setReportType("interest")} />
        </View>

        {isLoading ? (
          <>
            <SkeletonBlock />
            <SkeletonBlock />
          </>
        ) : stats.total === 0 ? (
          <EmptyState title="No report data" message="Data will appear here once loans or collections are recorded." icon="chart-box-outline" />
        ) : (
          <>
            <SectionHeader title="Summary" subtitle="Current report snapshot" />
            <View style={styles.summaryGrid}>
              <StatCard label={reportType === "loans" ? "Total Loans" : "Collections"} value={String(stats.total)} icon="format-list-numbered" />
              <StatCard label={reportType === "loans" ? "Active" : "Interest Rows"} value={String(stats.primary)} icon="check-circle" tone="success" />
              <StatCard label={reportType === "loans" ? "Total Principal" : "Collected"} value={formatCurrency(stats.amount)} icon="wallet" tone="warning" />
            </View>
            <SectionHeader title="Report Shape" subtitle="Quick visual read" />
            <MiniBarChart data={chartData} tone={reportType === "loans" ? "primary" : "warning"} />
          </>
        )}

        <SectionHeader title="Export" subtitle="PDF for printing, Excel for reconciliation" />
        <DashboardCard>
          <ExportRow
            title="Export as PDF"
            subtitle={reportType === "loans" ? "Print-ready report" : "PDF export is available for loan reports only"}
            icon="file-pdf-box"
            disabled={loading || reportType === "interest"}
            onPress={() => downloadReport("pdf")}
          />
          <ExportRow
            title="Export as Excel"
            subtitle="Spreadsheet with all visible records"
            icon="microsoft-excel"
            disabled={loading}
            onPress={() => downloadReport("excel")}
          />
        </DashboardCard>
      </AdminScrollScreen>
    </View>
  );
}

function TypeCard({ label, icon, selected, onPress }: { label: string; icon: string; selected: boolean; onPress: () => void }) {
  const palette = useAdminPalette();
  return (
    <Pressable onPress={onPress} style={[styles.typeCard, { backgroundColor: selected ? `${palette.primary}14` : palette.surface, borderColor: selected ? palette.primary : palette.border }]}>
      <MaterialCommunityIcons name={icon as never} size={26} color={selected ? palette.primary : palette.textMuted} />
      <Text style={[styles.typeLabel, { color: selected ? palette.primary : palette.text }]}>{label}</Text>
    </Pressable>
  );
}

function ExportRow({ title, subtitle, icon, disabled, onPress }: { title: string; subtitle: string; icon: string; disabled?: boolean; onPress: () => void }) {
  const palette = useAdminPalette();
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.exportRow, { opacity: disabled ? 0.45 : 1 }]}>
      <View style={[styles.exportIcon, { backgroundColor: `${palette.primary}14` }]}>
        <MaterialCommunityIcons name={icon as never} size={26} color={palette.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.exportTitle, { color: palette.text }]}>{title}</Text>
        <Text style={[styles.exportSub, { color: palette.textMuted }]}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={palette.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  typeGrid: { flexDirection: "row", gap: 12, paddingHorizontal: 24 },
  typeCard: { flex: 1, minHeight: 104, borderRadius: 22, borderWidth: 1, padding: 16, justifyContent: "space-between" },
  typeLabel: { fontSize: 14, fontWeight: "900" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 18 },
  exportRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  exportIcon: { width: 48, height: 48, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  exportTitle: { fontSize: 15, fontWeight: "900" },
  exportSub: { fontSize: 12, marginTop: 4 },
});
