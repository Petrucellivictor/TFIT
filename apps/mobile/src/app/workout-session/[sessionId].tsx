import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, IconButton, Stack, Surface, Text, TextField, useTheme } from "@tfit/ui";
import type { GamificationEventResult, SetFeedback, WorkoutDetail } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { Chip } from "@/components/Chip";
import { RestTimer } from "@/components/RestTimer";
import { GamificationCelebration } from "@/components/GamificationCelebration";
import { useCompleteSession, useLogSet } from "@/hooks/useWorkoutSession";

interface SetTask {
  exerciseIndex: number;
  setNumber: number;
  totalSets: number;
  workoutExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
}

const FEEDBACK_OPTIONS: { value: SetFeedback; label: string }[] = [
  { value: "easy", label: "Fácil" },
  { value: "adequate", label: "Adequado" },
  { value: "hard", label: "Difícil" },
  { value: "very_hard", label: "Muito difícil" },
];

function buildTasks(workout: WorkoutDetail): SetTask[] {
  return workout.exercises.flatMap((item, exerciseIndex) =>
    Array.from({ length: item.sets }, (_, i) => ({
      exerciseIndex,
      setNumber: i + 1,
      totalSets: item.sets,
      workoutExerciseId: item.id,
      exerciseId: item.exercise.id,
      exerciseName: item.exercise.name,
      repsMin: item.repsMin,
      repsMax: item.repsMax,
      restSeconds: item.restSeconds,
    })),
  );
}

export default function WorkoutSessionScreen() {
  const { sessionId, workout: workoutParam } = useLocalSearchParams<{
    sessionId: string;
    workout: string;
  }>();
  const workout = useMemo(() => JSON.parse(workoutParam) as WorkoutDetail, [workoutParam]);
  const tasks = useMemo(() => buildTasks(workout), [workout]);

  const theme = useTheme();
  const router = useRouter();
  const logSet = useLogSet(sessionId);
  const completeSession = useCompleteSession(sessionId);

  const [taskIndex, setTaskIndex] = useState(0);
  const [phase, setPhase] = useState<"logging" | "resting" | "summary" | "completed">("logging");
  const [reps, setReps] = useState(String(tasks[0]?.repsMax ?? ""));
  const [weight, setWeight] = useState("");
  const [feedback, setFeedback] = useState<SetFeedback | null>(null);
  const [setBanner, setSetBanner] = useState<{ result: GamificationEventResult; isNewPersonalRecord: boolean } | null>(
    null,
  );
  const [completionResult, setCompletionResult] = useState<GamificationEventResult | null>(null);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [prCount, setPrCount] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(null);

  const task = tasks[taskIndex];
  const nextTask = tasks[taskIndex + 1];
  const isLastTask = taskIndex === tasks.length - 1;

  const exerciseCount = new Set(workout.exercises.map((e) => e.id)).size;

  if (phase === "completed") {
    return (
      <Screen>
        <Stack align="center" justify="center" gap="lg" style={{ flex: 1, padding: 32 }}>
          <Ionicons name="checkmark-circle" size={56} color={theme.colors.accent.primary} />
          <Text variant="title" style={{ textAlign: "center" }}>
            Treino concluído
          </Text>

          <Surface level="raised" bordered style={{ padding: theme.space.lg, width: "100%" }}>
            <Stack direction="row" style={{ flexWrap: "wrap" }} gap="lg">
              {durationMinutes !== null ? <SummaryStat label="MINUTOS" value={String(durationMinutes)} /> : null}
              <SummaryStat label="SÉRIES" value={String(tasks.length)} />
              <SummaryStat label="EXERCÍCIOS" value={String(exerciseCount)} />
              {totalXpEarned > 0 ? <SummaryStat label="XP GANHO" value={`+${totalXpEarned}`} /> : null}
              {completionResult?.currentStreak ? (
                <SummaryStat label="SEQUÊNCIA" value={`🔥 ${completionResult.currentStreak}`} />
              ) : null}
              {prCount > 0 ? <SummaryStat label="NOVOS RECORDES" value={String(prCount)} /> : null}
            </Stack>
          </Surface>

          <Button label="Continuar" onPress={() => router.replace("/(app)/treinos")} />
        </Stack>
        <GamificationCelebration result={completionResult} onDismiss={() => setCompletionResult(null)} />
      </Screen>
    );
  }

  if (phase === "summary" || !task) {
    return (
      <Screen>
        <Stack align="center" justify="center" gap="lg" style={{ flex: 1, padding: 32 }}>
          <Ionicons name="checkmark-circle" size={56} color={theme.colors.accent.primary} />
          <Text variant="title" style={{ textAlign: "center" }}>
            Última série concluída
          </Text>
          <Text color="secondary" style={{ textAlign: "center" }}>
            Você completou {tasks.length} séries em {workout.name}.
          </Text>
          <Button
            label={completeSession.isPending ? "Salvando..." : "Concluir treino"}
            onPress={() =>
              completeSession.mutate(undefined, {
                onSuccess: (res) => {
                  setTotalXpEarned((xp) => xp + res.gamification.xpAwarded);
                  setCompletionResult(res.gamification);
                  if (res.session.completedAt) {
                    const minutes = Math.max(
                      1,
                      Math.round(
                        (new Date(res.session.completedAt).getTime() - new Date(res.session.startedAt).getTime()) / 60000,
                      ),
                    );
                    setDurationMinutes(minutes);
                  }
                  setPhase("completed");
                },
              })
            }
            disabled={completeSession.isPending}
          />
        </Stack>
      </Screen>
    );
  }

  if (phase === "resting") {
    return (
      <Screen>
        <RestTimer
          seconds={task.restSeconds}
          currentExerciseName={task.exerciseName}
          currentSetNumber={task.setNumber}
          totalSets={task.totalSets}
          nextExerciseName={nextTask?.exerciseName}
          nextSetLabel={nextTask ? `${nextTask.repsMin}-${nextTask.repsMax} repetições` : undefined}
          onDone={() => {
            const next = taskIndex + 1;
            setTaskIndex(next);
            setReps(String(tasks[next]?.repsMax ?? ""));
            if (tasks[next]?.exerciseIndex !== task.exerciseIndex) setWeight("");
            setFeedback(null);
            setPhase("logging");
          }}
        />
      </Screen>
    );
  }

  const onCompleteSet = () => {
    const repsCompleted = Number(reps);
    if (!Number.isFinite(repsCompleted) || repsCompleted < 0) return;

    logSet.mutate(
      {
        workoutExerciseId: task.workoutExerciseId,
        setNumber: task.setNumber,
        repsCompleted,
        weightKg: weight ? Number(weight) : undefined,
        feedback: feedback ?? undefined,
      },
      {
        onSuccess: (res) => {
          setTotalXpEarned((xp) => xp + res.gamification.xpAwarded);
          if (res.isNewPersonalRecord) setPrCount((c) => c + 1);
          if (
            res.isNewPersonalRecord ||
            res.gamification.xpAwarded > 0 ||
            res.gamification.newAchievements.length > 0 ||
            res.gamification.leveledUp
          ) {
            setSetBanner({ result: res.gamification, isNewPersonalRecord: res.isNewPersonalRecord });
          }
          if (isLastTask) {
            setPhase("summary");
          } else {
            setPhase("resting");
          }
        },
      },
    );
  };

  return (
    <Screen>
      <Stack gap="lg" style={{ flex: 1, padding: 24 }}>
        <Stack gap="xxs">
          <Text variant="label" color="secondary">
            SÉRIE {task.setNumber} DE {task.totalSets}
          </Text>
          <Stack direction="row" align="center" gap="xs">
            <Text variant="title" style={{ flex: 1 }}>
              {task.exerciseName}
            </Text>
            <IconButton
              icon={<Ionicons name="information-circle-outline" size={22} color={theme.colors.text.secondary} />}
              accessibilityLabel={`Ver detalhes de ${task.exerciseName}`}
              onPress={() => router.push({ pathname: "/exercise/[id]", params: { id: task.exerciseId } })}
            />
          </Stack>
          <Text color="secondary">
            Alvo: {task.repsMin}-{task.repsMax} repetições
          </Text>
        </Stack>

        <Surface level="raised" bordered style={{ padding: theme.space.lg, gap: theme.space.md, alignItems: "center" }}>
          <Text variant="label" color="secondary" style={{ letterSpacing: 0.6 }}>
            REPETIÇÕES
          </Text>
          <TextField
            keyboardType="number-pad"
            value={reps}
            onChangeText={setReps}
            style={{
              fontSize: 56,
              fontWeight: "700",
              textAlign: "center",
              borderWidth: 0,
              backgroundColor: "transparent",
              color: theme.colors.accent.primary,
              paddingVertical: 0,
            }}
          />
          <Stack style={{ width: "60%" }}>
            <TextField
              label="Peso (kg, opcional)"
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={setWeight}
              style={{ textAlign: "center" }}
            />
          </Stack>
        </Surface>

        <Stack gap="sm">
          <Text variant="label" color="secondary">
            COMO FOI?
          </Text>
          <Stack direction="row" gap="sm" style={{ flexWrap: "wrap" }}>
            {FEEDBACK_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={feedback === option.value}
                onPress={() => setFeedback(option.value)}
              />
            ))}
          </Stack>
        </Stack>

        <Stack style={{ flex: 1 }} />

        <Button
          label={logSet.isPending ? "Salvando..." : "Concluir série"}
          onPress={onCompleteSet}
          disabled={logSet.isPending || reps.length === 0}
        />
      </Stack>
      <GamificationCelebration
        result={setBanner?.result}
        isNewPersonalRecord={setBanner?.isNewPersonalRecord}
        onDismiss={() => setSetBanner(null)}
      />
    </Screen>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap="xxs" style={{ minWidth: "40%" }}>
      <Text variant="title">{value}</Text>
      <Text variant="label" color="secondary" style={{ letterSpacing: 0.6 }}>
        {label}
      </Text>
    </Stack>
  );
}
