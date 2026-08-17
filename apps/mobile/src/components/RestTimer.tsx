import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Button, Stack, Surface, Text, useTheme } from "@tfit/ui";
import { CircularTimer } from "./CircularTimer";

const EMPHASIS_THRESHOLD_SECONDS = 5;

export interface RestTimerProps {
  seconds: number;
  onDone: () => void;
  currentExerciseName?: string;
  currentSetNumber?: number;
  totalSets?: number;
  nextExerciseName?: string;
  nextSetLabel?: string;
}

export function RestTimer({
  seconds,
  onDone,
  currentExerciseName,
  currentSetNumber,
  totalSets,
  nextExerciseName,
  nextSetLabel,
}: RestTimerProps) {
  const theme = useTheme();
  const [remaining, setRemaining] = useState(seconds);
  const pulse = useSharedValue(1);
  const isEmphasized = remaining <= EMPHASIS_THRESHOLD_SECONDS && remaining > 0;

  useEffect(() => {
    if (remaining <= 0) {
      onDone();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-run on remaining tick
  }, [remaining]);

  useEffect(() => {
    if (!isEmphasized || theme.reducedMotion) return;
    pulse.value = withSequence(withTiming(1.15, { duration: 180 }), withTiming(1, { duration: 180 }));
  }, [isEmphasized, remaining, pulse, theme.reducedMotion]);

  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const ringColor = isEmphasized ? theme.colors.feedback.warning : undefined;

  return (
    <Stack align="center" gap="lg" style={{ flex: 1, justifyContent: "center", padding: 32 }}>
      {currentExerciseName ? (
        <Stack align="center" gap="xxs">
          {currentSetNumber && totalSets ? (
            <Surface level="sunken" radius="pill" style={{ paddingVertical: theme.space.xxs, paddingHorizontal: theme.space.sm }}>
              <Text variant="label" color="secondary">
                SÉRIE {currentSetNumber} DE {totalSets}
              </Text>
            </Surface>
          ) : null}
          <Text variant="headline">{currentExerciseName}</Text>
        </Stack>
      ) : null}
      <Text variant="label" color="secondary">
        DESCANSO
      </Text>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <CircularTimer progress={seconds > 0 ? remaining / seconds : 0} size={200} strokeWidth={12} strokeColor={ringColor} />
        <Animated.Text
          style={[
            {
              position: "absolute",
              fontSize: 56,
              fontWeight: "700",
              color: isEmphasized ? theme.colors.feedback.warning : theme.colors.accent.primary,
            },
            pulseStyle,
          ]}
        >
          {remaining}s
        </Animated.Text>
      </View>

      {nextExerciseName ? (
        <Surface level="raised" bordered style={{ padding: theme.space.md, width: "100%" }}>
          <Stack gap="xxs" align="center">
            <Text variant="label" color="secondary" style={{ letterSpacing: 0.6 }}>
              PRÓXIMA SÉRIE
            </Text>
            <Text variant="bodyStrong">{nextExerciseName}</Text>
            {nextSetLabel ? (
              <Text variant="caption" color="secondary">
                {nextSetLabel}
              </Text>
            ) : null}
          </Stack>
        </Surface>
      ) : null}

      <Button label="Pular descanso" variant="secondary" onPress={onDone} />
    </Stack>
  );
}
