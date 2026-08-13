import { useEffect } from "react";
import type { DimensionValue, ViewProps } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useTheme } from "../theme/ThemeProvider";
import type { RadiusToken } from "../tokens/spacing";

export interface SkeletonProps extends ViewProps {
  width?: DimensionValue;
  height?: number;
  radius?: RadiusToken;
}

/** Loading placeholder with a gentle pulse — used instead of a bare spinner wherever the eventual layout is known. */
export function Skeleton({ width = "100%", height = 16, radius = "soft", style, ...rest }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (theme.reducedMotion) {
      opacity.value = 0.6;
      return;
    }
    opacity.value = withRepeat(withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [opacity, theme.reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: theme.radius[radius], backgroundColor: theme.colors.background.sunken },
        animatedStyle,
        style,
      ]}
      {...rest}
    />
  );
}
