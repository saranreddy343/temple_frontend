import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { AppDispatch, RootState } from "../../store";
import { logout, setUser } from "../../store/slices/authSlice";
import { authAPI } from "../../api/auth.api";
import { getInitials } from "../../utils/formatters";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  DashboardCard,
  SectionHeader,
  TimelineCard,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";

export default function AdminProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const palette = useAdminPalette();
  const { user } = useSelector((s: RootState) => s.auth);
  const [activePanel, setActivePanel] = useState<"profile" | "password" | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setName(user?.name ?? "");
    setAddress(user?.address ?? "");
  }, [user?.name, user?.address]);

  const { mutate: saveProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: (payload: { name: string; address?: string }) => authAPI.updateMe(payload),
    onSuccess: (response) => {
      if (response.data.data) dispatch(setUser(response.data.data));
      setActivePanel(null);
      Alert.alert("Profile Updated", "Admin profile details were saved.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert("Update failed", err.response?.data?.message ?? "Unable to update profile right now.");
    },
  });

  const { mutate: updatePassword, isPending: isChangingPassword } = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) => authAPI.changePassword(payload),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setActivePanel(null);
      Alert.alert("Password Updated", "Your security credentials were changed.");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      Alert.alert("Password update failed", err.response?.data?.message ?? "Unable to update password right now.");
    },
  });

  const handleSaveProfile = () => {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      Alert.alert("Invalid name", "Please enter at least 2 characters.");
      return;
    }
    saveProfile({ name: trimmedName, address: address.trim() || undefined });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Missing details", "Fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Password mismatch", "New password confirmation does not match.");
      return;
    }
    updatePassword({ currentPassword, newPassword });
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader eyebrow="Account" title="Admin Profile" subtitle="Security, preferences, and operator identity." />
      <AdminScrollScreen>
        <LinearGradient colors={[palette.secondary, "#334155"]} style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name ?? "A")}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>Temple Administrator · +91 {user?.mobile}</Text>
        </LinearGradient>

        <SectionHeader title="Account Controls" subtitle="Common profile and security actions" />
        <DashboardCard>
          <MenuItem icon="account-edit" label="Edit Profile" onPress={() => setActivePanel(activePanel === "profile" ? null : "profile")} />
          <MenuItem icon="lock-reset" label="Change Password" onPress={() => setActivePanel(activePanel === "password" ? null : "password")} />
          <MenuItem icon="bell-cog" label="Notification Settings" onPress={() => Alert.alert("Notifications", "Push notifications are managed from device settings and token registration.")} />
          <MenuItem icon="help-circle-outline" label="Help & Support" onPress={() => Alert.alert("Help & Support", "Contact temple operations support for urgent account issues.")} />
        </DashboardCard>

        {activePanel === "profile" ? (
          <DashboardCard>
            <Text style={[styles.panelTitle, { color: palette.text }]}>Edit Profile</Text>
            <TextInput label="Full Name" value={name} onChangeText={setName} mode="outlined" />
            <TextInput label="Address" value={address} onChangeText={setAddress} mode="outlined" multiline style={styles.input} />
            <Button mode="contained" onPress={handleSaveProfile} loading={isSavingProfile} disabled={isSavingProfile} buttonColor={palette.secondary} style={styles.button}>
              Save Profile
            </Button>
          </DashboardCard>
        ) : null}

        {activePanel === "password" ? (
          <DashboardCard>
            <Text style={[styles.panelTitle, { color: palette.text }]}>Change Password</Text>
            <TextInput label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} mode="outlined" secureTextEntry />
            <TextInput label="New Password" value={newPassword} onChangeText={setNewPassword} mode="outlined" secureTextEntry style={styles.input} />
            <TextInput label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} mode="outlined" secureTextEntry style={styles.input} />
            <Button mode="contained" onPress={handleChangePassword} loading={isChangingPassword} disabled={isChangingPassword} buttonColor={palette.secondary} style={styles.button}>
              Update Password
            </Button>
          </DashboardCard>
        ) : null}

        <SectionHeader title="Audit Activity" subtitle="Operator security posture" />
        <TimelineCard
          items={[
            { title: "Profile session active", subtitle: "Authenticated admin account", icon: "shield-check", tone: "success" },
            { title: "Push channel configured", subtitle: "Notification token registration available", icon: "bell-check", tone: "primary" },
            { title: "Access level", subtitle: "Temple administrator permissions", icon: "account-key", tone: "secondary" },
          ]}
        />

        <Pressable onPress={handleLogout} style={[styles.logout, { borderColor: palette.danger }]}>
          <MaterialCommunityIcons name="logout" size={18} color={palette.danger} />
          <Text style={[styles.logoutText, { color: palette.danger }]}>Logout</Text>
        </Pressable>
      </AdminScrollScreen>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const palette = useAdminPalette();
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <View style={[styles.menuIcon, { backgroundColor: `${palette.primary}14` }]}>
        <MaterialCommunityIcons name={icon as never} size={20} color={palette.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: palette.text }]}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={palette.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileCard: { marginHorizontal: 24, marginTop: -22, borderRadius: 24, padding: 22, alignItems: "center" },
  avatar: { width: 82, height: 82, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "white", fontSize: 25, fontWeight: "900" },
  name: { color: "white", fontSize: 22, fontWeight: "900", marginTop: 14 },
  role: { color: "rgba(255,255,255,0.72)", fontSize: 13, marginTop: 5 },
  menuItem: { flexDirection: "row", alignItems: "center", minHeight: 58, gap: 12 },
  menuIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "900" },
  panelTitle: { fontSize: 18, fontWeight: "900", marginBottom: 12 },
  input: { marginTop: 12 },
  button: { marginTop: 18, borderRadius: 16 },
  logout: { marginHorizontal: 24, marginTop: 12, height: 52, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  logoutText: { fontSize: 14, fontWeight: "900" },
});
