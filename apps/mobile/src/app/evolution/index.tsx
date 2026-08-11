import { ActivityIndicator, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { ScoreBar } from "@/components/ScoreBar";
import { Sparkline } from "@/components/Sparkline";
import { useProgress } from "@/hooks/useEvolution";

const GOAL_TYPE_LABELS: Record<string, string> = {
  weight_target: "Peso",
  measurement_target: "Medida",
  exercise_pr: "Recorde",
  custom: "Personalizada",
};

export default function EvolutionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading, isError } = useProgress();

  if (isLoading) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
        </Stack>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1, padding: 32 }}>
          <Text color="secondary" style={{ textAlign: "center" }}>
            Não conseguimos carregar sua evolução agora. Puxe para atualizar.
          </Text>
        </Stack>
      </Screen>
    );
  }

  const { fitScore, weightTrend, recentPersonalRecords, activeGoals, currentStreakDays } = data;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24, gap: theme.space.lg }}>
        <Text variant="title">Sua evolução</Text>

        {currentStreakDays > 0 ? (
          <Surface level="raised" style={{ padding: theme.space.md, flexDirection: "row", alignItems: "center", gap: theme.space.sm }}>
            <Text style={{ fontSize: 24 }}>🔥</Text>
            <Text variant="bodyStrong">{currentStreakDays} dias de check-in seguidos</Text>
          </Surface>
        ) : null}

        <Surface level="raised" style={{ padding: theme.space.lg, gap: theme.space.md }}>
          <Stack direction="row" justify="space-between" align="center">
            <Text variant="headline">FIT Score</Text>
            <Text style={{ fontSize: 32, fontWeight: "700", color: theme.colors.accent.primary }}>
              {fitScore.overall}
            </Text>
          </Stack>
          <Text variant="caption" color="secondary">
            Um indicador de consistência e evolução — não é um diagnóstico de saúde.
          </Text>
          <Stack gap="sm">
            <ScoreBar label="Consistência" value={fitScore.consistency} />
            <ScoreBar label="Treinamento" value={fitScore.training} />
            <ScoreBar label="Evolução" value={fitScore.evolution} />
            <ScoreBar label="Hábitos" value={fitScore.habits} />
            <ScoreBar label="Recuperação" value={fitScore.recovery} />
          </Stack>
        </Surface>

        <Surface level="raised" style={{ padding: theme.space.lg, gap: theme.space.sm }}>
          <Stack direction="row" justify="space-between" align="center">
            <Text variant="headline">Peso</Text>
            <Text color="secondary">
              {weightTrend.length > 0 ? `${weightTrend[weightTrend.length - 1]!.weightKg} kg` : "—"}
            </Text>
          </Stack>
          {weightTrend.length > 1 ? (
            <Sparkline values={weightTrend.map((w) => w.weightKg)} />
          ) : (
            <Text color="secondary" variant="caption">
              Registre seu peso ao longo do tempo para ver a tendência aqui.
            </Text>
          )}
          <Button label="Registrar peso e medidas" variant="secondary" onPress={() => router.push("/evolution/log-metrics")} />
        </Surface>

        <Surface level="raised" style={{ padding: theme.space.lg, gap: theme.space.sm }}>
          <Stack direction="row" justify="space-between" align="center">
            <Text variant="headline">Metas</Text>
          </Stack>
          {activeGoals.length === 0 ? (
            <Text color="secondary" variant="caption">
              Nenhuma meta ativa ainda.
            </Text>
          ) : (
            <Stack gap="sm">
              {activeGoals.map((goal) => (
                <Stack key={goal.id} direction="row" gap="sm" align="center">
                  <Ionicons name="flag-outline" size={18} color={theme.colors.accent.primary} />
                  <Stack style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{goal.title}</Text>
                    <Text variant="caption" color="secondary">
                      {GOAL_TYPE_LABELS[goal.goalType]}
                      {goal.targetDate ? ` · até ${goal.targetDate}` : ""}
                    </Text>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
          <Button label="Nova meta" variant="secondary" onPress={() => router.push("/evolution/new-goal")} />
        </Surface>

        <Surface level="raised" style={{ padding: theme.space.lg, gap: theme.space.sm }}>
          <Text variant="headline">Recordes recentes</Text>
          {recentPersonalRecords.length === 0 ? (
            <Text color="secondary" variant="caption">
              Nenhum recorde nos últimos 90 dias — continue treinando!
            </Text>
          ) : (
            <Stack gap="sm">
              {recentPersonalRecords.map((pr, index) => (
                <Stack key={index} direction="row" justify="space-between">
                  <Text variant="bodyStrong">{pr.exerciseName}</Text>
                  <Text color="secondary">
                    {pr.weightKg}kg × {pr.reps}
                  </Text>
                </Stack>
              ))}
            </Stack>
          )}
        </Surface>
      </ScrollView>
    </Screen>
  );
}
