import { ActivityIndicator, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Stack, Surface, Text, useTheme } from "@tfit/ui";
import type { ChallengeView } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { ScoreBar } from "@/components/ScoreBar";
import { useChallenges, useJoinChallenge } from "@/hooks/useGamification";

const PERIOD_LABELS: Record<string, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  fixed: "Por tempo limitado",
};

function ChallengeCard({ challenge }: { challenge: ChallengeView }) {
  const theme = useTheme();
  const joinChallenge = useJoinChallenge();

  const progress = challenge.participation?.progressValue ?? 0;
  const percent = Math.min(100, Math.round((progress / challenge.targetValue) * 100));
  const completed = challenge.participation?.status === "completed";

  return (
    <Surface level="raised" style={{ padding: theme.space.md, gap: theme.space.sm }}>
      <Stack direction="row" justify="space-between" align="center">
        <Text variant="bodyStrong">{challenge.title}</Text>
        {completed ? <Ionicons name="checkmark-circle" size={22} color={theme.colors.accent.primary} /> : null}
      </Stack>
      <Text color="secondary" variant="caption">
        {challenge.description}
      </Text>
      <Text variant="label" color="secondary">
        {PERIOD_LABELS[challenge.period] ?? challenge.period}
      </Text>

      {challenge.participation ? (
        <ScoreBar label={`${progress} / ${challenge.targetValue}`} value={percent} />
      ) : (
        <Button label="Participar" variant="secondary" onPress={() => joinChallenge.mutate(challenge.id)} disabled={joinChallenge.isPending} />
      )}
    </Surface>
  );
}

export default function ChallengesScreen() {
  const theme = useTheme();
  const { data, isLoading } = useChallenges();

  return (
    <Screen>
      {isLoading ? (
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
        </Stack>
      ) : (
        <FlatList
          data={data?.challenges ?? []}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 24, gap: theme.space.md }}
          ItemSeparatorComponent={() => <Stack style={{ height: theme.space.sm }} />}
          ListHeaderComponent={
            <Text variant="title" style={{ marginBottom: theme.space.md }}>
              Desafios
            </Text>
          }
          ListEmptyComponent={
            <Text color="secondary" style={{ textAlign: "center" }}>
              Nenhum desafio disponível no momento.
            </Text>
          }
          renderItem={({ item }) => <ChallengeCard challenge={item} />}
        />
      )}
    </Screen>
  );
}
