import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import { Stack, Text, useTheme } from "@tfit/ui";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function RadialGauge({
  value,
  size = 120,
  strokeWidth = 12,
  label,
  valueLabel,
}: {
  /** 0-100. */
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  /** Overrides the default numeric display in the center. */
  valueLabel?: string;
}) {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(clamped / 100, { duration: theme.reducedMotion ? 0 : 900 });
  }, [clamped, progress, theme.reducedMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <Stack align="center" gap="xs">
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={theme.colors.gradient.primary[0]} />
              <Stop offset="1" stopColor={theme.colors.gradient.primary[1]} />
            </LinearGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.colors.background.sunken} strokeWidth={strokeWidth} fill="none" />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeLinecap="round"
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
            animatedProps={animatedProps}
          />
        </Svg>
        <View style={{ position: "absolute", alignItems: "center" }}>
          <Text style={{ fontSize: size * 0.28, fontWeight: "700", color: theme.colors.text.primary }}>
            {valueLabel ?? Math.round(clamped)}
          </Text>
        </View>
      </View>
      {label ? (
        <Text variant="label" color="secondary">
          {label}
        </Text>
      ) : null}
    </Stack>
  );
}
