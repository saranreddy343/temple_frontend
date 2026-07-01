import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import * as Yup from "yup";
import { expenseAPI } from "../../api/expense.api";
import { ExpenseCategory } from "../../types";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  DashboardCard,
  SectionHeader,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import { StepperShell } from "../../components/admin/AdminCards";

const CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: "FESTIVAL", label: "Festival", icon: "party-popper" },
  { value: "MAINTENANCE", label: "Maintenance", icon: "tools" },
  { value: "ELECTRICITY", label: "Utilities", icon: "lightning-bolt" },
  { value: "SALARY", label: "Salary", icon: "account-cash" },
  { value: "MISCELLANEOUS", label: "Misc", icon: "dots-horizontal" },
];

const schema = Yup.object({
  title: Yup.string().required("Title is required").min(3),
  category: Yup.string().required("Select a category"),
  amount: Yup.number().required("Amount is required").min(1, "Amount must be > 0"),
  expenseDate: Yup.string().required("Date is required"),
  description: Yup.string().optional(),
});

export default function AddExpenseScreen() {
  const navigation = useNavigation<any>();
  const palette = useAdminPalette();
  const qc = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<ExpenseCategory | "">("");

  const mutation = useMutation({
    mutationFn: (values: {
      title: string;
      category: ExpenseCategory;
      amount: number;
      expenseDate: string;
      description?: string;
    }) => expenseAPI.create(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["adminStats"] });
      Alert.alert("Expense Saved", "The ledger and dashboard have been updated.", [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert("Unable to save expense", err?.response?.data?.message ?? "Please review the entry.");
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader eyebrow="Ledger" title="Add Expense" subtitle="Record temple operating spend with a clean audit trail." onBack={() => navigation.goBack()} />
      <AdminScrollScreen>
        <StepperShell steps={["Category", "Amount", "Review"]} activeStep={1} />
        <Formik
          initialValues={{
            title: "",
            category: "" as ExpenseCategory,
            amount: "",
            expenseDate: new Date().toISOString().split("T")[0],
            description: "",
          }}
          validationSchema={schema}
          onSubmit={(values) =>
            mutation.mutate({
              ...values,
              category: values.category as ExpenseCategory,
              amount: parseFloat(values.amount),
              description: values.description.trim() || undefined,
            })
          }
        >
          {({ values, errors, touched, handleChange, handleSubmit, setFieldValue }) => (
            <>
              <SectionHeader title="Expense Category" subtitle="Choose the cost center" />
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((category) => {
                  const selected = values.category === category.value;
                  return (
                    <Pressable
                      key={category.value}
                      style={[
                        styles.categoryCard,
                        {
                          backgroundColor: selected ? `${palette.primary}14` : palette.surface,
                          borderColor: selected ? palette.primary : palette.border,
                        },
                      ]}
                      onPress={() => {
                        setActiveCategory(category.value);
                        setFieldValue("category", category.value);
                      }}
                    >
                      <MaterialCommunityIcons name={category.icon as never} size={23} color={selected ? palette.primary : palette.textMuted} />
                      <Text style={[styles.categoryLabel, { color: selected ? palette.primary : palette.text }]}>{category.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <HelperText type="error" visible={touched.category && !!errors.category}>{errors.category as string}</HelperText>

              <SectionHeader title="Expense Details" subtitle={activeCategory ? `${activeCategory.replace("_", " ")} selected` : "Amount, date, and description"} />
              <DashboardCard>
                <Label text="Expense Title" />
                <TextInput mode="outlined" value={values.title} onChangeText={handleChange("title")} placeholder="e.g., Annual festival setup" error={!!errors.title && touched.title} />
                <HelperText type="error" visible={!!errors.title && touched.title}>{errors.title}</HelperText>
                <Label text="Amount" />
                <TextInput mode="outlined" value={values.amount} onChangeText={handleChange("amount")} keyboardType="numeric" left={<TextInput.Affix text="₹" />} error={!!errors.amount && touched.amount} />
                <HelperText type="error" visible={!!errors.amount && touched.amount}>{errors.amount}</HelperText>
                <Label text="Date" />
                <TextInput mode="outlined" value={values.expenseDate} onChangeText={handleChange("expenseDate")} left={<TextInput.Icon icon="calendar" />} />
                <Label text="Description" optional />
                <TextInput mode="outlined" value={values.description} onChangeText={handleChange("description")} multiline numberOfLines={3} />
                <Button mode="contained" onPress={handleSubmit as any} loading={mutation.isPending} disabled={mutation.isPending} style={styles.submit} contentStyle={styles.submitContent} buttonColor={palette.secondary} icon="content-save">
                  Save Expense
                </Button>
              </DashboardCard>
            </>
          )}
        </Formik>
      </AdminScrollScreen>
    </View>
  );
}

function Label({ text, optional }: { text: string; optional?: boolean }) {
  const palette = useAdminPalette();
  return <Text style={[styles.label, { color: palette.textSecondary }]}>{text}{optional ? " (optional)" : ""}</Text>;
}

const styles = StyleSheet.create({
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 24 },
  categoryCard: { width: "47%", minHeight: 96, borderRadius: 20, borderWidth: 1, padding: 14, justifyContent: "space-between" },
  categoryLabel: { fontSize: 13, fontWeight: "900" },
  label: { fontSize: 12, fontWeight: "900", marginTop: 12, marginBottom: 7, textTransform: "uppercase" },
  submit: { marginTop: 20, borderRadius: 16 },
  submitContent: { height: 52 },
});
