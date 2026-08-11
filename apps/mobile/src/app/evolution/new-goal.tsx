import { useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button, Stack, Text, TextField, useTheme } from "@tfit/ui";
import type { GoalType } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { Chip } from "@/components/Chip";
import { useCreateGoal } from "@/hooks/useEvolution";
import { ApiRequestError } from "@/lib/api";

const GOAL_TYPE_OPTIONS: { value: GoalType; label: string }[] = [
  { value: "weight_target", label: "Peso" },
  { value: "measurement_target", label: "Medida" },
  { value: "custom", label: "Personalizada" },
];

export default function NewGoalScreen() {
  const theme = useTheme();
  const router = useRouter();
  const createGoal = useCreateGoal();

  const [title, setTitle] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("custom");
  const [targetValue, setTargetValue] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const canSubmit = title.trim().length > 0;

  const onSubmit = () => {
    if (!canSubmit) return;
    createGoal.mutate(
      {
        title: title.trim(),
        goalType,
        targetValue: targetValue ? Number(targetValue) : undefined,
        targetDate: targetDate || undefined,
      },
      { onSuccess: () => router.back() },
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24, gap: theme.space.lg }}>
        <Stack gap="xs">
          <Text variant="title">Nova meta</Text>
          <Text color="secondary">Defina algo concreto para acompanhar sua evolução.</Text>
        </Stack>

        <TextField label="Título" placeholder="Ex: Chegar a 80kg até dezembro" value={title} onChangeText={setTitle} />

        <Stack gap="sm">
          <Text variant="label" color="secondary">
            TIPO
          </Text>
          <Stack direction="row" gap="sm" style={{ flexWrap: "wrap" }}>
            {GOAL_TYPE_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={goalType === option.value}
                onPress={() => setGoalType(option.value)}
              />
            ))}
          </Stack>
        </Stack>

        {goalType !== "custom" ? (
          <TextField
            label={goalType === "weight_target" ? "Peso alvo (kg)" : "Medida alvo (cm)"}
            keyboardType="decimal-pad"
            value={targetValue}
            onChangeText={setTargetValue}
          />
        ) : null}

        <TextField
          label="Data alvo (opcional, AAAA-MM-DD)"
          value={targetDate}
          onChangeText={setTargetDate}
          placeholder="2026-12-31"
        />

        {createGoal.isError ? (
          <Text style={{ color: theme.colors.feedback.danger }}>
            {createGoal.error instanceof ApiRequestError
              ? createGoal.error.message
              : "Não conseguimos criar sua meta. Tente novamente."}
          </Text>
        ) : null}

        <Button label={createGoal.isPending ? "Criando..." : "Criar meta"} onPress={onSubmit} disabled={!canSubmit || createGoal.isPending} />
      </ScrollView>
    </Screen>
  );
}
