import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Stack, Text, useTheme } from "@tfit/ui";

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
        <Animated.View
          style={[
            { height: "100%", backgroundColor: theme.colors.accent.primary, borderRadius: theme.radius.pill },
            animatedStyle,
          ]}
        />
      </View>
    </Stack>
  );
}
