import { useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button, Stack, Text, TextField, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { useLogBodyMetric, useLogMeasurement } from "@/hooks/useEvolution";
import { ApiRequestError } from "@/lib/api";

export default function LogMetricsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const logBodyMetric = useLogBodyMetric();
  const logMeasurement = useLogMeasurement();

  const [weightKg, setWeightKg] = useState("");
  const [bodyFatPercent, setBodyFatPercent] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [chestCm, setChestCm] = useState("");
  const [armCm, setArmCm] = useState("");
  const [thighCm, setThighCm] = useState("");

  const isPending = logBodyMetric.isPending || logMeasurement.isPending;
  const error = logBodyMetric.error ?? logMeasurement.error;

  const onSubmit = async () => {
    const tasks: Promise<unknown>[] = [];

    if (weightKg) {
      tasks.push(
        logBodyMetric.mutateAsync({
          weightKg: Number(weightKg),
          bodyFatPercent: bodyFatPercent ? Number(bodyFatPercent) : undefined,
        }),
      );
    }

    const measurementFields = { waistCm, chestCm, armCm, thighCm };
    const hasMeasurement = Object.values(measurementFields).some((v) => v.length > 0);
    if (hasMeasurement) {
      tasks.push(
        logMeasurement.mutateAsync({
          waistCm: waistCm ? Number(waistCm) : undefined,
          chestCm: chestCm ? Number(chestCm) : undefined,
          armCm: armCm ? Number(armCm) : undefined,
          thighCm: thighCm ? Number(thighCm) : undefined,
        }),
      );
    }

    if (tasks.length === 0) return;

    try {
      await Promise.all(tasks);
      router.back();
    } catch {
      // error state already surfaced via mutation.error below
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24, gap: theme.space.lg }}>
        <Stack gap="xs">
          <Text variant="title">Registrar peso e medidas</Text>
          <Text color="secondary">Preencha o que quiser medir hoje — tudo é opcional.</Text>
        </Stack>

        <Stack gap="md">
          <Text variant="label" color="secondary">
            PESO
          </Text>
          <Stack direction="row" gap="md">
            <Stack style={{ flex: 1 }}>
              <TextField label="Peso (kg)" keyboardType="decimal-pad" value={weightKg} onChangeText={setWeightKg} />
            </Stack>
            <Stack style={{ flex: 1 }}>
              <TextField
                label="% gordura (opcional)"
                keyboardType="decimal-pad"
                value={bodyFatPercent}
                onChangeText={setBodyFatPercent}
              />
            </Stack>
          </Stack>
        </Stack>

        <Stack gap="md">
          <Text variant="label" color="secondary">
            MEDIDAS (CM)
          </Text>
          <Stack direction="row" gap="md">
            <Stack style={{ flex: 1 }}>
              <TextField label="Cintura" keyboardType="decimal-pad" value={waistCm} onChangeText={setWaistCm} />
            </Stack>
            <Stack style={{ flex: 1 }}>
              <TextField label="Peito" keyboardType="decimal-pad" value={chestCm} onChangeText={setChestCm} />
            </Stack>
          </Stack>
          <Stack direction="row" gap="md">
            <Stack style={{ flex: 1 }}>
              <TextField label="Braço" keyboardType="decimal-pad" value={armCm} onChangeText={setArmCm} />
            </Stack>
            <Stack style={{ flex: 1 }}>
              <TextField label="Coxa" keyboardType="decimal-pad" value={thighCm} onChangeText={setThighCm} />
            </Stack>
          </Stack>
        </Stack>

        {error ? (
          <Text style={{ color: theme.colors.feedback.danger }}>
            {error instanceof ApiRequestError ? error.message : "Não conseguimos salvar. Tente novamente."}
          </Text>
        ) : null}

        <Button label={isPending ? "Salvando..." : "Salvar"} onPress={onSubmit} disabled={isPending} />
      </ScrollView>
    </Screen>
  );
}
