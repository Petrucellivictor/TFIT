import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Stack, Surface, Text, TextField, useTheme } from "@tfit/ui";
import type { GamificationEventResult, SetFeedback, WorkoutDetail } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { Chip } from "@/components/Chip";
import { RestTimer } from "@/components/RestTimer";
import { useCompleteSession, useLogSet } from "@/hooks/useWorkoutSession";

interface SetTask {
  exerciseIndex: number;
  setNumber: number;
  totalSets: number;
  workoutExerciseId: string;
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
      exerciseName: item.exercise.name,
      repsMin: item.repsMin,
      repsMax: item.repsMax,
      restSeconds: item.restSeconds,
    })),
  );
}

function GamificationResultCard({ result }: { result: GamificationEventResult }) {
  const theme = useTheme();
  if (result.xpAwarded === 0 && result.newAchievements.length === 0) return null;

  return (
    <Surface level="raised" style={{ padding: theme.space.md, gap: theme.space.xs, backgroundColor: theme.colors.accent.primaryMuted }}>
      {result.xpAwarded > 0 ? <Text variant="bodyStrong">+{result.xpAwarded} XP</Text> : null}
      {result.newAchievements.map((achievement) => (
        <Text key={achievement.id} color="secondary">
          🏆 Nova conquista: {achievement.name}
        </Text>
      ))}
    </Surface>
  );
}

export default function WorkoutSessionScreen() {
  const { sessionId, workout: workoutParam } = useLocalSearchParams<{ sessionId: string; workout: string }>();
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
  const [setBanner, setSetBanner] = useState<GamificationEventResult | null>(null);
  const [completionResult, setCompletionResult] = useState<GamificationEventResult | null>(null);

  const task = tasks[taskIndex];
  const isLastTask = taskIndex === tasks.length - 1;

  if (phase === "completed") {
    return (
      <Screen>
        <Stack align="center" justify="center" gap="lg" style={{ flex: 1, padding: 32 }}>
          <Ionicons name="checkmark-circle" size={56} color={theme.colors.accent.primary} />
          <Text variant="title" style={{ textAlign: "center" }}>
            Treino concluído!
          </Text>
          <Text color="secondary" style={{ textAlign: "center" }}>
            Você completou {tasks.length} séries em {workout.name}.
          </Text>
          {completionResult ? <GamificationResultCard result={completionResult} /> : null}
          <Button label="Voltar" onPress={() => router.replace("/(app)/treinos")} />
        </Stack>
      </Screen>
    );
  }

  if (phase === "summary" || !task) {
    return (
      <Screen>
        <Stack align="center" justify="center" gap="lg" style={{ flex: 1, padding: 32 }}>
          <Ionicons name="checkmark-circle" size={56} color={theme.colors.accent.primary} />
          <Text variant="title" style={{ textAlign: "center" }}>
            Treino concluído!
          </Text>
          <Text color="secondary" style={{ textAlign: "center" }}>
            Você completou {tasks.length} séries em {workout.name}.
          </Text>
          <Button
            label={completeSession.isPending ? "Salvando..." : "Concluir"}
            onPress={() =>
              completeSession.mutate(undefined, {
                onSuccess: (res) => {
                  setCompletionResult(res.gamification);
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
          if (res.isNewPersonalRecord || res.gamification.xpAwarded > 0 || res.gamification.newAchievements.length > 0) {
            setSetBanner(res.gamification);
            setTimeout(() => setSetBanner(null), 3000);
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
          <Text variant="title">{task.exerciseName}</Text>
          <Text color="secondary">
            Alvo: {task.repsMin}-{task.repsMax} repetições
          </Text>
        </Stack>

        {setBanner ? (
          <Surface level="raised" style={{ padding: theme.space.sm, backgroundColor: theme.colors.accent.primaryMuted }}>
            <Text variant="bodyStrong" style={{ textAlign: "center" }}>
              🏆 Novo recorde pessoal!{setBanner.xpAwarded > 0 ? ` +${setBanner.xpAwarded} XP` : ""}
            </Text>
            {setBanner.newAchievements.map((achievement) => (
              <Text key={achievement.id} color="secondary" style={{ textAlign: "center" }}>
                Conquista desbloqueada: {achievement.name}
              </Text>
            ))}
          </Surface>
        ) : null}

        <Stack direction="row" gap="md">
          <Stack style={{ flex: 1 }}>
            <TextField label="Repetições" keyboardType="number-pad" value={reps} onChangeText={setReps} />
          </Stack>
          <Stack style={{ flex: 1 }}>
            <TextField label="Peso (kg, opcional)" keyboardType="decimal-pad" value={weight} onChangeText={setWeight} />
          </Stack>
        </Stack>

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
    </Screen>
  );
}
