import React, { memo } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { notificationAPI } from "../../api/notification.api";
import { UserNotification } from "../../types";
import {
  AdminHeroHeader,
  DashboardCard,
  EmptyState,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import { Spacing } from "../../theme";
import { formatDate } from "../../utils/formatters";

const TYPE_ICONS: Record<string, string> = {
  LOAN_CREATED: "cash-plus",
  LOAN_CLOSED: "check-circle",
  LOAN_OVERDUE: "alert-circle",
  LOAN_DUE_REMINDER: "bell-ring",
  ANNOUNCEMENT: "bullhorn",
  FESTIVAL: "party-popper",
  MEETING: "account-group",
  INFO: "information",
  IMPORTANT: "alert",
};

const NotifItem = memo(function NotifItem({
  item,
  onPress,
  palette,
}: {
  item: UserNotification;
  onPress: () => void;
  palette: ReturnType<typeof useAdminPalette>;
}) {
  const notif = item.notification;
  const type = notif?.type ?? "INFO";
  const accentColor = type === "LOAN_OVERDUE" || type === "IMPORTANT"
    ? palette.danger
    : type === "LOAN_DUE_REMINDER"
    ? palette.warning
    : type === "FESTIVAL"
    ? "#8B5CF6"
    : type === "MEETING"
    ? palette.primary
    : palette.primary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <DashboardCard>
        <View style={styles.row}>
          <View style={[styles.iconBg, { backgroundColor: `${accentColor}18` }]}>
            <MaterialCommunityIcons
              name={(TYPE_ICONS[type] ?? "information") as never}
              size={20}
              color={accentColor}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.title, { color: item.isRead ? palette.textMuted : palette.text }]}
              numberOfLines={1}
            >
              {notif?.title ?? "Notification"}
            </Text>
            <Text style={[styles.message, { color: palette.text }]} numberOfLines={2}>
              {notif?.message ?? ""}
            </Text>
            <Text style={[styles.date, { color: palette.textMuted }]}>
              {notif?.createdAt ? formatDate(notif.createdAt as string) : ""}
            </Text>
          </View>
          {!item.isRead && (
            <View style={[styles.unreadDot, { backgroundColor: palette.primary }]} />
          )}
        </View>
      </DashboardCard>
    </TouchableOpacity>
  );
});

export default function BorrowerNotificationsScreen() {
  const navigation = useNavigation<any>();
  const palette = useAdminPalette();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationAPI.getAll({ limit: 50 }),
  });

  const { mutate: markOne } = useMutation({
    mutationFn: (id: string) => notificationAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const { mutate: markAll } = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const notifications: UserNotification[] = data?.data?.data?.data ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);
  const canGoBack = navigation.canGoBack();

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        title="Notifications"
        subtitle="Updates and reminders"
        onBack={canGoBack ? () => navigation.goBack() : undefined}
        rightIcon={hasUnread ? "check-all" : undefined}
        onRightPress={hasUnread ? () => markAll() : undefined}
      />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={isLoading}
        onRefresh={refetch}
        renderItem={({ item }) => (
          <NotifItem
            item={item}
            palette={palette}
            onPress={() => !item.isRead && markOne(item.id)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="bell-off-outline"
              title="No Notifications"
              message="You're all caught up! Notifications will appear here."
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconBg: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 14, fontWeight: "700" },
  message: { fontSize: 13, marginTop: 2 },
  date: { fontSize: 11, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});
