import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { Stack, Surface, Text, useTheme } from "@tfit/ui";
import type { AchievementView } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { useAchievements } from "@/hooks/useGamification";

function AchievementBadgeIcon({ achievement, size }: { achievement: AchievementView; size: number }) {
  const theme = useTheme();
  const unlocked = achievement.unlockedAt !== null;

  return (
    <Surface
      radius="pill"
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: unlocked ? theme.colors.accent.primaryMuted : "transparent",
        borderWidth: unlocked ? 0 : 2,
        borderColor: theme.colors.border.subtle,
      }}
    >
      <Ionicons
        name={achievement.icon as keyof typeof Ionicons.glyphMap}
        size={Math.round(size * 0.46)}
        color={unlocked ? theme.colors.accent.primary : theme.colors.text.disabled}
      />
    </Surface>
  );
}

function AchievementCard({ achievement, index, onPress }: { achievement: AchievementView; index: number; onPress: () => void }) {
  const theme = useTheme();
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (theme.reducedMotion) {
      scale.value = 1;
      opacity.value = 1;
      return;
    }
    scale.value = withDelay(index * 40, withSpring(1, { damping: 12 }));
    opacity.value = withDelay(index * 40, withTiming(1, { duration: 250 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entrance animation runs once per mount (per current reducedMotion setting)
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <Pressable onPress={onPress}>
        <Surface level="raised" style={{ padding: theme.space.md, gap: theme.space.sm, alignItems: "center" }}>
          <AchievementBadgeIcon achievement={achievement} size={56} />
          <Text variant="bodyStrong" style={{ textAlign: "center" }} numberOfLines={2}>
            {achievement.name}
          </Text>
          <Text variant="caption" color="secondary" style={{ textAlign: "center" }} numberOfLines={2}>
            {achievement.description}
          </Text>
        </Surface>
      </Pressable>
    </Animated.View>
  );
}

function AchievementDetailModal({ achievement, onClose }: { achievement: AchievementView | null; onClose: () => void }) {
  const theme = useTheme();
  if (!achievement) return null;
  const unlocked = achievement.unlockedAt !== null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: theme.colors.overlay, alignItems: "center", justifyContent: "center", padding: 32 }}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Fechar"
      >
        <Surface level="raised" style={{ padding: theme.space.xl, gap: theme.space.md, alignItems: "center", width: "100%" }}>
          <AchievementBadgeIcon achievement={achievement} size={88} />
          <Text variant="headline" style={{ textAlign: "center" }}>
            {achievement.name}
          </Text>
          <Text color="secondary" style={{ textAlign: "center" }}>
            {achievement.description}
          </Text>
          <Text variant="caption" color="secondary">
            {unlocked
              ? `Desbloqueada em ${new Date(achievement.unlockedAt!).toLocaleDateString("pt-BR")}`
              : "Ainda não desbloqueada"}
          </Text>
        </Surface>
      </Pressable>
    </Modal>
  );
}

export default function AchievementsScreen() {
  const theme = useTheme();
  const { data, isLoading } = useAchievements();
  const [selected, setSelected] = useState<AchievementView | null>(null);

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
          renderItem={({ item, index }) => <AchievementCard achievement={item} index={index} onPress={() => setSelected(item)} />}
        />
      )}
      <AchievementDetailModal achievement={selected} onClose={() => setSelected(null)} />
    </Screen>
  );
}
