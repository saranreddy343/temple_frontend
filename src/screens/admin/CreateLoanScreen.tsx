import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import { loanAPI } from "../../api/loan.api";
import { userAPI } from "../../api/user.api";
import { User } from "../../types";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  DashboardCard,
  SectionHeader,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import { StepperShell } from "../../components/admin/AdminCards";
import { formatCurrency } from "../../utils/formatters";

const schema = Yup.object({
  borrowerId: Yup.string().required("Select a borrower"),
  principalAmount: Yup.number()
    .min(1000, "Min ₹1,000")
    .required("Principal amount is required"),
  interestRate: Yup.number()
    .min(0.1)
    .max(100)
    .required("Interest rate is required"),
  loanNumber: Yup.string().optional(),
  bondNumber: Yup.string().optional(),
  durationMonths: Yup.number().oneOf([3, 6], "Choose 3 or 6 months").required("Duration is required"),
  loanDate: Yup.string().required("Loan date is required"),
  remarks: Yup.string().optional(),
});

const today = new Date().toISOString().split("T")[0];

export default function CreateLoanScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const palette = useAdminPalette();
  const queryClient = useQueryClient();
  const [borrowerSearch, setBorrowerSearch] = useState("");
  const [selectedBorrower, setSelectedBorrower] = useState<User | null>(null);

  const routeBorrowerId = route.params?.borrowerId as string | undefined;
  const editLoanId = route.params?.loanId as string | undefined;
  const isEdit = Boolean(editLoanId);

  const { data: editLoanRes } = useQuery({
    queryKey: ["loan", editLoanId],
    queryFn: () => loanAPI.getById(editLoanId as string),
    enabled: isEdit,
  });
  const editLoan = editLoanRes?.data?.data;

  const { data: routeBorrowerRes } = useQuery({
    queryKey: ["villager", routeBorrowerId],
    queryFn: () => userAPI.getById(routeBorrowerId as string),
    enabled: !!routeBorrowerId,
  });

  useEffect(() => {
    if (editLoan?.borrower) {
      setSelectedBorrower(editLoan.borrower);
      setBorrowerSearch(editLoan.borrower.name);
    } else if (routeBorrowerRes?.data?.data) {
      setSelectedBorrower(routeBorrowerRes.data.data);
      setBorrowerSearch(routeBorrowerRes.data.data.name);
    }
  }, [routeBorrowerRes, editLoan]);

  const { data: usersRes, isFetching: isSearching } = useQuery({
    queryKey: ["borrowerSearch", borrowerSearch],
    queryFn: () =>
      userAPI.getAll({ search: borrowerSearch, isActive: true, limit: 8 }),
    enabled: borrowerSearch.length >= 2 && !selectedBorrower,
  });

  const borrowers = usersRes?.data?.data?.data ?? [];

  const { mutate, isPending } = useMutation({
    mutationFn: (values: {
      borrowerId: string;
      loanNumber?: string;
      bondNumber?: string;
      principalAmount: number;
      interestRate: number;
      durationMonths: number;
      loanDate: string;
      remarks?: string;
    }) => isEdit ? loanAPI.update(editLoanId as string, values) : loanAPI.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      Alert.alert(
        isEdit ? "Loan Updated" : "Loan Created",
        isEdit ? "The revised loan terms have been saved." : "Funds have been allocated and the loan is now active.",
        [{ text: "Done", onPress: () => navigation.goBack() }],
      );
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert(
        isEdit ? "Unable to update loan" : "Unable to create loan",
        err.response?.data?.message ?? "Please review the loan details.",
      );
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        eyebrow="Loan Origination"
        title={isEdit ? "Edit Loan" : "Create Loan"}
        subtitle={isEdit ? "Update amount, duration, bond number, and remarks." : "A guided sanction flow with clear fund and borrower context."}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <AdminScrollScreen>
          <StepperShell
            steps={["Borrower", "Terms", "Review"]}
            activeStep={1}
          />
          <Formik
            initialValues={{
              borrowerId: editLoan?.borrowerId ?? routeBorrowerId ?? "",
              loanNumber: editLoan?.loanNumber ?? "",
              bondNumber: editLoan?.bondNumber ?? "",
              principalAmount: editLoan ? String(Number(editLoan.principalAmount)) : "",
              interestRate: editLoan ? String(Number(editLoan.interestRate)) : "2",
              durationMonths: editLoan ? String(editLoan.durationMonths) : "3",
              loanDate: editLoan?.loanDate ?? today,
              remarks: editLoan?.remarks ?? "",
            }}
            enableReinitialize
            validationSchema={schema}
            onSubmit={(values) =>
              mutate({
                borrowerId: values.borrowerId,
                loanNumber: values.loanNumber?.trim() || undefined,
                bondNumber: values.bondNumber?.trim() || undefined,
                principalAmount: Number(values.principalAmount),
                interestRate: Number(values.interestRate),
                durationMonths: Number(values.durationMonths),
                loanDate: values.loanDate,
                remarks: values.remarks.trim() || undefined,
              })
            }
          >
            {({
              handleChange,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => {
              const monthlyInterest =
                values.principalAmount && values.interestRate
                  ? (Number(values.principalAmount) *
                      Number(values.interestRate)) /
                    100
                  : 0;
              const totalInterest = monthlyInterest * Number(values.durationMonths || 0);
              const dueDate = values.loanDate
                ? new Date(new Date(values.loanDate).setMonth(new Date(values.loanDate).getMonth() + Number(values.durationMonths || 0)))
                : null;

              return (
                <>
                  <SectionHeader
                    title="Borrower"
                    subtitle="Select an active villager"
                  />
                  <DashboardCard>
                    <Label text="Borrower Search" />
                    <TextInput
                      disabled={isEdit}
                      value={selectedBorrower ? `${selectedBorrower.name} · +91 ${selectedBorrower.mobile}` : borrowerSearch}
                      onChangeText={(text) => {
                        setSelectedBorrower(null);
                        setFieldValue("borrowerId", "");
                        setBorrowerSearch(text);
                      }}
                      mode="outlined"
                      placeholder="Search name or mobile"
                      left={<TextInput.Icon icon="account-search" />}
                      right={
                        selectedBorrower ? (
                          <TextInput.Icon
                            icon="close-circle"
                            onPress={() => {
                              setSelectedBorrower(null);
                              setBorrowerSearch("");
                              setFieldValue("borrowerId", "");
                            }}
                          />
                        ) : undefined
                      }
                      error={touched.borrowerId && !!errors.borrowerId}
                    />
                    <HelperText
                      type="error"
                      visible={touched.borrowerId && !!errors.borrowerId}
                    >
                      {errors.borrowerId}
                    </HelperText>
                    {!isEdit && !selectedBorrower && isSearching && borrowerSearch.length >= 2 ? (
                      <Text style={[styles.borrowerMobile, { color: palette.textMuted }]}>Searching…</Text>
                    ) : !isEdit && !selectedBorrower && !isSearching && borrowers.length === 0 && borrowerSearch.length >= 2 ? (
                      <Text style={[styles.borrowerMobile, { color: palette.textMuted }]}>No active borrower found for this search.</Text>
                    ) : null}
                    {!isEdit && !selectedBorrower &&
                      borrowers.map((borrower) => (
                        <Pressable
                          key={borrower.id}
                          style={[
                            styles.borrowerOption,
                            { borderColor: palette.border },
                          ]}
                          onPress={() => {
                            setSelectedBorrower(borrower);
                            setBorrowerSearch(borrower.name);
                            setFieldValue("borrowerId", borrower.id);
                          }}
                        >
                          <Text
                            style={[
                              styles.borrowerName,
                              { color: palette.text },
                            ]}
                          >
                            {borrower.name}
                          </Text>
                          <Text
                            style={[
                              styles.borrowerMobile,
                              { color: palette.textMuted },
                            ]}
                          >
                            +91 {borrower.mobile}
                          </Text>
                        </Pressable>
                      ))}
                  </DashboardCard>

                  <SectionHeader
                    title="Loan Terms"
                    subtitle="Principal, rate, duration, and sanction date"
                  />
                  <DashboardCard>
                    <Label text="Bond ID / Loan ID" optional />
                    <TextInput
                      value={values.bondNumber}
                      onChangeText={handleChange("bondNumber")}
                      mode="outlined"
                      placeholder="Bond register number"
                      left={<TextInput.Icon icon="identifier" />}
                    />

                    <Label text="Principal Amount" />
                    <TextInput
                      value={values.principalAmount}
                      onChangeText={handleChange("principalAmount")}
                      mode="outlined"
                      keyboardType="number-pad"
                      left={<TextInput.Icon icon="currency-inr" />}
                      error={
                        touched.principalAmount && !!errors.principalAmount
                      }
                    />
                    <HelperText
                      type="error"
                      visible={
                        touched.principalAmount && !!errors.principalAmount
                      }
                    >
                      {errors.principalAmount}
                    </HelperText>
                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Label text="Rate / month" />
                        <TextInput
                          value={values.interestRate}
                          onChangeText={handleChange("interestRate")}
                          mode="outlined"
                          keyboardType="decimal-pad"
                          left={<TextInput.Icon icon="percent" />}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Label text="Duration" />
                        <View style={styles.durationRow}>
                          {[3, 6].map((months) => {
                            const active = Number(values.durationMonths) === months;
                            return (
                              <Pressable
                                key={months}
                                onPress={() => setFieldValue("durationMonths", String(months))}
                                style={[styles.durationChip, { borderColor: active ? palette.primary : palette.border, backgroundColor: active ? `${palette.primary}14` : palette.surface }]}
                              >
                                <Text style={[styles.durationText, { color: active ? palette.primary : palette.textSecondary }]}>{months} mo</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                    <Label text="Loan Date" />
                    <TextInput
                      value={values.loanDate}
                      onChangeText={handleChange("loanDate")}
                      mode="outlined"
                      left={<TextInput.Icon icon="calendar" />}
                    />
                    <Label text="Remarks" optional />
                    <TextInput
                      value={values.remarks}
                      onChangeText={handleChange("remarks")}
                      mode="outlined"
                      multiline
                      numberOfLines={3}
                    />
                  </DashboardCard>

                  <SectionHeader
                    title="Review"
                    subtitle="Projected repayment"
                  />
                  <DashboardCard>
                    <View style={styles.reviewRow}>
                      <Text
                        style={[
                          styles.reviewLabel,
                          { color: palette.textMuted },
                        ]}
                      >
                        Monthly Interest
                      </Text>
                      <Text
                        style={[styles.reviewValue, { color: palette.text }]}
                      >
                        {formatCurrency(monthlyInterest)}
                      </Text>
                    </View>
                    <View style={styles.reviewRow}>
                      <Text
                        style={[
                          styles.reviewLabel,
                          { color: palette.textMuted },
                        ]}
                      >
                        Total Interest
                      </Text>
                      <Text
                        style={[styles.reviewValue, { color: palette.text }]}
                      >
                        {formatCurrency(totalInterest)}
                      </Text>
                    </View>
                    <View style={styles.reviewRow}>
                      <Text style={[styles.reviewLabel, { color: palette.textMuted }]}>Total Payable</Text>
                      <Text style={[styles.reviewValue, { color: palette.primary }]}>{formatCurrency(Number(values.principalAmount || 0) + totalInterest)}</Text>
                    </View>
                    <View style={styles.reviewRow}>
                      <Text style={[styles.reviewLabel, { color: palette.textMuted }]}>Due Date</Text>
                      <Text style={[styles.reviewValue, { color: palette.text }]}>{dueDate ? dueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</Text>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      loading={isPending}
                      disabled={isPending}
                      style={styles.submit}
                      contentStyle={styles.submitContent}
                      buttonColor={palette.secondary}
                      icon={isEdit ? "content-save" : "cash-plus"}
                    >
                      {isEdit ? "Save Loan" : "Sanction Loan"}
                    </Button>
                  </DashboardCard>
                </>
              );
            }}
          </Formik>
        </AdminScrollScreen>
      </KeyboardAvoidingView>
    </View>
  );
}

function Label({ text, optional }: { text: string; optional?: boolean }) {
  const palette = useAdminPalette();
  return (
    <Text style={[styles.label, { color: palette.textSecondary }]}>
      {text}
      {optional ? " (optional)" : ""}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 7,
    textTransform: "uppercase",
  },
  borrowerOption: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
  },
  borrowerName: { fontSize: 14, fontWeight: "900" },
  borrowerMobile: { fontSize: 12, marginTop: 8 },
  durationRow: { flexDirection: "row", gap: 8, minHeight: 56, alignItems: "center" },
  durationChip: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  durationText: { fontSize: 13, fontWeight: "900" },
  row: { flexDirection: "row", gap: 12 },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  reviewLabel: { fontSize: 13, fontWeight: "800" },
  reviewValue: { fontSize: 16, fontWeight: "900" },
  submit: { marginTop: 18, borderRadius: 16 },
  submitContent: { height: 52 },
});
