import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Spacing, Typography } from "../../theme";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
}

export default function EmptyState({
  icon = "inbox-outline",
  title,
  message,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name={icon as never}
        size={72}
        color={Colors.border}
      />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xxl,
  },
  title: {
    ...Typography.h4,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  message: {
    ...Typography.body2,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
