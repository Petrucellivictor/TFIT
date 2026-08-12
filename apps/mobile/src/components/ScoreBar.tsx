import { useEffect } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Stack, Text, useTheme } from "@tfit/ui";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const theme = useTheme();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(value, { duration: theme.reducedMotion ? 0 : 700 });
  }, [value, width, theme.reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <Stack gap="xxs">
      <Stack direction="row" justify="space-between">
        <Text variant="caption" color="secondary">
          {label}
        </Text>
        <Text variant="caption" color="secondary">
          {value}
        </Text>
      </Stack>
      <View
        style={{
          height: 6,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.background.sunken,
          overflow: "hidden",
        }}
      >
        <AnimatedLinearGradient
          colors={theme.colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[{ height: "100%", borderRadius: theme.radius.pill }, animatedStyle]}
        />
      </View>
    </Stack>
  );
}
