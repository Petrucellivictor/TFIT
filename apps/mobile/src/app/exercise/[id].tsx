import { useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ErrorState, IconButton, Skeleton, Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { Exercise3DViewer } from "@/components/Exercise3DViewer";
import { useExerciseDetail } from "@/hooks/useExerciseDetail";

const MUSCLE_LABEL: Record<string, string> = {
  chest: "Peito",
  back: "Costas",
  shoulders: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  quadriceps: "Quadríceps",
  hamstrings: "Posterior de coxa",
  glutes: "Glúteos",
  calves: "Panturrilha",
  abs: "Abdômen",
  forearms: "Antebraços",
  full_body: "Corpo inteiro",
  cardio: "Cardio",
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Fácil",
  intermediate: "Média",
  advanced: "Difícil",
};

/** Re-presents the existing free-text instructions as numbered steps — a formatting change, not new content. */
function splitIntoSteps(text: string): string[] {
  return text
    .split(/(?<=\.)\s+/)
    .map((step) => step.trim())
    .filter(Boolean);
}

function StatChip({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const theme = useTheme();
  return (
    <Stack align="center" gap="xxs" style={{ flex: 1 }}>
      <Surface
        radius="pill"
        style={{
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.accent.primaryMuted,
        }}
      >
        <Ionicons name={icon} size={18} color={theme.colors.accent.primary} />
      </Surface>
      <Text variant="caption" color="secondary" style={{ textAlign: "center" }}>
        {label}
      </Text>
      <Text variant="caption" style={{ textAlign: "center", fontWeight: "700" }} numberOfLines={1}>
        {value}
      </Text>
    </Stack>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={{ flex: 1, alignItems: "center", paddingBottom: theme.space.sm }}
    >
      <Text variant="bodyStrong" style={{ color: active ? theme.colors.accent.primary : theme.colors.text.secondary }}>
        {label}
      </Text>
      <Stack
        style={{
          marginTop: theme.space.xxs,
          height: 2,
          width: "100%",
          backgroundColor: active ? theme.colors.accent.primary : "transparent",
        }}
      />
    </Pressable>
  );
}

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading, isError } = useExerciseDetail(id);
  const [activeTab, setActiveTab] = useState<"3d" | "instructions">("3d");

  if (isLoading) {
    return (
      <Screen>
        <Stack gap="lg" style={{ padding: 24 }}>
          <Skeleton width="60%" height={24} />
          <Skeleton width="40%" height={14} />
          <Skeleton height={100} />
          <Skeleton height={140} />
        </Stack>
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen>
        <Stack style={{ flex: 1 }} justify="center">
          <ErrorState message="Não conseguimos carregar esse exercício agora." />
        </Stack>
      </Screen>
    );
  }

  const { exercise } = data;
  const hasAnimation = Boolean(exercise.animation);
  const steps = splitIntoSteps(exercise.instructions);
  const showInstructions = !hasAnimation || activeTab === "instructions";

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 24, gap: theme.space.lg }}>
        <Stack direction="row" align="center" gap="sm">
          <IconButton
            icon={<Ionicons name="chevron-back" size={22} color={theme.colors.text.primary} />}
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
          />
          <Text variant="title" style={{ flex: 1 }} numberOfLines={1}>
            {exercise.name}
          </Text>
        </Stack>

        {hasAnimation ? (
          <Stack gap="sm">
            <Stack direction="row" style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border.subtle }}>
              <TabButton label="Animação 3D" active={activeTab === "3d"} onPress={() => setActiveTab("3d")} />
              <TabButton label="Instruções" active={activeTab === "instructions"} onPress={() => setActiveTab("instructions")} />
            </Stack>
            {activeTab === "3d" ? (
              <Stack gap="xxs">
                <Exercise3DViewer animationUrl={exercise.animation!.url} exerciseName={exercise.name} />
                <Stack direction="row" gap="xxs" align="center" justify="center">
                  <Ionicons name="sync-outline" size={12} color={theme.colors.text.secondary} />
                  <Text variant="caption" color="secondary">
                    Arraste para girar · Belisque para zoom
                  </Text>
                </Stack>
              </Stack>
            ) : null}
          </Stack>
        ) : null}

        <Stack direction="row" gap="sm">
          <StatChip
            icon="body-outline"
            label="Músculo"
            value={MUSCLE_LABEL[exercise.primaryMuscle] ?? exercise.primaryMuscle}
          />
          <StatChip icon="speedometer-outline" label="Dificuldade" value={LEVEL_LABEL[exercise.level] ?? exercise.level} />
          <StatChip icon="barbell-outline" label="Equipamento" value={exercise.equipment} />
        </Stack>

        {showInstructions ? (
          <>
            <Surface level="raised" style={{ padding: theme.space.md }}>
              <Text color="secondary">{exercise.description}</Text>
            </Surface>

            <Stack gap="sm">
              <Text variant="label" color="secondary">
                COMO EXECUTAR
              </Text>
              {steps.map((step, index) => (
                <Stack key={index} direction="row" gap="sm" align="flex-start">
                  <Surface
                    radius="pill"
                    style={{
                      width: 24,
                      height: 24,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme.colors.accent.primaryMuted,
                      marginTop: 2,
                    }}
                  >
                    <Text variant="caption" style={{ color: theme.colors.accent.primary, fontWeight: "700" }}>
                      {index + 1}
                    </Text>
                  </Surface>
                  <Text style={{ flex: 1 }}>{step}</Text>
                </Stack>
              ))}
            </Stack>

            {exercise.commonMistakes ? (
              <Stack gap="xs">
                <Text variant="label" color="secondary">
                  ERROS COMUNS
                </Text>
                <Text>{exercise.commonMistakes}</Text>
              </Stack>
            ) : null}

            {exercise.secondaryMuscles.length > 0 ? (
              <Stack gap="xs">
                <Text variant="label" color="secondary">
                  MÚSCULOS SECUNDÁRIOS
                </Text>
                <Text color="secondary">
                  {exercise.secondaryMuscles.map((muscle) => MUSCLE_LABEL[muscle] ?? muscle).join(", ")}
                </Text>
              </Stack>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
