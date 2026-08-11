import React from "react";
import { Pressable, type PressableProps, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: "primary" | "secondary";
}

export function Button({ label, variant = "primary", onPressIn, onPressOut, disabled, ...rest }: ButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const duration = theme.reducedMotion ? 0 : theme.motion.duration.fast;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === "primary";

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withTiming(0.97, { duration });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration });
        onPressOut?.(e);
      }}
      style={[
        animatedStyle,
        styles.base,
        {
          backgroundColor: isPrimary ? theme.colors.accent.primary : theme.colors.background.sunken,
          borderRadius: theme.radius.soft,
          paddingVertical: theme.space.sm,
          paddingHorizontal: theme.space.lg,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      {...rest}
    >
      <Text variant="bodyStrong" color={isPrimary ? "inverse" : "primary"} style={styles.label}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    textAlign: "center",
  },
});
