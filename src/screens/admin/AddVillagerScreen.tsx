import React from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, HelperText, Switch, Text, TextInput } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import { userAPI } from "../../api/user.api";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  DashboardCard,
  SectionHeader,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import { StepperShell } from "../../components/admin/AdminCards";

const schema = Yup.object({
  name: Yup.string().min(2, "Min 2 characters").max(100).required("Name is required"),
  mobile: Yup.string().matches(/^[0-9]{10}$/, "Enter 10-digit mobile number").required("Mobile is required"),
  address: Yup.string().max(500).optional(),
});

export default function AddVillagerScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const palette = useAdminPalette();
  const queryClient = useQueryClient();
  const userId = route.params?.userId as string | undefined;
  const isEdit = Boolean(userId);

  const { data: userRes, isLoading } = useQuery({
    queryKey: ["villager", userId],
    queryFn: () => userAPI.getById(userId as string),
    enabled: isEdit,
  });
  const existing = userRes?.data?.data;

  const { mutate, isPending } = useMutation({
    mutationFn: (values: { name: string; mobile: string; address?: string; isActive?: boolean }) =>
      isEdit ? userAPI.update(userId as string, values) : userAPI.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["villagers"] });
      queryClient.invalidateQueries({ queryKey: ["villager", userId] });
      Alert.alert(isEdit ? "Villager Updated" : "Villager Added", isEdit ? "The villager profile has been updated." : "The villager profile is ready for loan onboarding.", [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert(isEdit ? "Unable to update villager" : "Unable to add villager", err.response?.data?.message ?? "Please check the details and try again.");
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        eyebrow="Onboarding"
        title={isEdit ? "Edit Villager" : "Add Villager"}
        subtitle={isEdit ? "Update villager identity, contact, and account status." : "Create a verified villager profile for temple finance records."}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <AdminScrollScreen refreshing={isLoading}>
          <StepperShell steps={["Identity", "Contact", "Review"]} activeStep={1} />
          <SectionHeader title="Villager Details" subtitle="Use accurate name and contact information" />
          <Formik
            initialValues={{ name: existing?.name ?? "", mobile: existing?.mobile ?? "", address: existing?.address ?? "", isActive: existing?.isActive ?? true }}
            enableReinitialize
            validationSchema={schema}
            onSubmit={(values) => mutate({ name: values.name.trim(), mobile: values.mobile.trim(), address: values.address.trim() || undefined, ...(isEdit ? { isActive: values.isActive } : {}) })}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
              <DashboardCard>
                <FieldLabel label="Full Name" />
                <TextInput
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  mode="outlined"
                  placeholder="Enter villager's full name"
                  left={<TextInput.Icon icon="account" />}
                  error={touched.name && !!errors.name}
                />
                <HelperText type="error" visible={touched.name && !!errors.name}>{errors.name}</HelperText>

                <FieldLabel label="Mobile Number" />
                <TextInput
                  value={values.mobile}
                  onChangeText={handleChange("mobile")}
                  onBlur={handleBlur("mobile")}
                  mode="outlined"
                  placeholder="10-digit mobile number"
                  keyboardType="number-pad"
                  maxLength={10}
                  left={<TextInput.Icon icon="phone" />}
                  error={touched.mobile && !!errors.mobile}
                />
                <HelperText type="error" visible={touched.mobile && !!errors.mobile}>{errors.mobile}</HelperText>

                <FieldLabel label="Address" optional />
                <TextInput
                  value={values.address}
                  onChangeText={handleChange("address")}
                  onBlur={handleBlur("address")}
                  mode="outlined"
                  placeholder="Village/Town, District"
                  multiline
                  numberOfLines={3}
                  left={<TextInput.Icon icon="map-marker" />}
                />

                <Button
                  mode="contained"
                  onPress={() => handleSubmit()}
                  loading={isPending}
                  disabled={isPending}
                  style={styles.submit}
                  contentStyle={styles.submitContent}
                  buttonColor={palette.secondary}
                  icon={isEdit ? "content-save" : "account-plus"}
                >
                  {isEdit ? "Save Villager" : "Create Villager Profile"}
                </Button>
              </DashboardCard>
            )}
          </Formik>
        </AdminScrollScreen>
      </KeyboardAvoidingView>
    </View>
  );
}

function FieldLabel({ label, optional }: { label: string; optional?: boolean }) {
  const palette = useAdminPalette();
  return (
    <Text style={[styles.label, { color: palette.textSecondary }]}>
      {label} {optional ? <Text style={{ color: palette.textMuted }}>(optional)</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: "900", marginTop: 12, marginBottom: 7, textTransform: "uppercase" },
  statusRow: { marginTop: 14, borderRadius: 16, backgroundColor: "#F8FAFC", padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  statusTitle: { fontSize: 14, fontWeight: "900" },
  statusSub: { fontSize: 12, marginTop: 3 },
  submit: { marginTop: 20, borderRadius: 16 },
  submitContent: { height: 52 },
});
