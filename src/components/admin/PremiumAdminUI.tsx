import React, { ReactNode, memo, useMemo } from "react";
import {
  ColorSchemeName,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Shadows, Spacing, Typography } from "../../theme";

export type AdminTone =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "secondary";

export type AdminPalette = {
  background: string;
  surface: string;
  elevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
};

export const useAdminPalette = (): AdminPalette => {
  const scheme = useColorScheme();
  return useMemo(() => getAdminPalette(scheme), [scheme]);
};

export const getAdminPalette = (scheme: ColorSchemeName): AdminPalette => {
  const isDark = scheme === "dark" && false;
  return {
    background: isDark ? Colors.dark.background : Colors.background,
    surface: isDark ? Colors.dark.surface : Colors.surface,
    elevated: isDark ? Colors.dark.elevated : Colors.elevated,
    text: isDark ? Colors.dark.text : Colors.text,
    textSecondary: isDark ? Colors.dark.textSecondary : Colors.textSecondary,
    textMuted: isDark ? Colors.dark.textMuted : Colors.textMuted,
    border: isDark ? Colors.dark.border : Colors.border,
    primary: Colors.primary,
    secondary: Colors.secondary,
    success: Colors.success,
    warning: Colors.warning,
    danger: Colors.danger,
    info: Colors.info,
  };
};

export const toneColor = (palette: AdminPalette, tone: AdminTone) => {
  const map = {
    primary: palette.primary,
    success: palette.success,
    warning: palette.warning,
    danger: palette.danger,
    info: palette.info,
    secondary: palette.secondary,
  };
  return map[tone];
};

export function AdminScrollScreen({
  children,
  refreshing = false,
  onRefresh,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}) {
  const palette = useAdminPalette();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: palette.background }}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

export function AdminHeroHeader({
  eyebrow,
  title,
  subtitle,
  rightIcon = "bell-outline",
  rightBadge,
  onRightPress,
  onBack,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  rightIcon?: string;
  rightBadge?: number;
  onRightPress?: () => void;
  onBack?: () => void;
}) {
  const palette = useAdminPalette();
  return (
    <LinearGradient
      colors={[palette.secondary, "#0F766E", palette.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <SafeAreaView edges={["top"]}>
        <View style={styles.heroTop}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            {onBack ? (
              <Pressable onPress={onBack} style={styles.heroIconButton}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={22}
                  color="white"
                />
              </Pressable>
            ) : (
              <View style={styles.brandMark}>
                <MaterialCommunityIcons name="bank" size={21} color="white" />
              </View>
            )}
            <Animated.View entering={FadeInUp.duration(420)}>
              {/* {eyebrow ? <Text style={styles.heroEyebrow}>{eyebrow}</Text> : null} */}
              <Text style={styles.heroTitle}>{title}</Text>
              {subtitle ? (
                <Text style={styles.heroSubtitle}>{subtitle}</Text>
              ) : null}
            </Animated.View>
          </View>
          {onRightPress ? (
            <Pressable onPress={onRightPress} style={styles.heroIconButton}>
              <MaterialCommunityIcons
                name={rightIcon as never}
                size={22}
                color="white"
              />
              {rightBadge ? (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
                    {rightBadge > 9 ? "9+" : rightBadge}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ) : (
            <View style={styles.heroIconButton}>
              <MaterialCommunityIcons
                name="shield-check"
                size={20}
                color="white"
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

export const SectionHeader = memo(function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  const palette = useAdminPalette();
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.sectionSubtitle, { color: palette.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? (
        <Pressable onPress={onAction} style={styles.sectionAction}>
          <Text style={[styles.sectionActionText, { color: palette.primary }]}>
            {action}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color={palette.primary}
          />
        </Pressable>
      ) : null}
    </View>
  );
});

export function DashboardCard({
  children,
  delay = 0,
  padded = true,
}: {
  children: ReactNode;
  delay?: number;
  padded?: boolean;
}) {
  const palette = useAdminPalette();
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(380)}
      style={[
        styles.dashboardCard,
        { backgroundColor: palette.surface, borderColor: palette.border },
        padded ? styles.dashboardCardPadded : null,
      ]}
    >
      {children}
    </Animated.View>
  );
}

export const StatCard = memo(function StatCard({
  label,
  value,
  icon,
  tone = "primary",
  helper,
}: {
  label: string;
  value: string;
  icon: string;
  tone?: AdminTone;
  helper?: string;
}) {
  const palette = useAdminPalette();
  const color = toneColor(palette, tone);
  return (
    <DashboardCard padded={false}>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
          <MaterialCommunityIcons
            name={icon as never}
            size={20}
            color={color}
          />
        </View>
        <Text style={[styles.statValue, { color: palette.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: palette.textSecondary }]}>
          {label}
        </Text>
        {helper ? (
          <Text style={[styles.statHelper, { color }]}>{helper}</Text>
        ) : null}
      </View>
    </DashboardCard>
  );
});

export function FinancialSummaryCard({
  total,
  loaned,
  available,
}: {
  total: string;
  loaned: string;
  available: string;
}) {
  const palette = useAdminPalette();
  return (
    <LinearGradient
      colors={[palette.secondary, "#334155"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.financialCard}
    >
      <View style={styles.financialTop}>
        <View>
          <Text style={styles.financialLabel}>Financial Overview</Text>
          <Text style={styles.financialValue}>{total}</Text>
        </View>
        <View style={styles.financialSeal}>
          <MaterialCommunityIcons
            name="chart-areaspline"
            size={26}
            color="white"
          />
        </View>
      </View>
      <View style={styles.financialRows}>
        <View style={styles.financialMetric}>
          <Text style={styles.financialMetricLabel}>Loaned</Text>
          <Text style={styles.financialMetricValue}>{loaned}</Text>
        </View>
        <View style={styles.financialDivider} />
        <View style={styles.financialMetric}>
          <Text style={styles.financialMetricLabel}>Available</Text>
          <Text style={styles.financialMetricValue}>{available}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

export const ActionTile = memo(function ActionTile({
  label,
  icon,
  tone = "primary",
  onPress,
}: {
  label: string;
  icon: string;
  tone?: AdminTone;
  onPress: () => void;
}) {
  const palette = useAdminPalette();
  const color = toneColor(palette, tone);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.actionTile, { borderColor: palette.border }]}
    >
      <View style={[styles.actionIcon, { backgroundColor: `${color}16` }]}>
        <MaterialCommunityIcons name={icon as never} size={22} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
});

export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  const palette = useAdminPalette();
  return (
    <View
      style={[
        styles.searchBar,
        { backgroundColor: palette.surface, borderColor: palette.border },
      ]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={palette.textMuted}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        style={[styles.searchInput, { color: palette.text }]}
      />
      {value ? (
        <Pressable onPress={() => onChangeText("")}>
          <MaterialCommunityIcons
            name="close-circle"
            size={18}
            color={palette.textMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

export function FilterChips<T extends string | boolean | undefined | null>({
  items,
  value,
  onChange,
}: {
  items: Array<{ label: string; value: T; icon?: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  const palette = useAdminPalette();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.label}
            onPress={() => onChange(item.value)}
            style={[
              styles.filterChip,
              {
                backgroundColor: selected
                  ? `${palette.primary}18`
                  : palette.surface,
                borderColor: selected ? palette.primary : palette.border,
              },
            ]}
          >
            {item.icon ? (
              <MaterialCommunityIcons
                name={item.icon as never}
                size={15}
                color={selected ? palette.primary : palette.textMuted}
              />
            ) : null}
            <Text
              style={[
                styles.filterText,
                { color: selected ? palette.primary : palette.textSecondary },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function EmptyState({
  title,
  message,
  actionLabel,
  icon = "archive-search",
  onAction,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  icon?: string;
  onAction?: () => void;
}) {
  const palette = useAdminPalette();
  return (
    <View style={styles.emptyWrap}>
      <View
        style={[
          styles.emptyIllustration,
          { backgroundColor: `${palette.primary}14` },
        ]}
      >
        <MaterialCommunityIcons
          name={icon as never}
          size={42}
          color={palette.primary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.emptyMessage, { color: palette.textMuted }]}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={[styles.emptyAction, { backgroundColor: palette.secondary }]}
        >
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function SkeletonBlock({ height = 96 }: { height?: number }) {
  const palette = useAdminPalette();
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={[styles.skeleton, { height, backgroundColor: palette.surface }]}
    >
      <View
        style={[
          styles.skeletonLine,
          { backgroundColor: palette.border, width: "52%" },
        ]}
      />
      <View
        style={[
          styles.skeletonLine,
          { backgroundColor: palette.border, width: "78%" },
        ]}
      />
      <View
        style={[
          styles.skeletonLine,
          { backgroundColor: palette.border, width: "34%" },
        ]}
      />
    </Animated.View>
  );
}

export function TimelineCard({
  items,
}: {
  items: Array<{
    title: string;
    subtitle: string;
    tone?: AdminTone;
    icon?: string;
  }>;
}) {
  const palette = useAdminPalette();
  return (
    <DashboardCard>
      {items.map((item, index) => {
        const color = toneColor(palette, item.tone ?? "primary");
        return (
          <View key={`${item.title}-${index}`} style={styles.timelineRow}>
            <View style={styles.timelineRail}>
              <View style={[styles.timelineDot, { backgroundColor: color }]}>
                <MaterialCommunityIcons
                  name={(item.icon ?? "pulse") as never}
                  size={12}
                  color="white"
                />
              </View>
              {index < items.length - 1 ? (
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: palette.border },
                  ]}
                />
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.timelineTitle, { color: palette.text }]}>
                {item.title}
              </Text>
              <Text
                style={[styles.timelineSubtitle, { color: palette.textMuted }]}
              >
                {item.subtitle}
              </Text>
            </View>
          </View>
        );
      })}
    </DashboardCard>
  );
}

export function MiniBarChart({
  data,
  tone = "primary",
}: {
  data: Array<{ label: string; value: number }>;
  tone?: AdminTone;
}) {
  const palette = useAdminPalette();
  const color = toneColor(palette, tone);
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <DashboardCard>
      <View style={styles.chartRow}>
        {data.map((item) => (
          <View key={item.label} style={styles.chartItem}>
            <View
              style={[styles.chartTrack, { backgroundColor: `${color}12` }]}
            >
              <View
                style={[
                  styles.chartBar,
                  {
                    height: `${Math.max((item.value / max) * 100, 8)}%`,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
            <Text style={[styles.chartLabel, { color: palette.textMuted }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </DashboardCard>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 110,
    paddingTop: 50,
  },
  hero: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // paddingTop: 10,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
  },
  heroIconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  headerBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadgeText: { color: "white", fontSize: 9, fontWeight: "800" },
  // heroCopy: { marginTop: 30 },
  heroEyebrow: {
    ...Typography.label,
    color: "rgba(255,255,255,0.78)",
    textTransform: "uppercase",
    letterSpacing: 0,
  },
  heroTitle: {
    fontSize: 15,
    lineHeight: 16,
    fontWeight: "800",
    color: "white",
    // marginTop: 8,
  },
  heroSubtitle: {
    ...Typography.body2,
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: 12,
  },
  sectionTitle: { ...Typography.h3, fontWeight: "800" },
  sectionSubtitle: { ...Typography.caption, marginTop: 3 },
  sectionAction: { flexDirection: "row", alignItems: "center", gap: 2 },
  sectionActionText: { ...Typography.label, letterSpacing: 0 },
  dashboardCard: {
    minWidth: "42%",
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 12,
  },
  dashboardCardPadded: { padding: Spacing.md },
  statCard: {
    padding: Spacing.md,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { ...Typography.caption, marginTop: 4 },
  statHelper: { ...Typography.caption, fontWeight: "700", marginTop: 8 },
  financialCard: {
    marginHorizontal: Spacing.lg,
    marginTop: -22,
    borderRadius: 24,
    padding: 20,
    ...Shadows.lg,
  },
  financialTop: { flexDirection: "row", justifyContent: "space-between" },
  financialLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "700",
  },
  financialValue: {
    color: "white",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 8,
  },
  financialSeal: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  financialRows: { flexDirection: "row", alignItems: "center", marginTop: 24 },
  financialMetric: { flex: 1 },
  financialMetricLabel: { color: "rgba(255,255,255,0.62)", fontSize: 12 },
  financialMetricValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  financialDivider: {
    width: 1,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginHorizontal: 16,
  },
  actionTile: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontSize: 10, fontWeight: "500", marginTop: 6 },
  searchBar: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    ...Shadows.sm,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  filterRow: { paddingHorizontal: Spacing.lg, gap: 8, paddingVertical: 12 },
  filterChip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  filterText: { fontSize: 13, fontWeight: "800" },
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: 36,
    paddingVertical: 42,
  },
  emptyIllustration: {
    width: 112,
    height: 112,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    ...Typography.h3,
    fontWeight: "900",
    marginTop: 18,
    textAlign: "center",
  },
  emptyMessage: {
    ...Typography.body2,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: 18,
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyActionText: { color: "white", fontWeight: "800" },
  skeleton: {
    marginHorizontal: Spacing.lg,
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 8,
    marginBottom: 12,
    opacity: 0.65,
  },
  timelineRow: { flexDirection: "row", minHeight: 58 },
  timelineRail: { width: 34, alignItems: "center" },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineLine: { flex: 1, width: 1, marginTop: 4 },
  timelineTitle: { ...Typography.body2, fontWeight: "800" },
  timelineSubtitle: { ...Typography.caption, marginTop: 3 },
  chartRow: {
    height: 170,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  chartItem: { flex: 1, alignItems: "center", gap: 8 },
  chartTrack: {
    height: 128,
    width: "100%",
    borderRadius: 14,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBar: {
    width: "100%",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  chartLabel: { fontSize: 10, fontWeight: "800" },
});
