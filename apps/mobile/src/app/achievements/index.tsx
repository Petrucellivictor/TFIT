import { ActivityIndicator, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Surface, Text, useTheme } from "@tfit/ui";
import type { AchievementView } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { useAchievements } from "@/hooks/useGamification";

function AchievementCard({ achievement }: { achievement: AchievementView }) {
  const theme = useTheme();
  const unlocked = achievement.unlockedAt !== null;

  return (
    <Surface
      level="raised"
      style={{
        flex: 1,
        padding: theme.space.md,
        gap: theme.space.xs,
        alignItems: "center",
        opacity: unlocked ? 1 : 0.45,
      }}
    >
      <Ionicons
        name={achievement.icon as keyof typeof Ionicons.glyphMap}
        size={32}
        color={unlocked ? theme.colors.accent.primary : theme.colors.text.disabled}
      />
      <Text variant="bodyStrong" style={{ textAlign: "center" }}>
        {achievement.name}
      </Text>
      <Text variant="caption" color="secondary" style={{ textAlign: "center" }}>
        {achievement.description}
      </Text>
    </Surface>
  );
}

export default function AchievementsScreen() {
  const theme = useTheme();
  const { data, isLoading } = useAchievements();

  return (
    <Screen>
      {isLoading ? (
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
        </Stack>
      ) : (
        <FlatList
          data={data?.achievements ?? []}
          keyExtractor={(a) => a.id}
          numColumns={2}
          contentContainerStyle={{ padding: 24, gap: theme.space.md }}
          columnWrapperStyle={{ gap: theme.space.md }}
          ListHeaderComponent={
            <Stack gap="xs" style={{ marginBottom: theme.space.md }}>
              <Text variant="title">Conquistas</Text>
              <Text color="secondary">
                {data?.achievements.filter((a) => a.unlockedAt).length ?? 0} de {data?.achievements.length ?? 0}{" "}
                desbloqueadas
              </Text>
            </Stack>
          }
          renderItem={({ item }) => <AchievementCard achievement={item} />}
        />
      )}
    </Screen>
  );
}
