import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
  Typography,
} from "../../theme";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  gradient?: string[];
  iconColor?: string;
  onPress?: () => void;
  trend?: { value: string; positive: boolean };
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  iconColor = Colors.primary,
  onPress,
  trend,
}: StatCardProps) {
  const content = (
    <View style={styles.row}>
      <View style={styles.iconContainer}>
        {gradient ? (
          <LinearGradient
            colors={gradient as [string, string]}
            style={styles.iconBg}
          >
            <MaterialCommunityIcons
              name={icon as never}
              size={24}
              color="white"
            />
          </LinearGradient>
        ) : (
          <View style={[styles.iconBg, { backgroundColor: `${iconColor}20` }]}>
            <MaterialCommunityIcons
              name={icon as never}
              size={24}
              color={iconColor}
            />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {trend && (
          <View style={styles.trendRow}>
            <MaterialCommunityIcons
              name={trend.positive ? "trending-up" : "trending-down"}
              size={14}
              color={trend.positive ? Colors.success : Colors.danger}
            />
            <Text
              style={[
                styles.trendText,
                { color: trend.positive ? Colors.success : Colors.danger },
              ]}
            >
              {trend.value}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  iconContainer: {},
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1 },
  title: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: { ...Typography.h3, color: Colors.text },
  subtitle: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 4,
  },
  trendText: { ...Typography.caption, fontWeight: "600" },
});
