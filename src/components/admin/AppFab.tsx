import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { FAB } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAdminPalette } from "./PremiumAdminUI";

export default function AppFab({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  const palette = useAdminPalette();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(120).springify()}
      style={[styles.wrap, { bottom: Math.max(insets.bottom, 14) + 84 }, style]}
    >
      <FAB
        icon={icon}
        // label={label}
        mode="elevated"
        color="white"
        style={[styles.fab, { backgroundColor: palette.secondary }]}
        onPress={onPress}
        onTouchStart={() => {
          scale.value = withSpring(0.96);
        }}
        onTouchEnd={() => {
          scale.value = withSpring(1);
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", right: 18, zIndex: 20 },
  fab: { borderRadius: 18 },
});
