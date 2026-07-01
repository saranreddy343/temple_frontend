import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Spacing, Typography, Shadows } from "../../theme";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: { icon: string; onPress: () => void; badge?: number };
  dark?: boolean;
}

export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  dark = false,
}: ScreenHeaderProps) {
  const textColor = Colors.text;
  const subColor = Colors.textSecondary;
  const iconColor = Colors.text;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={iconColor}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <View style={styles.center}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: subColor }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction ? (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.rightBtn}
          >
            <MaterialCommunityIcons
              name={rightAction.icon as never}
              size={24}
              color={iconColor}
            />
            {rightAction.badge !== undefined && rightAction.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {rightAction.badge > 99 ? "99+" : rightAction.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  row: { flexDirection: "row", alignItems: "center", paddingTop: Spacing.sm },
  backBtn: {
    padding: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: { width: 36 },
  center: { flex: 1, alignItems: "center" },
  title: { ...Typography.h4 },
  subtitle: { ...Typography.caption, marginTop: 2 },
  rightBtn: { padding: 4, position: "relative" },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "white", fontSize: 9, fontWeight: "700" },
});
