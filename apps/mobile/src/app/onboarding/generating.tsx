import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Stack, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { AIGenerationSequence } from "@/components/AIGenerationSequence";
import { useGenerateWorkout } from "@/hooks/useWorkoutPlan";
import { ApiRequestError } from "@/lib/api";

type Phase = "reveal" | "generating" | "ready" | "error";

function buildRevealLines(goalLabel: string, daysPerWeek: string): string[] {
  const lines = ["Entendi seu perfil."];
  if (goalLabel) lines.push(`Seu objetivo é ${goalLabel.toLowerCase()}.`);
  if (daysPerWeek) lines.push(`Você treina ${daysPerWeek}x por semana.`);
  lines.push("Vamos montar seu plano.");
  return lines;
}

const LINE_INTERVAL_MS = 1100;

export default function OnboardingGeneratingScreen() {
  const { goalLabel, daysPerWeek } = useLocalSearchParams<{ goalLabel?: string; daysPerWeek?: string }>();
  const theme = useTheme();
  const router = useRouter();
  const generate = useGenerateWorkout();

  const lines = buildRevealLines(goalLabel ?? "", daysPerWeek ?? "");
  const [visibleLines, setVisibleLines] = useState(1);
  const [phase, setPhase] = useState<Phase>("reveal");

  useEffect(() => {
    if (phase !== "reveal") return;
    const timer = setTimeout(() => {
      if (visibleLines >= lines.length) {
        setPhase("generating");
      } else {
        setVisibleLines((n) => n + 1);
      }
    }, LINE_INTERVAL_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `lines` is derived from stable route params, recomputing it isn't a dependency change worth re-running for
  }, [phase, visibleLines]);

  useEffect(() => {
    if (phase !== "generating") return;
    generate.mutate(undefined, {
      onSuccess: () => setPhase("ready"),
      onError: () => setPhase("error"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run exactly once on entering the generating phase
  }, [phase]);

  const goHome = () => router.replace("/(app)");

  return (
    <Screen>
      <Stack align="center" justify="center" gap="xl" style={{ flex: 1, padding: 32 }}>
        {phase === "reveal" ? (
          <Stack gap="md" align="center">
            {lines.slice(0, visibleLines).map((line, i) => (
              <Text key={i} variant={i === lines.length - 1 ? "headline" : "body"} color={i === lines.length - 1 ? "primary" : "secondary"} style={{ textAlign: "center" }}>
                {line}
              </Text>
            ))}
          </Stack>
        ) : null}

        {phase === "generating" ? <AIGenerationSequence /> : null}

        {phase === "ready" ? (
          <Stack align="center" gap="md">
            <Ionicons name="checkmark-circle" size={56} color={theme.colors.accent.primary} />
            <Text variant="title" style={{ textAlign: "center" }}>
              Seu treino está pronto
            </Text>
            <Text color="secondary" style={{ textAlign: "center" }}>
              Seu plano personalizado já está te esperando.
            </Text>
            <Button label="Começar" onPress={goHome} />
          </Stack>
        ) : null}

        {phase === "error" ? (
          <Stack align="center" gap="md">
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.text.secondary} />
            <Text variant="headline" style={{ textAlign: "center" }}>
              Não conseguimos montar seu plano agora
            </Text>
            <Text color="secondary" style={{ textAlign: "center" }}>
              {generate.error instanceof ApiRequestError
                ? generate.error.message
                : "Seus dados estão salvos — você pode tentar de novo quando quiser."}
            </Text>
            <Button label="Tentar novamente" onPress={() => setPhase("generating")} />
            <Button label="Pular por agora" variant="secondary" onPress={goHome} />
          </Stack>
        ) : null}
      </Stack>
    </Screen>
  );
}
