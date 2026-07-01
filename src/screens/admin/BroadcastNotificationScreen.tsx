import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { notificationAPI } from "../../api/notification.api";
import {
  AdminHeroHeader,
  AdminScrollScreen,
  DashboardCard,
  SectionHeader,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import { StepperShell } from "../../components/admin/AdminCards";

const TARGET_TYPES = [
  { value: "ALL", label: "All Users", icon: "account-group" },
  { value: "ADMINS_ONLY", label: "Admins Only", icon: "shield-account" },
  { value: "BORROWERS_ONLY", label: "Borrowers Only", icon: "account-multiple" },
];

const NOTIFICATION_TYPES = [
  { value: "ANNOUNCEMENT", label: "Announcement", icon: "bullhorn" },
  { value: "FESTIVAL", label: "Festival", icon: "party-popper" },
  { value: "MEETING", label: "Meeting", icon: "account-group" },
  { value: "INFO", label: "General", icon: "information" },
  { value: "IMPORTANT", label: "Important", icon: "alert" },
];

export default function BroadcastNotificationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const palette = useAdminPalette();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("ALL");
  const [type, setType] = useState("INFO");
  const targetUserId = route.params?.targetUserId as string | undefined;

  const mutation = useMutation({
    mutationFn: () =>
      notificationAPI.broadcast({
        title,
        message,
        type,
        targetType: targetUserId ? "SPECIFIC_USER" : targetType,
        targetUserId,
      }),
    onSuccess: () => {
      Alert.alert("Notification Sent", "Delivery tracking is available in the notification center.", [
        { text: "Done", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert("Unable to send", err?.response?.data?.message ?? "Please try again.");
    },
  });

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Missing content", "Title and message are required.");
      return;
    }
    mutation.mutate();
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader eyebrow="Messaging" title="Create Notification" subtitle="Compose, target, and track temple communications." onBack={() => navigation.goBack()} />
      <AdminScrollScreen>
        <StepperShell steps={["Audience", "Message", "Send"]} activeStep={1} />
        <SectionHeader title="Target Audience" subtitle="Choose who receives this message" />
        <View style={styles.optionGrid}>
          {TARGET_TYPES.map((target) => {
            const selected = !targetUserId && targetType === target.value;
            return (
              <Pressable
                key={target.value}
                disabled={!!targetUserId}
                style={[
                  styles.option,
                  {
                    backgroundColor: selected ? `${palette.primary}14` : palette.surface,
                    borderColor: selected ? palette.primary : palette.border,
                    opacity: targetUserId ? 0.45 : 1,
                  },
                ]}
                onPress={() => setTargetType(target.value)}
              >
                <MaterialCommunityIcons name={target.icon as never} size={22} color={selected ? palette.primary : palette.textMuted} />
                <Text style={[styles.optionText, { color: selected ? palette.primary : palette.text }]}>{target.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title="Notification Type" subtitle="Controls priority and visual treatment" />
        <View style={styles.typeRow}>
          {NOTIFICATION_TYPES.map((item) => {
            const selected = type === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setType(item.value)}
                style={[styles.typeChip, { backgroundColor: selected ? `${palette.primary}16` : palette.surface, borderColor: selected ? palette.primary : palette.border }]}
              >
                <MaterialCommunityIcons name={item.icon as never} size={16} color={selected ? palette.primary : palette.textMuted} />
                <Text style={[styles.typeText, { color: selected ? palette.primary : palette.textSecondary }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title="Message" subtitle="Keep it clear and action-oriented" />
        <DashboardCard>
          <Label text="Title" />
          <TextInput mode="outlined" value={title} onChangeText={setTitle} placeholder="Notification title" />
          <Label text="Message" />
          <TextInput mode="outlined" value={message} onChangeText={setMessage} placeholder="Write your message" multiline numberOfLines={5} />
          <View style={[styles.scheduleBox, { borderColor: palette.border, backgroundColor: `${palette.primary}10` }]}>
            <MaterialCommunityIcons name="calendar-clock" size={20} color={palette.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.scheduleTitle, { color: palette.text }]}>Schedule Notification</Text>
              <Text style={[styles.scheduleSub, { color: palette.textMuted }]}>Scheduling UI is ready for backend support; sending now by default.</Text>
            </View>
          </View>
          <Button mode="contained" onPress={handleSend} loading={mutation.isPending} disabled={mutation.isPending} style={styles.submit} contentStyle={styles.submitContent} buttonColor={palette.secondary} icon="send">
            Send Notification
          </Button>
        </DashboardCard>
      </AdminScrollScreen>
    </View>
  );
}

function Label({ text }: { text: string }) {
  const palette = useAdminPalette();
  return <Text style={[styles.label, { color: palette.textSecondary }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 24 },
  option: { width: "47%", minHeight: 96, borderRadius: 20, borderWidth: 1, padding: 14, justifyContent: "space-between" },
  optionText: { fontSize: 13, fontWeight: "900" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 24 },
  typeChip: { height: 40, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  typeText: { fontSize: 12, fontWeight: "900" },
  label: { fontSize: 12, fontWeight: "900", marginTop: 12, marginBottom: 7, textTransform: "uppercase" },
  scheduleBox: { borderRadius: 18, borderWidth: 1, padding: 14, marginTop: 16, flexDirection: "row", gap: 12 },
  scheduleTitle: { fontSize: 14, fontWeight: "900" },
  scheduleSub: { fontSize: 12, lineHeight: 17, marginTop: 3 },
  submit: { marginTop: 20, borderRadius: 16 },
  submitContent: { height: 52 },
});
