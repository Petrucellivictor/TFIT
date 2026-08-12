import { useState } from "react";
import { ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button, Stack, Surface, Text, TextField, useTheme } from "@tfit/ui";
import { Chip } from "@/components/Chip";
import { Screen } from "@/components/Screen";
import { ExercisePickerModal } from "@/components/ExercisePickerModal";
import { useCreateManualPlan } from "@/hooks/useWorkoutPlans";
import type { ExerciseListItem } from "@/hooks/useExercises";
import { ApiRequestError } from "@/lib/api";

interface BuilderExercise {
  key: string;
  exerciseId: string;
  name: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
}

interface BuilderDay {
  key: string;
  name: string;
  dayOfWeek: number;
  exercises: BuilderExercise[];
}

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function newKey() {
  return Math.random().toString(36).slice(2);
}

function newDay(index: number): BuilderDay {
  return { key: newKey(), name: `Dia ${index + 1}`, dayOfWeek: index + 1, exercises: [] };
}

export default function WorkoutBuilderScreen() {
  const theme = useTheme();
  const router = useRouter();
  const createPlan = useCreateManualPlan();

  const [splitName, setSplitName] = useState("");
  const [days, setDays] = useState<BuilderDay[]>([newDay(0)]);
  const [pickerTargetDayKey, setPickerTargetDayKey] = useState<string | null>(null);

  const updateDay = (dayKey: string, patch: Partial<BuilderDay>) => {
    setDays((prev) => prev.map((d) => (d.key === dayKey ? { ...d, ...patch } : d)));
  };

  const removeDay = (dayKey: string) => {
    setDays((prev) => prev.filter((d) => d.key !== dayKey));
  };

  const addDay = () => {
    if (days.length >= 7) return;
    setDays((prev) => [...prev, newDay(prev.length)]);
  };

  const onPickExercise = (exercise: ExerciseListItem) => {
    if (!pickerTargetDayKey) return;
    setDays((prev) =>
      prev.map((d) =>
        d.key === pickerTargetDayKey
          ? {
              ...d,
              exercises: [
                ...d.exercises,
                { key: newKey(), exerciseId: exercise.id, name: exercise.name, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
              ],
            }
          : d,
      ),
    );
    setPickerTargetDayKey(null);
  };

  const updateExercise = (dayKey: string, exerciseKey: string, patch: Partial<BuilderExercise>) => {
    setDays((prev) =>
      prev.map((d) =>
        d.key !== dayKey
          ? d
          : { ...d, exercises: d.exercises.map((e) => (e.key === exerciseKey ? { ...e, ...patch } : e)) },
      ),
    );
  };

  const removeExercise = (dayKey: string, exerciseKey: string) => {
    setDays((prev) =>
      prev.map((d) => (d.key !== dayKey ? d : { ...d, exercises: d.exercises.filter((e) => e.key !== exerciseKey) })),
    );
  };

  const canSave =
    splitName.trim().length > 0 && days.length > 0 && days.every((d) => d.name.trim().length > 0 && d.exercises.length > 0);

  const onSave = () => {
    createPlan.mutate(
      {
        splitName: splitName.trim(),
        workouts: days.map((d) => ({
          name: d.name.trim(),
          dayOfWeek: d.dayOfWeek,
          exercises: d.exercises.map((e, index) => ({
            exerciseId: e.exerciseId,
            order: index + 1,
            sets: e.sets,
            repsMin: e.repsMin,
            repsMax: e.repsMax,
            restSeconds: e.restSeconds,
          })),
        })),
      },
      { onSuccess: () => router.replace("/(app)/treinos/plans") },
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24, gap: theme.space.lg }}>
        <Stack gap="xs">
          <Text variant="title">Criar treino</Text>
          <Text color="secondary">Monte seu treino escolhendo exercícios da nossa biblioteca.</Text>
        </Stack>

        <TextField label="Nome do plano" placeholder="Ex: Meu treino ABC" value={splitName} onChangeText={setSplitName} />

        {days.map((day, dayIndex) => (
          <Surface key={day.key} level="raised" style={{ padding: theme.space.md, gap: theme.space.sm }}>
            <Stack direction="row" justify="space-between" align="center">
              <Stack style={{ flex: 1 }}>
                <TextField label={`Dia ${dayIndex + 1} — nome`} value={day.name} onChangeText={(v) => updateDay(day.key, { name: v })} />
              </Stack>
              {days.length > 1 ? (
                <Pressable
                  onPress={() => removeDay(day.key)}
                  style={{ paddingLeft: theme.space.sm, paddingTop: theme.space.lg }}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover ${day.name}`}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.colors.feedback.danger} />
                </Pressable>
              ) : null}
            </Stack>

            <Stack direction="row" gap="xs" style={{ flexWrap: "wrap" }}>
              {DAY_LABELS.map((label, i) => (
                <Chip key={label} label={label} selected={day.dayOfWeek === i + 1} onPress={() => updateDay(day.key, { dayOfWeek: i + 1 })} />
              ))}
            </Stack>

            <Stack gap="sm">
              {day.exercises.map((exercise) => (
                <Surface key={exercise.key} level="sunken" style={{ padding: theme.space.sm, gap: theme.space.xs }}>
                  <Stack direction="row" justify="space-between" align="center">
                    <Text variant="bodyStrong" style={{ flex: 1 }}>
                      {exercise.name}
                    </Text>
                    <Pressable
                      onPress={() => removeExercise(day.key, exercise.key)}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Remover ${exercise.name}`}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={theme.colors.text.secondary} />
                    </Pressable>
                  </Stack>
                  <Stack direction="row" gap="xs">
                    <Stack style={{ flex: 1 }}>
                      <TextField
                        label="Séries"
                        keyboardType="number-pad"
                        value={String(exercise.sets)}
                        onChangeText={(v) => updateExercise(day.key, exercise.key, { sets: Number(v) || 0 })}
                      />
                    </Stack>
                    <Stack style={{ flex: 1 }}>
                      <TextField
                        label="Reps mín"
                        keyboardType="number-pad"
                        value={String(exercise.repsMin)}
                        onChangeText={(v) => updateExercise(day.key, exercise.key, { repsMin: Number(v) || 0 })}
                      />
                    </Stack>
                    <Stack style={{ flex: 1 }}>
                      <TextField
                        label="Reps máx"
                        keyboardType="number-pad"
                        value={String(exercise.repsMax)}
                        onChangeText={(v) => updateExercise(day.key, exercise.key, { repsMax: Number(v) || 0 })}
                      />
                    </Stack>
                    <Stack style={{ flex: 1 }}>
                      <TextField
                        label="Descanso (s)"
                        keyboardType="number-pad"
                        value={String(exercise.restSeconds)}
                        onChangeText={(v) => updateExercise(day.key, exercise.key, { restSeconds: Number(v) || 0 })}
                      />
                    </Stack>
                  </Stack>
                </Surface>
              ))}
            </Stack>

            <Button label="+ Adicionar exercício" variant="secondary" onPress={() => setPickerTargetDayKey(day.key)} />
          </Surface>
        ))}

        {days.length < 7 ? <Button label="+ Adicionar dia" variant="secondary" onPress={addDay} /> : null}

        {createPlan.isError ? (
          <Text style={{ color: theme.colors.feedback.danger }}>
            {createPlan.error instanceof ApiRequestError ? createPlan.error.message : "Não conseguimos salvar. Tente novamente."}
          </Text>
        ) : null}

        <Button label={createPlan.isPending ? "Salvando..." : "Salvar treino"} onPress={onSave} disabled={!canSave || createPlan.isPending} />
      </ScrollView>

      <ExercisePickerModal visible={pickerTargetDayKey !== null} onClose={() => setPickerTargetDayKey(null)} onSelect={onPickExercise} />
    </Screen>
  );
}
