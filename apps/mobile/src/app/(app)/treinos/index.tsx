import { useState } from "react";
import { ActivityIndicator, FlatList, LayoutAnimation, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Stack, Surface, Text, useTheme } from "@tfit/ui";
import type { WorkoutDetail } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { AIGenerationSequence } from "@/components/AIGenerationSequence";
import { AISignal } from "@/components/AISignal";
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
  const router = useRouter();
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
          <AIGenerationSequence />
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
      <Text color="secondary">ou</Text>
      <Button label="Criar treino manualmente" variant="secondary" onPress={() => router.push("/(app)/treinos/builder")} />
      <Button label="Ver meus planos" variant="secondary" onPress={() => router.push("/(app)/treinos/plans")} />
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
            <Stack direction="row" justify="space-between" align="center">
              <Text variant="title">{plan.splitName}</Text>
              <Pressable onPress={() => router.push("/(app)/treinos/plans")}>
                <Text variant="label" style={{ color: theme.colors.accent.primary }}>
                  Meus planos
                </Text>
              </Pressable>
            </Stack>
            {plan.reasoning ? (
              <>
                <Pressable
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setShowReasoning((v) => !v);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Por que esse treino?"
                  accessibilityState={{ expanded: showReasoning }}
                >
                  <Stack direction="row" gap="xs" align="center">
                    <AISignal size={5} />
                    <Text variant="label" style={{ color: theme.colors.accent.primary }}>
                      POR QUE ESSE TREINO?
                    </Text>
                    <Ionicons
                      name={showReasoning ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={theme.colors.accent.primary}
                    />
                  </Stack>
                </Pressable>
                {showReasoning ? (
                  <Surface level="sunken" bordered style={{ padding: theme.space.md }}>
                    <Text color="secondary">{plan.reasoning}</Text>
                  </Surface>
                ) : null}
              </>
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
