import { useState } from "react";
import { ScrollView } from "react-native";
import Animated, { SlideInRight } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { Button, Stack, Text, TextField, useTheme } from "@tfit/ui";
import type {
  EquipmentPreference,
  ExperienceLevel,
  FitnessGoal,
  HealthDeclaration,
} from "@tfit/types";
import { ONBOARDING_STEPS } from "@tfit/types";
import { onboardingPayloadSchema } from "@tfit/validation";
import { Screen } from "@/components/Screen";
import { Chip } from "@/components/Chip";
import { StepProgress } from "@/components/StepProgress";
import { useSubmitOnboarding } from "@/hooks/useMe";

const GOAL_OPTIONS: { value: FitnessGoal; label: string }[] = [
  { value: "lose_weight", label: "Emagrecer" },
  { value: "gain_muscle", label: "Ganhar massa muscular" },
  { value: "gain_strength", label: "Ganhar força" },
  { value: "improve_conditioning", label: "Melhorar condicionamento" },
  { value: "health_and_wellbeing", label: "Saúde e qualidade de vida" },
  { value: "other", label: "Outro" },
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "never_trained", label: "Nunca treinei" },
  { value: "under_6_months", label: "Menos de 6 meses" },
  { value: "six_months_to_a_year", label: "6 meses a 1 ano" },
  { value: "one_to_two_years", label: "1 a 2 anos" },
  { value: "over_two_years", label: "Mais de 2 anos" },
  { value: "currently_training", label: "Treino atualmente" },
];

const EQUIPMENT_OPTIONS: { value: EquipmentPreference; label: string }[] = [
  { value: "machines", label: "Máquinas" },
  { value: "free_weights", label: "Pesos livres" },
  { value: "balanced", label: "Equilibrado" },
  { value: "unsure", label: "Não sei" },
];

const HEALTH_QUESTIONS: { key: keyof Omit<HealthDeclaration, "otherLimitations">; label: string }[] = [
  { key: "hasHeartConditions", label: "Problemas cardíacos" },
  { key: "hasHighBloodPressure", label: "Pressão alta" },
  { key: "hasDiabetes", label: "Diabetes" },
  { key: "hasJointProblems", label: "Problemas articulares" },
  { key: "hasSpineProblems", label: "Problemas na coluna" },
  { key: "hasRecentInjuriesOrSurgeries", label: "Lesões ou cirurgias recentes" },
  { key: "hasRespiratoryProblems", label: "Problemas respiratórios" },
  { key: "hasPainDuringExercise", label: "Dor durante exercícios" },
];

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6, 7];
const MINUTES_OPTIONS = [15, 30, 45, 60, 90];

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const submitOnboarding = useSubmitOnboarding();

  const [step, setStep] = useState(0);
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [age, setAge] = useState("");
  const [goal, setGoal] = useState<FitnessGoal | null>(null);
  const [health, setHealth] = useState<HealthDeclaration>({
    hasHeartConditions: false,
    hasHighBloodPressure: false,
    hasDiabetes: false,
    hasJointProblems: false,
    hasSpineProblems: false,
    hasRecentInjuriesOrSurgeries: false,
    hasRespiratoryProblems: false,
    hasPainDuringExercise: false,
    otherLimitations: "",
  });
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null);
  const [minutesPerSession, setMinutesPerSession] = useState<number | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [equipmentPreference, setEquipmentPreference] = useState<EquipmentPreference | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stepKey = ONBOARDING_STEPS[step]?.key;
  const isLastStep = step === ONBOARDING_STEPS.length - 1;

  const canProceed = (() => {
    switch (stepKey) {
      case "physical":
        return weightKg.length > 0 && heightCm.length > 0 && age.length > 0;
      case "goal":
        return goal !== null;
      case "health":
        return true;
      case "frequency":
        return daysPerWeek !== null;
      case "time":
        return minutesPerSession !== null;
      case "experience":
        return experienceLevel !== null;
      case "preference":
        return equipmentPreference !== null;
      default:
        return false;
    }
  })();

  const goNext = async () => {
    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }

    setSubmitError(null);
    const parsed = onboardingPayloadSchema.safeParse({
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      age: Number(age),
      goals: goal ? [goal] : [],
      health,
      daysPerWeek,
      minutesPerSession,
      experienceLevel,
      equipmentPreference,
    });

    if (!parsed.success) {
      setSubmitError("Revise os dados informados antes de continuar.");
      return;
    }

    try {
      await submitOnboarding.mutateAsync(parsed.data);
      router.replace({
        pathname: "/onboarding/generating",
        params: {
          goalLabel: GOAL_OPTIONS.find((o) => o.value === goal)?.label ?? "",
          daysPerWeek: String(daysPerWeek),
        },
      });
    } catch {
      setSubmitError("Não conseguimos salvar suas respostas agora. Tente novamente.");
    }
  };

  return (
    <Screen>
      <Stack gap="lg" style={{ flex: 1, padding: 24 }}>
        <Stack gap="sm">
          <StepProgress total={ONBOARDING_STEPS.length} current={step} />
          <Text color="secondary" variant="caption">
            Passo {step + 1} de {ONBOARDING_STEPS.length}
          </Text>
        </Stack>

        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <Animated.View
            key={step}
            entering={theme.reducedMotion ? undefined : SlideInRight.duration(220)}
            style={{ gap: theme.space.lg }}
          >
            <Text variant="title">{ONBOARDING_STEPS[step]?.titlePtBr}</Text>

            {stepKey === "physical" && (
              <Stack gap="md">
                <TextField label="Peso (kg)" keyboardType="decimal-pad" value={weightKg} onChangeText={setWeightKg} />
                <TextField label="Altura (cm)" keyboardType="decimal-pad" value={heightCm} onChangeText={setHeightCm} />
                <TextField label="Idade" keyboardType="number-pad" value={age} onChangeText={setAge} />
              </Stack>
            )}

            {stepKey === "goal" && (
              <Stack direction="row" gap="sm" style={{ flexWrap: "wrap" }}>
                {GOAL_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={goal === option.value}
                    onPress={() => setGoal(option.value)}
                  />
                ))}
              </Stack>
            )}

            {stepKey === "health" && (
              <Stack gap="md">
                <Text color="secondary">
                  Essas perguntas ajudam a tornar seu treino mais seguro — não substituem uma avaliação médica.
                </Text>
                <Stack direction="row" gap="sm" style={{ flexWrap: "wrap" }}>
                  {HEALTH_QUESTIONS.map((q) => (
                    <Chip
                      key={q.key}
                      label={q.label}
                      selected={health[q.key]}
                      onPress={() => setHealth((h) => ({ ...h, [q.key]: !h[q.key] }))}
                    />
                  ))}
                </Stack>
                <TextField
                  label="Outra limitação (opcional)"
                  value={health.otherLimitations}
                  onChangeText={(text) => setHealth((h) => ({ ...h, otherLimitations: text }))}
                />
              </Stack>
            )}

            {stepKey === "frequency" && (
              <Stack direction="row" gap="sm" style={{ flexWrap: "wrap" }}>
                {DAYS_OPTIONS.map((d) => (
                  <Chip
                    key={d}
                    label={`${d}x por semana`}
                    selected={daysPerWeek === d}
                    onPress={() => setDaysPerWeek(d)}
                  />
                ))}
              </Stack>
            )}

            {stepKey === "time" && (
              <Stack direction="row" gap="sm" style={{ flexWrap: "wrap" }}>
                {MINUTES_OPTIONS.map((m) => (
                  <Chip
                    key={m}
                    label={`${m} min`}
                    selected={minutesPerSession === m}
                    onPress={() => setMinutesPerSession(m)}
                  />
                ))}
              </Stack>
            )}

            {stepKey === "experience" && (
              <Stack direction="row" gap="sm" style={{ flexWrap: "wrap" }}>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={experienceLevel === option.value}
                    onPress={() => setExperienceLevel(option.value)}
                  />
                ))}
              </Stack>
            )}

            {stepKey === "preference" && (
              <Stack direction="row" gap="sm" style={{ flexWrap: "wrap" }}>
                {EQUIPMENT_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={equipmentPreference === option.value}
                    onPress={() => setEquipmentPreference(option.value)}
                  />
                ))}
              </Stack>
            )}
          </Animated.View>
        </ScrollView>

        {submitError ? <Text style={{ color: "#C0362C" }}>{submitError}</Text> : null}

        <Stack direction="row" gap="sm">
          {step > 0 && <Button label="Voltar" variant="secondary" onPress={() => setStep((s) => s - 1)} />}
          <Stack style={{ flex: 1 }}>
            <Button
              label={isLastStep ? (submitOnboarding.isPending ? "Salvando..." : "Concluir") : "Continuar"}
              onPress={goNext}
              disabled={!canProceed || submitOnboarding.isPending}
            />
          </Stack>
        </Stack>
      </Stack>
    </Screen>
  );
}
