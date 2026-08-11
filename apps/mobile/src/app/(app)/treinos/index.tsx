import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Stack, Surface, Text, useTheme } from "@tfit/ui";
import type { WorkoutDetail } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { useGenerateWorkout, useWorkoutPlan } from "@/hooks/useWorkoutPlan";
import { ApiRequestError } from "@/lib/api";

const DAY_LABELS = ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

function muscleSummary(workout: WorkoutDetail) {
  const muscles = [...new Set(workout.exercises.map((e) => e.exercise.primaryMuscle))];
  return muscles.join(" · ");
}

function WorkoutCard({ workout, onPress }: { workout: WorkoutDetail; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Surface level="raised" style={{ padding: theme.space.md, gap: theme.space.xxs }}>
        <Stack direction="row" justify="space-between" align="center">
          <Text variant="bodyStrong">{workout.name}</Text>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.text.secondary} />
        </Stack>
        <Text color="secondary" variant="caption">
          {DAY_LABELS[workout.dayOfWeek]} · {workout.exercises.length} exercícios
        </Text>
        <Text color="secondary" variant="caption">
          {muscleSummary(workout)}
        </Text>
      </Surface>
    </Pressable>
  );
}

function GenerateEmptyState() {
  const theme = useTheme();
  const generate = useGenerateWorkout();

  return (
    <Stack align="center" justify="center" gap="md" style={{ flex: 1, padding: 32 }}>
      <Ionicons name="sparkles-outline" size={40} color={theme.colors.accent.primary} />
      <Text variant="headline" style={{ textAlign: "center" }}>
        Vamos montar seu primeiro treino
      </Text>
      <Text color="secondary" style={{ textAlign: "center" }}>
        Nossa IA vai analisar sua avaliação e criar um plano de treino sob medida para você.
      </Text>
      {generate.isPending ? (
        <Stack align="center" gap="sm">
          <ActivityIndicator />
          <Text color="secondary" variant="caption" style={{ textAlign: "center" }}>
            Isso pode levar cerca de um minuto — estamos revisando segurança e qualidade do treino.
          </Text>
        </Stack>
      ) : (
        <Button label="Gerar meu treino" onPress={() => generate.mutate()} />
      )}
      {generate.isError ? (
        <Text style={{ color: theme.colors.feedback.danger, textAlign: "center" }}>
          {generate.error instanceof ApiRequestError
            ? generate.error.message
            : "Não conseguimos gerar seu treino agora. Tente novamente."}
        </Text>
      ) : null}
    </Stack>
  );
}

export default function TreinosScreen() {
  const theme = useTheme();
  const { data, isLoading, isError } = useWorkoutPlan();
  const router = useRouter();
  const [showReasoning, setShowReasoning] = useState(false);

  if (isLoading) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
        </Stack>
      </Screen>
    );
  }

  if (isError) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1, padding: 32 }}>
          <Text color="secondary" style={{ textAlign: "center" }}>
            Não conseguimos carregar seu treino agora. Seus dados estão seguros. Puxe para atualizar.
          </Text>
        </Stack>
      </Screen>
    );
  }

  if (!data?.plan) {
    return (
      <Screen>
        <GenerateEmptyState />
      </Screen>
    );
  }

  const { plan } = data;

  return (
    <Screen>
      <FlatList
        data={plan.workouts}
        keyExtractor={(w) => w.id}
        contentContainerStyle={{ padding: 24, gap: theme.space.md }}
        ItemSeparatorComponent={() => <Stack style={{ height: theme.space.sm }} />}
        ListHeaderComponent={
          <Stack gap="sm" style={{ marginBottom: theme.space.md }}>
            <Text variant="title">{plan.splitName}</Text>
            <Pressable onPress={() => setShowReasoning((v) => !v)}>
              <Stack direction="row" gap="xxs" align="center">
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.accent.primary} />
                <Text variant="label" color="primary" style={{ color: theme.colors.accent.primary }}>
                  Por que esse treino?
                </Text>
              </Stack>
            </Pressable>
            {showReasoning ? (
              <Surface level="sunken" style={{ padding: theme.space.md }}>
                <Text color="secondary">{plan.reasoning}</Text>
              </Surface>
            ) : null}
          </Stack>
        }
        renderItem={({ item }) => (
          <WorkoutCard workout={item} onPress={() => router.push(`/(app)/treinos/${item.id}`)} />
        )}
      />
    </Screen>
  );
}
