import { useEffect, useState } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Stack, Text, useTheme } from "@tfit/ui";
import { AISignal } from "./AISignal";

const STEPS = [
  "Analisando seu perfil...",
  "Avaliando seu objetivo...",
  "Distribuindo o volume de treino...",
  "Organizando a recuperação...",
  "Montando seu plano...",
];

const STEP_DURATION_MS = 2200;

/**
 * Narrated progress for the AI workout-generation call — the request itself
 * is one opaque round trip with no real progress events, so this narrates
 * plausible sub-steps on a timer while genuinely waiting, and simply holds
 * on the last step (with the pulsing AISignal keeping it feeling alive)
 * if generation runs long, rather than looping or lying about completion.
 */
export function AIGenerationSequence() {
  const theme = useTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, STEP_DURATION_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const duration = theme.reducedMotion ? 0 : 150;
    opacity.value = withTiming(0, { duration }, () => {
      opacity.value = withTiming(1, { duration });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fade runs once per stepIndex change
  }, [stepIndex]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Stack align="center" gap="md">
      <AISignal size={10} />
      <Animated.View style={animatedStyle}>
        <Text variant="bodyStrong" style={{ textAlign: "center" }}>
          {STEPS[stepIndex]}
        </Text>
      </Animated.View>
    </Stack>
  );
}
