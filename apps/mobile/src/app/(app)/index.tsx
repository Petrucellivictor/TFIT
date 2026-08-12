import { ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { ScoreBar } from "@/components/ScoreBar";
import { useMe } from "@/hooks/useMe";
import { useWorkoutPlan } from "@/hooks/useWorkoutPlan";
import { useGamificationProfile } from "@/hooks/useGamification";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

/** Our workouts use 1=Monday..7=Sunday; JS Date#getDay() uses 0=Sunday..6=Saturday. */
function isoDayOfWeek(date: Date): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

function GamificationSummary() {
  const theme = useTheme();
  const router = useRouter();
  const gamification = useGamificationProfile();

  if (!gamification.data) return null;
  const { name, level, xpIntoLevel, xpForNextLevel, isMaxLevel, streak } = gamification.data;
  const progressPercent = isMaxLevel || !xpForNextLevel ? 100 : Math.round((xpIntoLevel / xpForNextLevel) * 100);

  return (
    <Pressable onPress={() => router.push("/achievements")}>
      <Surface level="raised" style={{ padding: theme.space.md, gap: theme.space.sm }}>
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="row" gap="xs" align="center">
            <Text variant="bodyStrong">
              Nível {level} — {name}
            </Text>
          </Stack>
          {streak.current > 0 ? (
            <Stack direction="row" gap="xxs" align="center">
              <Text>🔥</Text>
              <Text variant="bodyStrong">{streak.current}</Text>
            </Stack>
          ) : null}
        </Stack>
        {!isMaxLevel ? <ScoreBar label={`${xpIntoLevel} / ${xpForNextLevel} XP`} value={progressPercent} /> : null}
      </Surface>
    </Pressable>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const me = useMe();
  const plan = useWorkoutPlan();
  const router = useRouter();

  const todayWorkout = plan.data?.plan?.workouts.find((w) => w.dayOfWeek === isoDayOfWeek(new Date()));

  return (
    <Screen>
      <Stack gap="lg" style={{ flex: 1, padding: 24 }}>
        {me.isLoading ? (
          <ActivityIndicator />
        ) : me.isError ? (
          <Text color="secondary">Não conseguimos carregar seus dados agora. Puxe para atualizar.</Text>
        ) : (
          <Text variant="title">
            {greeting()}, {me.data?.profile.displayName.split(" ")[0]}
          </Text>
        )}

        <GamificationSummary />

        {!plan.data?.plan ? (
          <Surface level="raised" style={{ padding: theme.space.lg, gap: theme.space.sm, alignItems: "center" }}>
            <Ionicons name="barbell-outline" size={28} color={theme.colors.text.secondary} />
            <Text variant="bodyStrong" style={{ textAlign: "center" }}>
              Seu treino ainda não foi gerado
            </Text>
            <Text color="secondary" style={{ textAlign: "center" }}>
              Toque em “Treinos” para gerar seu plano personalizado com IA.
            </Text>
          </Surface>
        ) : todayWorkout ? (
          <Pressable onPress={() => router.push(`/(app)/treinos/${todayWorkout.id}`)}>
            <Surface level="raised" style={{ padding: theme.space.lg, gap: theme.space.xxs }}>
              <Text variant="label" color="secondary">
                TREINO DE HOJE
              </Text>
              <Text variant="headline">{todayWorkout.name}</Text>
              <Text color="secondary">{todayWorkout.exercises.length} exercícios</Text>
            </Surface>
          </Pressable>
        ) : (
          <Surface level="raised" style={{ padding: theme.space.lg, gap: theme.space.sm, alignItems: "center" }}>
            <Ionicons name="checkmark-circle-outline" size={28} color={theme.colors.text.secondary} />
            <Text variant="bodyStrong" style={{ textAlign: "center" }}>
              Sem treino hoje
            </Text>
            <Text color="secondary" style={{ textAlign: "center" }}>
              Aproveite para descansar ou veja seus outros treinos da semana.
            </Text>
          </Surface>
        )}
      </Stack>
    </Screen>
  );
}
