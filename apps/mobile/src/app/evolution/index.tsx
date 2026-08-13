import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, ErrorState, Skeleton, Stack, Surface, Text, useTheme } from "@tfit/ui";
import type { Goal, WeightTrendPoint } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { ScoreBar } from "@/components/ScoreBar";
import { RadialGauge } from "@/components/RadialGauge";
import { Sparkline } from "@/components/Sparkline";
import { useProgress } from "@/hooks/useEvolution";

const GOAL_TYPE_LABELS: Record<string, string> = {
  weight_target: "Peso",
  measurement_target: "Medida",
  exercise_pr: "Recorde",
  custom: "Personalizada",
};

function computeWeightDelta(trend: WeightTrendPoint[]): { deltaKg: number; days: number } | null {
  if (trend.length < 2) return null;
  const latest = trend[trend.length - 1]!;
  const earliest = trend[0]!;
  const days = Math.round((new Date(latest.recordedAt).getTime() - new Date(earliest.recordedAt).getTime()) / 86400000);
  if (days < 1) return null;
  const deltaKg = Math.round((latest.weightKg - earliest.weightKg) * 10) / 10;
  return { deltaKg, days };
}

export default function EvolutionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading, isError } = useProgress();

  if (isLoading) {
    return (
      <Screen>
        <Stack gap="lg" style={{ padding: 24 }}>
          <Skeleton width="60%" height={28} />
          <Surface level="raised" style={{ padding: theme.space.lg, gap: theme.space.md }}>
            <Stack direction="row" align="center" gap="lg">
              <Skeleton width={104} height={104} radius="pill" />
              <Stack gap="sm" style={{ flex: 1 }}>
                <Skeleton width="80%" height={16} />
                <Skeleton width="60%" height={12} />
              </Stack>
            </Stack>
          </Surface>
          <Surface level="raised" style={{ padding: theme.space.lg, gap: theme.space.sm }}>
            <Skeleton width="40%" height={16} />
            <Skeleton height={40} />
          </Surface>
        </Stack>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <Stack style={{ flex: 1 }} justify="center">
          <ErrorState message="Não conseguimos carregar sua evolução agora." />
        </Stack>
      </Screen>
    );
  }

  const { fitScore, weightTrend, recentPersonalRecords, activeGoals, currentStreakDays } = data;
  const weightDelta = computeWeightDelta(weightTrend);
  const latestWeight = weightTrend.length > 0 ? weightTrend[weightTrend.length - 1]!.weightKg : null;
  const startWeight = weightTrend.length > 0 ? weightTrend[0]!.weightKg : null;

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

        <Surface level="raised" bordered glow style={{ padding: theme.space.lg, gap: theme.space.md }}>
          <Stack direction="row" align="center" gap="lg">
            <RadialGauge value={fitScore.overall} size={104} strokeWidth={10} />
            <Stack gap="xxs" style={{ flex: 1 }}>
              <Text variant="headline">FIT Score</Text>
              <Text variant="caption" color="secondary">
                Um indicador de consistência e evolução — não é um diagnóstico de saúde.
              </Text>
            </Stack>
          </Stack>
          <Stack gap="sm">
            <ScoreBar label="Consistência" value={fitScore.consistency} />
            <ScoreBar label="Treinamento" value={fitScore.training} />
            <ScoreBar label="Evolução" value={fitScore.evolution} />
            <ScoreBar label="Hábitos" value={fitScore.habits} />
            <ScoreBar label="Recuperação" value={fitScore.recovery} />
          </Stack>
        </Surface>

        <Surface level="raised" style={{ padding: theme.space.lg, gap: theme.space.sm }}>
          <Stack direction="row" justify="space-between" align="flex-end">
            <Text variant="headline">Peso</Text>
            <Stack align="flex-end" gap="xxs">
              <Text variant="bodyStrong">{latestWeight !== null ? `${latestWeight} kg` : "—"}</Text>
              {weightDelta ? (
                <Text
                  variant="caption"
                  style={{ color: weightDelta.deltaKg <= 0 ? theme.colors.feedback.success : theme.colors.feedback.warning }}
                >
                  {weightDelta.deltaKg === 0 ? "±" : weightDelta.deltaKg < 0 ? "↓" : "↑"} {Math.abs(weightDelta.deltaKg)} kg ·
                  últimos {weightDelta.days} dias
                </Text>
              ) : null}
            </Stack>
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
            <Stack gap="md">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} currentWeightKg={latestWeight} startWeightKg={startWeight} />
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

function GoalCard({
  goal,
  currentWeightKg,
  startWeightKg,
}: {
  goal: Goal;
  currentWeightKg: number | null;
  startWeightKg: number | null;
}) {
  const theme = useTheme();
  const showsProgress =
    goal.goalType === "weight_target" &&
    goal.targetValue !== null &&
    currentWeightKg !== null &&
    startWeightKg !== null &&
    startWeightKg !== goal.targetValue;

  return (
    <Stack gap="sm">
      <Stack direction="row" gap="sm" align="center">
        <Ionicons name="flag-outline" size={18} color={theme.colors.accent.primary} />
        <Stack style={{ flex: 1 }}>
          <Text variant="bodyStrong">{goal.title}</Text>
          <Text variant="caption" color="secondary">
            {GOAL_TYPE_LABELS[goal.goalType]}
            {goal.targetDate ? ` · até ${goal.targetDate}` : ""}
          </Text>
        </Stack>
        {showsProgress ? (
          <Text variant="caption" color="secondary">
            {currentWeightKg} → {goal.targetValue} kg
          </Text>
        ) : null}
      </Stack>
      {showsProgress ? (
        <GoalProgressBar start={startWeightKg!} current={currentWeightKg!} target={goal.targetValue!} />
      ) : null}
    </Stack>
  );
}

function GoalProgressBar({ start, current, target }: { start: number; current: number; target: number }) {
  const theme = useTheme();
  const percent = Math.min(100, Math.max(0, Math.round(((current - start) / (target - start)) * 100)));

  return (
    <Stack gap="xxs">
      <View
        style={{
          height: 6,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.background.sunken,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${percent}%`,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.accent.primary,
          }}
        />
      </View>
      <Text variant="caption" color="secondary">
        {percent}% da meta
      </Text>
    </Stack>
  );
}
