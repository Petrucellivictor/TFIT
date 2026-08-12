import React from "react";
import { Pressable, type PressableProps, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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

  // Reanimated shared values are mutated by design outside React's render
  // cycle — the eslint-plugin-react-hooks immutability rule doesn't know
  // that yet, so it's disabled for these two handlers.
  /* eslint-disable react-hooks/immutability */
  const handlePressIn: NonNullable<ButtonProps["onPressIn"]> = (e) => {
    scale.value = withTiming(0.97, { duration });
    onPressIn?.(e);
  };
  const handlePressOut: NonNullable<ButtonProps["onPressOut"]> = (e) => {
    scale.value = withTiming(1, { duration });
    onPressOut?.(e);
  };
  /* eslint-enable react-hooks/immutability */

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        styles.base,
        {
          borderRadius: theme.radius.soft,
          opacity: disabled ? 0.5 : 1,
          overflow: "hidden",
          backgroundColor: isPrimary ? undefined : theme.colors.background.sunken,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: theme.colors.border.subtle,
        },
        isPrimary && !disabled
          ? {
              shadowColor: theme.colors.accent.primary,
              shadowOpacity: theme.scheme === "dark" ? 0.45 : 0.3,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 6 },
              elevation: 8,
            }
          : null,
      ]}
      {...rest}
    >
      {isPrimary ? (
        <LinearGradient
          colors={theme.colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, { paddingVertical: theme.space.sm, paddingHorizontal: theme.space.lg }]}
        >
          <Text variant="bodyStrong" color="inverse" style={styles.label}>
            {label}
          </Text>
        </LinearGradient>
      ) : (
        <Text
          variant="bodyStrong"
          color="primary"
          style={[styles.label, { paddingVertical: theme.space.sm, paddingHorizontal: theme.space.lg }]}
        >
          {label}
        </Text>
      )}
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
