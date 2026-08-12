import { ActivityIndicator, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { useActivatePlan, useWorkoutPlanDetail } from "@/hooks/useWorkoutPlans";

const DAY_LABELS = ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export default function PlanDetailScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading } = useWorkoutPlanDetail(planId);
  const activatePlan = useActivatePlan();

  if (isLoading || !data?.plan) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
        </Stack>
      </Screen>
    );
  }

  const { plan } = data;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24, gap: theme.space.md }}>
        <Stack gap="xs">
          <Text variant="title">{plan.splitName}</Text>
          {plan.reasoning ? <Text color="secondary">{plan.reasoning}</Text> : null}
        </Stack>

        {plan.status !== "active" ? (
          <Button label="Ativar este plano" onPress={() => activatePlan.mutate(plan.id)} disabled={activatePlan.isPending} />
        ) : null}

        <Stack gap="sm">
          {plan.workouts.map((workout) => (
            <Pressable key={workout.id} onPress={() => router.push({ pathname: "/(app)/treinos/[workoutId]", params: { workoutId: workout.id, planId: plan.id } })}>
              <Surface level="raised" style={{ padding: theme.space.md, gap: theme.space.xxs }}>
                <Stack direction="row" justify="space-between" align="center">
                  <Text variant="bodyStrong">{workout.name}</Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.text.secondary} />
                </Stack>
                <Text color="secondary" variant="caption">
                  {DAY_LABELS[workout.dayOfWeek]} · {workout.exercises.length} exercícios
                </Text>
              </Surface>
            </Pressable>
          ))}
        </Stack>
      </ScrollView>
    </Screen>
  );
}
