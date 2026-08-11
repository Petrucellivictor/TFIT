import { ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter, Stack as RouterStack } from "expo-router";
import { Button, Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { useWorkoutPlan } from "@/hooks/useWorkoutPlan";
import { useStartSession } from "@/hooks/useWorkoutSession";
import { ApiRequestError } from "@/lib/api";

export default function WorkoutDetailScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { data } = useWorkoutPlan();
  const startSession = useStartSession();

  const workout = data?.plan?.workouts.find((w) => w.id === workoutId);

  if (!workout) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
        </Stack>
      </Screen>
    );
  }

  const onStart = () => {
    startSession.mutate(workout.id, {
      onSuccess: ({ session }) =>
        router.push({
          pathname: "/workout-session/[sessionId]",
          params: { sessionId: session.id, workout: JSON.stringify(workout) },
        }),
    });
  };

  return (
    <Screen>
      <RouterStack.Screen options={{ title: workout.name, headerShown: true }} />
      <ScrollView contentContainerStyle={{ padding: 24, gap: theme.space.md }}>
        <Stack gap="sm">
          {workout.exercises.map((item, index) => (
            <Surface key={item.id} level="raised" style={{ padding: theme.space.md, gap: theme.space.xxs }}>
              <Text variant="label" color="secondary">
                {index + 1}. {item.exercise.primaryMuscle} · {item.exercise.equipment}
              </Text>
              <Text variant="bodyStrong">{item.exercise.name}</Text>
              <Text color="secondary">
                {item.sets} séries de {item.repsMin}-{item.repsMax} reps · {item.restSeconds}s de descanso
              </Text>
              {item.notes ? (
                <Text variant="caption" color="secondary">
                  {item.notes}
                </Text>
              ) : null}
            </Surface>
          ))}
        </Stack>

        {startSession.isError ? (
          <Text style={{ color: theme.colors.feedback.danger }}>
            {startSession.error instanceof ApiRequestError
              ? startSession.error.message
              : "Não conseguimos iniciar o treino. Tente novamente."}
          </Text>
        ) : null}

        <Button
          label={startSession.isPending ? "Iniciando..." : "Iniciar treino"}
          onPress={onStart}
          disabled={startSession.isPending}
        />
      </ScrollView>
    </Screen>
  );
}
