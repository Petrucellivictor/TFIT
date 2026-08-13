import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useTheme } from "../theme/ThemeProvider";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface IconButtonProps extends Omit<PressableProps, "style"> {
  icon: ReactNode;
  /** Required, not optional — an icon-only control must always announce its purpose. */
  accessibilityLabel: string;
  variant?: "plain" | "surface";
}

export function IconButton({
  icon,
  accessibilityLabel,
  variant = "plain",
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: IconButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const duration = theme.reducedMotion ? 0 : theme.motion.duration.fast;
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  // Reanimated shared values are mutated by design outside React's render
  // cycle — the eslint-plugin-react-hooks immutability rule doesn't know
  // that yet, so it's disabled for these two handlers.
  /* eslint-disable react-hooks/immutability */
  const handlePressIn: NonNullable<IconButtonProps["onPressIn"]> = (e) => {
    scale.value = withTiming(0.88, { duration });
    onPressIn?.(e);
  };
  const handlePressOut: NonNullable<IconButtonProps["onPressOut"]> = (e) => {
    scale.value = withTiming(1, { duration });
    onPressOut?.(e);
  };
  /* eslint-enable react-hooks/immutability */

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        {
          width: 40,
          height: 40,
          borderRadius: theme.radius.pill,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: variant === "surface" ? theme.colors.background.sunken : "transparent",
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      {...rest}
    >
      {icon}
    </AnimatedPressable>
  );
}
