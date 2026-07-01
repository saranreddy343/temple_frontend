import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loanAPI } from "../../api/loan.api";
import { formatCurrency } from "../../utils/formatters";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  DashboardCard,
  SectionHeader,
  StatCard,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import { StepperShell } from "../../components/admin/AdminCards";

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash", icon: "cash" },
  { value: "UPI", label: "UPI", icon: "qrcode" },
  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: "bank" },
  { value: "CHEQUE", label: "Cheque", icon: "checkbook" },
];

export default function CloseLoanScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const palette = useAdminPalette();
  const qc = useQueryClient();
  const loanId: string = route.params?.loanId;
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [remarks, setRemarks] = useState("");

  const { data: loanRes } = useQuery({
    queryKey: ["loan", loanId],
    queryFn: () => loanAPI.getById(loanId),
    enabled: !!loanId,
  });
  const loan = loanRes?.data?.data;

  const mutation = useMutation({
    mutationFn: () =>
      loanAPI.close(loanId, {
        paymentMethod,
        paymentDate: new Date().toISOString().split("T")[0],
        remarks: remarks.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["loans"] });
      qc.invalidateQueries({ queryKey: ["loan", loanId] });
      qc.invalidateQueries({ queryKey: ["adminStats"] });
      Alert.alert("Loan Closed", "Receipt has been captured and the ledger is reconciled.", [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert("Unable to close loan", err?.response?.data?.message ?? "Please try again.");
    },
  });

  const handleClose = () => {
    if (!loan) return;
    Alert.alert(
      "Confirm Closure",
      `Confirm receipt of ${formatCurrency(Number(loan.totalPayable))} via ${paymentMethod}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => mutation.mutate() },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader eyebrow="Repayment" title="Close Loan" subtitle={loan ? `${loan.loanNumber} · ${loan.borrower?.name ?? "Borrower"}` : "Final settlement"} onBack={() => navigation.goBack()} />
      <AdminScrollScreen>
        <StepperShell steps={["Review", "Payment", "Receipt"]} activeStep={1} />
        {loan ? (
          <>
            <SectionHeader title="Closure Summary" subtitle="Verify final receivable before marking paid" />
            <View style={styles.statsGrid}>
              <StatCard label="Principal" value={formatCurrency(Number(loan.principalAmount))} icon="cash" />
              <StatCard label="Interest" value={formatCurrency(Number(loan.totalInterest))} icon="percent" tone="warning" />
              <StatCard label="Total Payable" value={formatCurrency(Number(loan.totalPayable))} icon="wallet-check" tone="success" />
            </View>

            <SectionHeader title="Payment Method" subtitle="Capture settlement channel" />
            <View style={styles.methodGrid}>
              {PAYMENT_METHODS.map((method) => {
                const selected = paymentMethod === method.value;
                return (
                  <Pressable
                    key={method.value}
                    style={[styles.methodCard, { backgroundColor: selected ? `${palette.primary}14` : palette.surface, borderColor: selected ? palette.primary : palette.border }]}
                    onPress={() => setPaymentMethod(method.value)}
                  >
                    <MaterialCommunityIcons name={method.icon as never} size={24} color={selected ? palette.primary : palette.textMuted} />
                    <Text style={[styles.methodText, { color: selected ? palette.primary : palette.text }]}>{method.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <SectionHeader title="Receipt Notes" subtitle="Optional remarks for audit trail" />
            <DashboardCard>
              <TextInput mode="outlined" value={remarks} onChangeText={setRemarks} placeholder="Add collection notes" multiline numberOfLines={4} />
              <Button mode="contained" onPress={handleClose} loading={mutation.isPending} disabled={mutation.isPending} buttonColor={palette.success} style={styles.submit} contentStyle={styles.submitContent} icon="check-circle">
                Mark Loan as Closed
              </Button>
            </DashboardCard>
          </>
        ) : null}
      </AdminScrollScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 18 },
  methodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 24 },
  methodCard: { width: "47%", minHeight: 96, borderRadius: 20, borderWidth: 1, padding: 14, justifyContent: "space-between" },
  methodText: { fontSize: 13, fontWeight: "900" },
  submit: { marginTop: 20, borderRadius: 16 },
  submitContent: { height: 52 },
});
