import React from "react";
import { Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useTheme } from "@tfit/ui";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingActionButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const duration = theme.reducedMotion ? 0 : theme.motion.duration.fast;
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  // Reanimated shared values are mutated by design outside React's render
  // cycle — the eslint-plugin-react-hooks immutability rule doesn't know
  // that yet, so it's disabled for these two handlers.
  /* eslint-disable react-hooks/immutability */
  const onPressIn = () => {
    scale.value = withTiming(0.92, { duration });
  };
  const onPressOut = () => {
    scale.value = withTiming(1, { duration });
  };
  /* eslint-enable react-hooks/immutability */

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Ações rápidas"
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        animatedStyle,
        {
          position: "absolute",
          alignSelf: "center",
          bottom: 28,
          width: 60,
          height: 60,
          borderRadius: theme.radius.pill,
          overflow: "hidden",
          shadowColor: theme.colors.accent.primary,
          shadowOpacity: theme.scheme === "dark" ? 0.55 : 0.35,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        },
      ]}
    >
      <LinearGradient
        colors={theme.colors.gradient.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
      >
        <Ionicons name="add" size={30} color={theme.colors.accent.onPrimary} />
      </LinearGradient>
    </AnimatedPressable>
  );
}
