import React from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
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

const now = new Date();

export default function PrincipalCollectionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const palette = useAdminPalette();
  const loanId: string = route.params?.loanId;
  const queryClient = useQueryClient();

  const { data: loanRes } = useQuery({
    queryKey: ["loan", loanId],
    queryFn: () => loanAPI.getById(loanId),
    enabled: !!loanId,
  });
  const loan = loanRes?.data?.data;
  const remainingPrincipal = loan?.remainingPrincipal ?? loan?.remainingBalance ?? 0;

  const schema = Yup.object({
    amount: Yup.number().min(1, "Amount must be > 0").max(remainingPrincipal || Infinity, `Max ${formatCurrency(remainingPrincipal)}`).required("Amount is required"),
    paidDate: Yup.string().required("Payment date is required"),
    remarks: Yup.string().optional(),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: { amount: number; paidDate: string; remarks?: string }) =>
      loanAPI.collectPrincipal({ loanId, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loan", loanId] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      Alert.alert("Principal Collected", "Outstanding principal has been reconciled.", [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert("Unable to collect principal", err.response?.data?.message ?? "Please review the entry.");
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader eyebrow="Collection" title="Collect Principal" subtitle={loan ? `${loan.loanNumber} · ${loan.borrower?.name ?? "Borrower"}` : "Principal repayment capture"} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <AdminScrollScreen>
          <StepperShell steps={["Review", "Amount", "Confirm"]} activeStep={1} />
          <View style={styles.statsGrid}>
            <StatCard label="Remaining Principal" value={formatCurrency(remainingPrincipal)} icon="wallet-alert" tone="warning" />
            <StatCard label="Total Payable" value={formatCurrency(Number(loan?.totalPayable ?? 0))} icon="wallet-check" />
          </View>
          <SectionHeader title="Collection Details" subtitle="Capture amount, date, and remarks" />
          <Formik
            initialValues={{ amount: "", paidDate: now.toISOString().split("T")[0], remarks: "" }}
            validationSchema={schema}
            onSubmit={(values) => mutate({ amount: Number(values.amount), paidDate: values.paidDate, remarks: values.remarks.trim() || undefined })}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <DashboardCard>
                <Label text="Amount" />
                <TextInput value={values.amount} onChangeText={handleChange("amount")} onBlur={handleBlur("amount")} mode="outlined" placeholder={`Max ${formatCurrency(remainingPrincipal)}`} keyboardType="number-pad" left={<TextInput.Icon icon="currency-inr" />} error={touched.amount && !!errors.amount} />
                <HelperText type="error" visible={touched.amount && !!errors.amount}>{errors.amount as string}</HelperText>
                <Label text="Payment Date" />
                <TextInput value={values.paidDate} onChangeText={handleChange("paidDate")} mode="outlined" left={<TextInput.Icon icon="calendar" />} />
                <Label text="Remarks" optional />
                <TextInput value={values.remarks} onChangeText={handleChange("remarks")} mode="outlined" multiline numberOfLines={3} />
                <Button mode="contained" onPress={() => handleSubmit()} loading={isPending} disabled={isPending} style={styles.submit} contentStyle={styles.submitContent} buttonColor={palette.secondary}>
                  Confirm Principal Collection
                </Button>
              </DashboardCard>
            )}
          </Formik>
        </AdminScrollScreen>
      </KeyboardAvoidingView>
    </View>
  );
}

function Label({ text, optional }: { text: string; optional?: boolean }) {
  const palette = useAdminPalette();
  return <Text style={[styles.label, { color: palette.textSecondary }]}>{text}{optional ? " (optional)" : ""}</Text>;
}

const styles = StyleSheet.create({
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 18, marginTop: 16 },
  label: { fontSize: 12, fontWeight: "900", marginTop: 12, marginBottom: 7, textTransform: "uppercase" },
  submit: { marginTop: 20, borderRadius: 16 },
  submitContent: { height: 52 },
});
