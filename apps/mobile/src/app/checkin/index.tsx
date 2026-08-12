import { useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button, Stack, Text, TextField, useTheme } from "@tfit/ui";
import type { GamificationEventResult } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { ScaleSelector } from "@/components/ScaleSelector";
import { Chip } from "@/components/Chip";
import { GamificationCelebration } from "@/components/GamificationCelebration";
import { useSubmitCheckin } from "@/hooks/useEvolution";
import { ApiRequestError } from "@/lib/api";

export default function CheckinScreen() {
  const theme = useTheme();
  const router = useRouter();
  const submitCheckin = useSubmitCheckin();

  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [disposition, setDisposition] = useState<number | null>(null);
  const [recoveryPerception, setRecoveryPerception] = useState<number | null>(null);
  const [hasPain, setHasPain] = useState(false);
  const [painNotes, setPainNotes] = useState("");
  const [gamification, setGamification] = useState<GamificationEventResult | null>(null);

  const canSubmit = energyLevel && sleepQuality && disposition && recoveryPerception;

  const onSubmit = () => {
    if (!canSubmit) return;
    submitCheckin.mutate(
      { energyLevel, sleepQuality, disposition, recoveryPerception, hasPain, painNotes: painNotes || undefined },
      {
        onSuccess: (res) => {
          const hasCelebration = res.gamification.xpAwarded > 0 || res.gamification.newAchievements.length > 0;
          if (hasCelebration) setGamification(res.gamification);
          else router.back();
        },
      },
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24, gap: theme.space.lg }}>
        <Stack gap="xs">
          <Text variant="title">Check-in do dia</Text>
          <Text color="secondary">Isso nos ajuda a ajustar seu treino ao seu momento.</Text>
        </Stack>

        <ScaleSelector label="Energia" value={energyLevel} onChange={setEnergyLevel} />
        <ScaleSelector label="Qualidade do sono" value={sleepQuality} onChange={setSleepQuality} />
        <ScaleSelector label="Disposição" value={disposition} onChange={setDisposition} />
        <ScaleSelector label="Sensação de recuperação" value={recoveryPerception} onChange={setRecoveryPerception} />

        <Stack gap="sm">
          <Text variant="label" color="secondary">
            SENTIU ALGUMA DOR?
          </Text>
          <Stack direction="row" gap="sm">
            <Chip label="Não" selected={!hasPain} onPress={() => setHasPain(false)} />
            <Chip label="Sim" selected={hasPain} onPress={() => setHasPain(true)} />
          </Stack>
          {hasPain ? (
            <TextField
              label="Onde? (opcional)"
              value={painNotes}
              onChangeText={setPainNotes}
              multiline
            />
          ) : null}
        </Stack>

        {submitCheckin.isError ? (
          <Text style={{ color: theme.colors.feedback.danger }}>
            {submitCheckin.error instanceof ApiRequestError
              ? submitCheckin.error.message
              : "Não conseguimos salvar seu check-in. Tente novamente."}
          </Text>
        ) : null}

        <Button
          label={submitCheckin.isPending ? "Salvando..." : "Salvar check-in"}
          onPress={onSubmit}
          disabled={!canSubmit || submitCheckin.isPending}
        />
      </ScrollView>
      <GamificationCelebration
        result={gamification}
        onDismiss={() => {
          setGamification(null);
          router.back();
        }}
      />
    </Screen>
  );
}
