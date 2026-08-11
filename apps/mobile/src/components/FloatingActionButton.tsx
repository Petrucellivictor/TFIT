import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useTheme } from "@tfit/ui";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingActionButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const duration = theme.reducedMotion ? 0 : theme.motion.duration.fast;
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Ações rápidas"
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.92, { duration }))}
      onPressOut={() => (scale.value = withTiming(1, { duration }))}
      style={[
        animatedStyle,
        {
          position: "absolute",
          alignSelf: "center",
          bottom: 28,
          width: 56,
          height: 56,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.accent.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: theme.scheme === "dark" ? 0.4 : 0.15,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        },
      ]}
    >
      <Ionicons name="add" size={28} color={theme.colors.accent.onPrimary} />
    </AnimatedPressable>
  );
}
