import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationAPI } from "../../api/notification.api";
import { UserNotification } from "../../types";
import { formatDate } from "../../utils/formatters";
import {
  AdminHeroHeader,
  EmptyState,
  FilterChips,
  SearchBar,
  SectionHeader,
  SkeletonBlock,
  StatCard,
  useAdminPalette,
} from "../../components/admin/PremiumAdminUI";
import AppFab from "../../components/admin/AppFab";

type NotificationFilter = "ALL" | "UNREAD" | "READ" | "IMPORTANT";

const FILTERS: Array<{
  label: string;
  value: NotificationFilter;
  icon: string;
}> = [
  { label: "All", value: "ALL", icon: "bell" },
  { label: "Unread", value: "UNREAD", icon: "bell-badge" },
  { label: "Read", value: "READ", icon: "check-circle" },
  { label: "Important", value: "IMPORTANT", icon: "alert" },
];

export default function AdminNotificationsScreen() {
  const navigation = useNavigation<any>();
  const palette = useAdminPalette();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<NotificationFilter>("ALL");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationAPI.getAll({ limit: 80 }),
    enabled: true,
  });

  console.log("Notifications", data?.data?.data);

  const { mutate: markOne } = useMutation({
    mutationFn: (id: string) => notificationAPI.markRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const { mutate: markAll } = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications: UserNotification[] = data?.data?.data?.data ?? [];
  const filtered = useMemo(
    () =>
      notifications.filter((item) => {
        const notif = item.notification;
        const matchesSearch =
          !search ||
          notif?.title?.toLowerCase().includes(search.toLowerCase()) ||
          notif?.message?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
          filter === "ALL" ||
          (filter === "UNREAD" && !item.isRead) ||
          (filter === "READ" && item.isRead) ||
          (filter === "IMPORTANT" && notif?.type === "IMPORTANT");
        return matchesSearch && matchesFilter;
      }),
    [filter, notifications, search],
  );
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <AdminHeroHeader
        eyebrow="Messaging"
        title="Notification Center"
        subtitle="Create, schedule, and measure temple communications."
        onBack={() => navigation.goBack()}
        rightIcon="bullhorn"
        onRightPress={() => navigation.navigate("BroadcastNotification")}
      />
      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Search notifications"
      />
      <View>
        <FilterChips items={FILTERS} value={filter} onChange={setFilter} />
      </View>
      {/* <View style={styles.summaryGrid}>
        <StatCard label="Sent" value={String(notifications.length)} icon="send-check" />
        <StatCard label="Unread" value={String(unread)} icon="bell-badge" tone="warning" />
        <StatCard label="Read Rate" value={`${notifications.length ? Math.round(((notifications.length - unread) / notifications.length) * 100) : 0}%`} icon="chart-donut" tone="success" />
      </View> */}
      {/* <SectionHeader
        title="Delivery Status"
        subtitle="Read and engagement visibility"
        action={unread ? "Mark all" : undefined}
        onAction={() => markAll()}
      /> */}
      {isLoading ? (
        <>
          <SkeletonBlock />
          <SkeletonBlock />
        </>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              item={item}
              onPress={() => !item.isRead && markOne(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshing={isLoading}
          onRefresh={refetch}
          ListEmptyComponent={
            <EmptyState
              title="No notifications"
              message="Create a notification, schedule a reminder, or broadcast important temple updates."
              actionLabel="Create Notification"
              icon="bell-plus"
              onAction={() => navigation.navigate("BroadcastNotification")}
            />
          }
        />
      )}
      <AppFab icon="bell-plus" label="Create Notification" onPress={() => navigation.navigate("BroadcastNotification")} />
    </View>
  );
}

function NotificationCard({
  item,
  onPress,
}: {
  item: UserNotification;
  onPress: () => void;
}) {
  const palette = useAdminPalette();
  const notif = item.notification;
  const type = notif?.type ?? "INFO";
  const color =
    type === "IMPORTANT"
      ? palette.danger
      : type === "FESTIVAL"
        ? palette.warning
        : palette.primary;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: item.isRead ? palette.border : `${color}55`,
        },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: `${color}16` }]}>
        <MaterialCommunityIcons
          name={type === "IMPORTANT" ? "alert" : "bullhorn"}
          size={20}
          color={color}
        />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardTop}>
          <Text
            style={[styles.cardTitle, { color: palette.text }]}
            numberOfLines={1}
          >
            {notif?.title ?? "Notification"}
          </Text>
          <View
            style={[
              styles.readPill,
              {
                backgroundColor: item.isRead
                  ? `${palette.success}14`
                  : `${palette.warning}18`,
              },
            ]}
          >
            <Text
              style={[
                styles.readText,
                { color: item.isRead ? palette.success : palette.warning },
              ]}
            >
              {item.isRead ? "Read" : "Unread"}
            </Text>
          </View>
        </View>
        <Text
          style={[styles.cardMessage, { color: palette.textSecondary }]}
          numberOfLines={2}
        >
          {notif?.message ?? ""}
        </Text>
        <Text style={[styles.cardDate, { color: palette.textMuted }]}>
          Delivered{" "}
          {notif?.createdAt ? formatDate(notif.createdAt as string) : "-"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 18,
  },
  list: { paddingBottom: 120 },
  card: {
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "900" },
  cardMessage: { fontSize: 13, lineHeight: 18, marginTop: 6 },
  cardDate: { fontSize: 11, fontWeight: "700", marginTop: 10 },
  readPill: {
    height: 26,
    borderRadius: 999,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  readText: { fontSize: 10, fontWeight: "900" },
});
