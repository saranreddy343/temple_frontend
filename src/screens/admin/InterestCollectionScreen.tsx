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

const schema = Yup.object({
  month: Yup.number().min(1).max(12).required("Month is required"),
  year: Yup.number().min(2000).max(2100).required("Year is required"),
  paidDate: Yup.string().required("Payment date is required"),
  remarks: Yup.string().optional(),
});

const now = new Date();

export default function InterestCollectionScreen() {
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

  const { mutate, isPending } = useMutation({
    mutationFn: (values: { month: number; year: number; paidDate: string; remarks?: string }) =>
      loanAPI.collectInterest({ loanId, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loan", loanId] });
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      Alert.alert("Interest Collected", "The monthly interest ledger has been updated.", [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert("Unable to collect interest", err.response?.data?.message ?? "Please review the entry.");
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader eyebrow="Collection" title="Collect Interest" subtitle={loan ? `${loan.loanNumber} · ${loan.borrower?.name ?? "Borrower"}` : "Monthly interest capture"} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <AdminScrollScreen>
          <StepperShell steps={["Review", "Period", "Confirm"]} activeStep={1} />
          {loan ? (
            <View style={styles.statsGrid}>
              <StatCard label="Monthly Interest" value={formatCurrency(Number(loan.monthlyInterest))} icon="percent" tone="warning" />
              <StatCard label="Total Payable" value={formatCurrency(Number(loan.totalPayable))} icon="wallet" />
            </View>
          ) : null}
          <SectionHeader title="Collection Details" subtitle="Capture the period and payment date" />
          <Formik
            initialValues={{
              month: String(now.getMonth() + 1),
              year: String(now.getFullYear()),
              paidDate: now.toISOString().split("T")[0],
              remarks: "",
            }}
            validationSchema={schema}
            onSubmit={(values) => mutate({ ...values, month: Number(values.month), year: Number(values.year), remarks: values.remarks.trim() || undefined })}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <DashboardCard>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Label text="Month" />
                    <TextInput value={values.month} onChangeText={handleChange("month")} onBlur={handleBlur("month")} mode="outlined" keyboardType="number-pad" maxLength={2} error={touched.month && !!errors.month} />
                    <HelperText type="error" visible={touched.month && !!errors.month}>{errors.month}</HelperText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Label text="Year" />
                    <TextInput value={values.year} onChangeText={handleChange("year")} mode="outlined" keyboardType="number-pad" maxLength={4} />
                  </View>
                </View>
                <Label text="Payment Date" />
                <TextInput value={values.paidDate} onChangeText={handleChange("paidDate")} mode="outlined" left={<TextInput.Icon icon="calendar" />} />
                <Label text="Remarks" optional />
                <TextInput value={values.remarks} onChangeText={handleChange("remarks")} mode="outlined" multiline numberOfLines={3} />
                <Button mode="contained" onPress={() => handleSubmit()} loading={isPending} disabled={isPending} style={styles.submit} contentStyle={styles.submitContent} buttonColor={palette.secondary}>
                  Confirm Interest Collection
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
  row: { flexDirection: "row", gap: 12 },
  label: { fontSize: 12, fontWeight: "900", marginTop: 12, marginBottom: 7, textTransform: "uppercase" },
  submit: { marginTop: 20, borderRadius: 16 },
  submitContent: { height: 52 },
});
