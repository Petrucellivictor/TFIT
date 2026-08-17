import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { RadialGauge } from "@/components/RadialGauge";
import { useMe } from "@/hooks/useMe";
import { useWorkoutPlan } from "@/hooks/useWorkoutPlan";
import { useGamificationProfile } from "@/hooks/useGamification";

function repsLabel(repsMin: number, repsMax: number): string {
  return repsMin === repsMax ? `${repsMin}` : `${repsMin}-${repsMax}`;
}

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

/** Contextual line under the greeting — adapts to the user's current state rather than a static tagline. */
function contextualSubtitle(hasWorkoutToday: boolean, hasPlan: boolean, streakDays: number): string {
  if (!hasPlan) return "Vamos montar seu plano de treino?";
  if (streakDays >= 3) return "Pronto para manter sua sequência?";
  if (hasWorkoutToday) return "Seu treino de hoje está esperando.";
  return "Bora treinar?";
}

function HeroHeader({
  name,
  isLoading,
  isError,
  subtitle,
}: {
  name: string | undefined;
  isLoading: boolean;
  isError: boolean;
  subtitle: string;
}) {
  const theme = useTheme();

  return (
    <LinearGradient
      colors={theme.colors.gradient.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: theme.space.lg, borderRadius: theme.radius.soft, gap: theme.space.xxs, overflow: "hidden" }}
    >
      <Stack direction="row" gap="xs" align="center">
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.accent.primary,
          }}
        />
        <Text variant="label" style={{ color: theme.colors.accent.primary, letterSpacing: 1 }}>
          TFIT PERFORMANCE
        </Text>
      </Stack>
      {isLoading ? (
        <ActivityIndicator color={theme.colors.accent.primary} style={{ alignSelf: "flex-start", marginTop: theme.space.xs }} />
      ) : isError ? (
        <Text style={{ color: theme.colors.gradient.heroText }}>Não conseguimos carregar seus dados agora. Puxe para atualizar.</Text>
      ) : (
        <>
          <Text variant="title" style={{ color: theme.colors.gradient.heroText }}>
            {greeting()}, {name}
          </Text>
          <Text style={{ color: theme.colors.gradient.heroTextMuted }}>{subtitle}</Text>
        </>
      )}
    </LinearGradient>
  );
}

function GamificationSummary() {
  const theme = useTheme();
  const router = useRouter();
  const gamification = useGamificationProfile();

  if (!gamification.data) return null;
  const { name, level, xpIntoLevel, xpForNextLevel, isMaxLevel, streak } = gamification.data;
  const progressPercent = isMaxLevel || !xpForNextLevel ? 100 : Math.round((xpIntoLevel / xpForNextLevel) * 100);

  return (
    <Pressable
      onPress={() => router.push("/achievements")}
      accessibilityRole="button"
      accessibilityLabel="Ver conquistas e progresso"
    >
      <Surface level="raised" bordered glow style={{ padding: theme.space.md }}>
        <Stack direction="row" align="center" gap="md">
          <RadialGauge value={progressPercent} size={72} strokeWidth={7} valueLabel={`${level}`} />
          <Stack gap="xxs" style={{ flex: 1 }}>
            <Text variant="label" color="secondary" style={{ letterSpacing: 0.6 }}>
              NÍVEL {level}
            </Text>
            <Text variant="headline">{name}</Text>
            <Text variant="caption" color="secondary">
              {isMaxLevel ? "Nível máximo alcançado" : `${xpIntoLevel} / ${xpForNextLevel} XP`}
            </Text>
          </Stack>
          {streak.current > 0 ? (
            <Stack align="center" gap="xxs">
              <Surface level="sunken" radius="pill" style={{ paddingVertical: theme.space.xxs, paddingHorizontal: theme.space.sm }}>
                <Stack direction="row" gap="xxs" align="center">
                  <Text>🔥</Text>
                  <Text variant="bodyStrong">{streak.current}</Text>
                </Stack>
              </Surface>
              {streak.freezesAvailable > 0 ? (
                <Stack direction="row" gap="xxs" align="center">
                  <Ionicons name="snow-outline" size={12} color={theme.colors.text.secondary} />
                  <Text variant="caption" color="secondary">
                    {streak.freezesAvailable}
                  </Text>
                </Stack>
              ) : null}
            </Stack>
          ) : null}
        </Stack>
      </Surface>
    </Pressable>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const me = useMe();
  const plan = useWorkoutPlan();
  const gamification = useGamificationProfile();
  const router = useRouter();

  const todayWorkout = plan.data?.plan?.workouts.find((w) => w.dayOfWeek === isoDayOfWeek(new Date()));
  const subtitle = contextualSubtitle(
    Boolean(todayWorkout),
    Boolean(plan.data?.plan),
    gamification.data?.streak.current ?? 0,
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24, gap: theme.space.lg }}>
        <HeroHeader
          name={me.data?.profile.displayName.split(" ")[0]}
          isLoading={me.isLoading}
          isError={me.isError}
          subtitle={subtitle}
        />

        <GamificationSummary />

        {!plan.data?.plan ? (
          <Surface level="raised" bordered style={{ padding: theme.space.lg, gap: theme.space.sm, alignItems: "center" }}>
            <Ionicons name="barbell-outline" size={28} color={theme.colors.accent.primary} />
            <Text variant="bodyStrong" style={{ textAlign: "center" }}>
              Seu treino ainda não foi gerado
            </Text>
            <Text color="secondary" style={{ textAlign: "center" }}>
              Toque em “Treinos” para gerar seu plano personalizado com IA.
            </Text>
          </Surface>
        ) : todayWorkout ? (
          <Pressable onPress={() => router.push(`/(app)/treinos/${todayWorkout.id}`)}>
            <Surface level="raised" bordered style={{ padding: theme.space.lg, gap: theme.space.sm }}>
              <Stack direction="row" align="center" gap="md">
                <LinearGradient
                  colors={theme.colors.gradient.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: theme.radius.soft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="flash" size={24} color={theme.colors.accent.onPrimary} />
                </LinearGradient>
                <Stack gap="xxs" style={{ flex: 1 }}>
                  <Text variant="label" color="secondary" style={{ letterSpacing: 0.6 }}>
                    TREINO DE HOJE
                  </Text>
                  <Text variant="headline">{todayWorkout.name}</Text>
                  <Text color="secondary">{todayWorkout.exercises.length} exercícios</Text>
                </Stack>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
              </Stack>

              <Stack gap="xxs" style={{ marginTop: theme.space.xs }}>
                {todayWorkout.exercises.slice(0, 3).map((item, index) => (
                  <Stack key={item.id} direction="row" justify="space-between" gap="sm">
                    <Text variant="caption" color="secondary" style={{ flex: 1 }} numberOfLines={1}>
                      {index + 1}. {item.exercise.name}
                    </Text>
                    <Text variant="caption" color="secondary">
                      {item.sets}x{repsLabel(item.repsMin, item.repsMax)}
                    </Text>
                  </Stack>
                ))}
                {todayWorkout.exercises.length > 3 ? (
                  <Text variant="caption" color="secondary">
                    +{todayWorkout.exercises.length - 3} exercícios
                  </Text>
                ) : null}
              </Stack>
            </Surface>
          </Pressable>
        ) : (
          <Surface level="raised" bordered style={{ padding: theme.space.lg, gap: theme.space.sm, alignItems: "center" }}>
            <Ionicons name="checkmark-circle-outline" size={28} color={theme.colors.accent.primary} />
            <Text variant="bodyStrong" style={{ textAlign: "center" }}>
              Sem treino hoje
            </Text>
            <Text color="secondary" style={{ textAlign: "center" }}>
              Aproveite para descansar ou veja seus outros treinos da semana.
            </Text>
          </Surface>
        )}
      </ScrollView>
    </Screen>
  );
}
