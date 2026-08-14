import { ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ErrorState, Skeleton, Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { useExerciseDetail } from "@/hooks/useExerciseDetail";

const MUSCLE_LABEL: Record<string, string> = {
  chest: "Peito",
  back: "Costas",
  shoulders: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  quadriceps: "Quadríceps",
  hamstrings: "Posterior de coxa",
  glutes: "Glúteos",
  calves: "Panturrilha",
  abs: "Abdômen",
  forearms: "Antebraços",
  full_body: "Corpo inteiro",
  cardio: "Cardio",
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { data, isLoading, isError } = useExerciseDetail(id);

  if (isLoading) {
    return (
      <Screen>
        <Stack gap="lg" style={{ padding: 24 }}>
          <Skeleton width="60%" height={24} />
          <Skeleton width="40%" height={14} />
          <Skeleton height={100} />
          <Skeleton height={140} />
        </Stack>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <Stack style={{ flex: 1 }} justify="center">
          <ErrorState message="Não conseguimos carregar esse exercício agora." />
        </Stack>
      </Screen>
    );
  }

  const { exercise } = data;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24, gap: theme.space.lg }}>
        <Stack gap="xxs">
          <Text variant="title">{exercise.name}</Text>
          <Text color="secondary">
            {MUSCLE_LABEL[exercise.primaryMuscle] ?? exercise.primaryMuscle} · {exercise.equipment} ·{" "}
            {LEVEL_LABEL[exercise.level] ?? exercise.level}
          </Text>
        </Stack>

        {/*
          Phase 2 (gated on the 3D rendering spike) adds an Exercise3DViewer
          here, above these text sections, whenever exercise.animation is
          non-null. Until then — and permanently for exercises that never
          get an animation — the text sections below are the whole screen.
        */}

        <Surface level="raised" style={{ padding: theme.space.md }}>
          <Text color="secondary">{exercise.description}</Text>
        </Surface>

        <Stack gap="xs">
          <Text variant="label" color="secondary">
            COMO EXECUTAR
          </Text>
          <Text>{exercise.instructions}</Text>
        </Stack>

        {exercise.commonMistakes ? (
          <Stack gap="xs">
            <Text variant="label" color="secondary">
              ERROS COMUNS
            </Text>
            <Text>{exercise.commonMistakes}</Text>
          </Stack>
        ) : null}

        {exercise.secondaryMuscles.length > 0 ? (
          <Stack gap="xs">
            <Text variant="label" color="secondary">
              MÚSCULOS SECUNDÁRIOS
            </Text>
            <Text color="secondary">
              {exercise.secondaryMuscles.map((muscle) => MUSCLE_LABEL[muscle] ?? muscle).join(", ")}
            </Text>
          </Stack>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
