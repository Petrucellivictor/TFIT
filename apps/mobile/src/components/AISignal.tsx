import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { useTheme } from "@tfit/ui";

function Dot({ size, delayMs }: { size: number; delayMs: number }) {
  const theme = useTheme();
  const scale = useSharedValue(0.6);

  useEffect(() => {
    if (theme.reducedMotion) {
      scale.value = 1;
      return;
    }
    scale.value = withDelay(
      delayMs,
      withRepeat(withSequence(withTiming(1, { duration: 380 }), withTiming(0.6, { duration: 380 })), -1, false),
    );
  }, [scale, delayMs, theme.reducedMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ width: size, height: size, borderRadius: size, backgroundColor: theme.colors.accent.primary }, style]} />
  );
}

/**
 * TFIT's abstract "intelligence" signature — three pulsing dots, not a robot
 * or brain icon (per the design brief's explicit "no clichés" rule). Shown
 * wherever the system is generating/analyzing/explaining something.
 */
export function AISignal({ size = 8 }: { size?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: size * 0.6, alignItems: "center" }}>
      <Dot size={size} delayMs={0} />
      <Dot size={size} delayMs={160} />
      <Dot size={size} delayMs={320} />
    </View>
  );
}
