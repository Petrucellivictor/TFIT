import { useEffect } from "react";
import Svg, { Circle } from "react-native-svg";
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import { useTheme } from "@tfit/ui";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CircularTimer({
  progress,
  size = 200,
  strokeWidth = 12,
  strokeColor,
}: {
  /** Remaining fraction, 1 (full) → 0 (empty). */
  progress: number;
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
}) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: theme.reducedMotion ? 0 : 900, easing: Easing.linear });
  }, [progress, animatedProgress, theme.reducedMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.colors.background.sunken} strokeWidth={strokeWidth} fill="none" />
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={strokeColor ?? theme.colors.accent.primary}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeLinecap="round"
        rotation={-90}
        origin={`${size / 2}, ${size / 2}`}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
