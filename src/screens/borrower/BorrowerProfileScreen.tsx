import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { RootState, AppDispatch } from "../../store";
import { logout, setUser } from "../../store/slices/authSlice";
import { authAPI } from "../../api/auth.api";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  DashboardCard,
  SectionHeader,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import { Spacing } from "../../theme";
import { getInitials, maskMobile } from "../../utils/formatters";

export default function BorrowerProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const palette = useAdminPalette();
  const { user } = useSelector((s: RootState) => s.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [address, setAddress] = useState(user?.address ?? "");

  useEffect(() => {
    setName(user?.name ?? "");
    setAddress(user?.address ?? "");
  }, [user?.name, user?.address]);

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: (payload: { name: string; address?: string }) =>
      authAPI.updateMe(payload),
    onSuccess: (response) => {
      if (response.data.data) dispatch(setUser(response.data.data));
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert("Update failed", err.response?.data?.message ?? "Unable to update profile right now.");
    },
  });

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => dispatch(logout()) },
    ]);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      Alert.alert("Invalid name", "Please enter at least 2 characters.");
      return;
    }
    saveProfile({ name: trimmedName, address: address.trim() || undefined });
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader title="Profile" subtitle="Borrower Member" />
      <AdminScrollScreen>
        {/* Avatar card */}
        <View style={{ paddingHorizontal: Spacing.lg, marginTop: -22 }}>
          <DashboardCard>
            <View style={styles.avatarRow}>
              <View style={[styles.avatar, { backgroundColor: `${palette.primary}25`, borderColor: `${palette.primary}40` }]}>
                <Text style={[styles.avatarText, { color: palette.primary }]}>
                  {getInitials(user?.name ?? "B")}
                </Text>
              </View>
              <View>
                <Text style={[styles.profileName, { color: palette.text }]}>{user?.name ?? "Borrower"}</Text>
                <Text style={[styles.profileRole, { color: palette.textMuted }]}>Borrower Member</Text>
              </View>
            </View>
          </DashboardCard>
        </View>

        <SectionHeader title="Personal Information" />

        <View style={{ paddingHorizontal: Spacing.lg }}>
          <DashboardCard>
            {[
              { icon: "phone", label: "Mobile", value: user?.mobile ? maskMobile(user.mobile) : "-" },
              { icon: "map-marker", label: "Address", value: user?.address ?? "Not provided" },
              { icon: "shield-account", label: "Role", value: "Borrower" },
            ].map((item, idx, arr) => (
              <View key={item.label}>
                <View style={styles.infoRow}>
                  <View style={[styles.iconBg, { backgroundColor: `${palette.primary}14` }]}>
                    <MaterialCommunityIcons name={item.icon as never} size={18} color={palette.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.infoLabel, { color: palette.textMuted }]}>{item.label}</Text>
                    <Text style={[styles.infoValue, { color: palette.text }]}>{item.value}</Text>
                  </View>
                </View>
                {idx < arr.length - 1 && <View style={[styles.divider, { backgroundColor: `${palette.border}` }]} />}
              </View>
            ))}
          </DashboardCard>
        </View>

        <SectionHeader
          title="Edit Profile"
          action={isEditing ? "Cancel" : "Edit"}
          onAction={() => {
            if (isEditing) {
              setName(user?.name ?? "");
              setAddress(user?.address ?? "");
            }
            setIsEditing((v) => !v);
          }}
        />

        <View style={{ paddingHorizontal: Spacing.lg }}>
          <DashboardCard>
            <View style={styles.form}>
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                editable={isEditing}
                textColor={palette.text}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />
              <TextInput
                label="Address"
                value={address}
                onChangeText={setAddress}
                mode="outlined"
                editable={isEditing}
                multiline
                textColor={palette.text}
                outlineColor={palette.border}
                activeOutlineColor={palette.primary}
              />
              {isEditing ? (
                <Button
                  mode="contained"
                  onPress={handleSave}
                  loading={isSaving}
                  disabled={isSaving}
                  buttonColor={palette.primary}
                  style={{ borderRadius: 12 }}
                >
                  Save Changes
                </Button>
              ) : (
                <Text style={[styles.helperText, { color: palette.textMuted }]}>
                  Tap Edit above to update your name or address.
                </Text>
              )}
            </View>
          </DashboardCard>
        </View>

        <View style={{ paddingHorizontal: Spacing.lg, marginTop: Spacing.lg }}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            icon="logout"
            textColor={palette.danger}
            style={{ borderColor: palette.danger, borderRadius: 14 }}
            contentStyle={{ height: 50 }}
          >
            Logout
          </Button>
          <Text style={[styles.version, { color: palette.textMuted }]}>Temple Finance v1.0.0</Text>
        </View>
      </AdminScrollScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: { width: 64, height: 64, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  avatarText: { fontSize: 24, fontWeight: "900" },
  profileName: { fontSize: 18, fontWeight: "800" },
  profileRole: { fontSize: 13, marginTop: 2 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  iconBg: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  infoLabel: { fontSize: 11, fontWeight: "600" },
  infoValue: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  divider: { height: 1, marginLeft: 50 },
  form: { gap: 12 },
  helperText: { fontSize: 12, textAlign: "center" },
  version: { fontSize: 11, textAlign: "center", marginTop: 16, marginBottom: 24 },
});
