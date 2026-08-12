import { useEffect } from "react";
import { Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from "react-native-reanimated";
import { Stack, Surface, Text, useTheme } from "@tfit/ui";
import type { GamificationEventResult } from "@tfit/types";

const AUTO_DISMISS_MS = 3200;

function CelebrationBadge({ icon, name, index }: { icon: string; name: string; index: number }) {
  const theme = useTheme();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = theme.reducedMotion ? 1 : withDelay(index * 150, withSpring(1, { damping: 9 }));
  }, [scale, index, theme.reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ alignItems: "center", gap: theme.space.xxs }, animatedStyle]}>
      <Surface
        radius="pill"
        style={{
          width: 64,
          height: 64,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.accent.primaryMuted,
        }}
      >
        <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={30} color={theme.colors.accent.primary} />
      </Surface>
      <Text variant="caption" style={{ textAlign: "center", maxWidth: 90 }}>
        {name}
      </Text>
    </Animated.View>
  );
}

export function GamificationCelebration({
  result,
  onDismiss,
}: {
  result: GamificationEventResult | null | undefined;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const hasCelebration = Boolean(result && (result.xpAwarded > 0 || result.newAchievements.length > 0));

  useEffect(() => {
    if (!hasCelebration) return;
    const id = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-arm when a new celebration appears
  }, [hasCelebration]);

  if (!result || !hasCelebration) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable
        style={{ flex: 1, backgroundColor: theme.colors.overlay, alignItems: "center", justifyContent: "center", padding: 32 }}
        onPress={onDismiss}
      >
        <Surface level="raised" style={{ padding: theme.space.xl, gap: theme.space.md, alignItems: "center", width: "100%" }}>
          {result.xpAwarded > 0 ? (
            <Text variant="title" style={{ color: theme.colors.accent.primary }}>
              +{result.xpAwarded} XP
            </Text>
          ) : null}
          {result.newAchievements.length > 0 ? (
            <Stack gap="sm" align="center">
              <Text variant="label" color="secondary">
                NOVA CONQUISTA
              </Text>
              <Stack direction="row" gap="md">
                {result.newAchievements.map((achievement, index) => (
                  <CelebrationBadge key={achievement.id} icon={achievement.icon} name={achievement.name} index={index} />
                ))}
              </Stack>
            </Stack>
          ) : null}
          <Text variant="caption" color="secondary">
            Toque para continuar
          </Text>
        </Surface>
      </Pressable>
    </Modal>
  );
}
