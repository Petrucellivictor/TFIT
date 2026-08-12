import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Surface, Text, useTheme } from "@tfit/ui";
import type { NotificationView } from "@tfit/types";
import { Avatar } from "./Avatar";
import { formatRelativeTime } from "@/lib/time";

const NOTIFICATION_COPY: Record<NotificationView["type"], (actorName: string) => string> = {
  new_follower: (name) => `${name} começou a seguir você`,
  follow_request: (name) => `${name} quer seguir você`,
  comment: (name) => `${name} comentou no seu post`,
  like: (name) => `${name} curtiu seu post`,
  achievement_unlocked: () => "Você desbloqueou uma conquista",
};

export function NotificationRow({ notification, onPress }: { notification: NotificationView; onPress?: () => void }) {
  const theme = useTheme();
  const actorName = notification.actor?.displayName ?? "Alguém";
  const message =
    notification.type === "achievement_unlocked" && notification.message
      ? `Você desbloqueou "${notification.message}"`
      : NOTIFICATION_COPY[notification.type](actorName);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={notification.isRead ? message : `${message}, não lida`}
    >
      <Surface level={notification.isRead ? "base" : "raised"} style={{ padding: theme.space.md }}>
        <Stack direction="row" gap="sm" align="center">
          {notification.actor ? (
            <Avatar uri={notification.actor.avatarUrl} name={notification.actor.displayName} size={40} />
          ) : (
            <Ionicons name="trophy-outline" size={32} color={theme.colors.accent.primary} />
          )}
          <Stack gap="xxs" style={{ flex: 1 }}>
            <Text variant="body">{message}</Text>
            <Text variant="caption" color="secondary">
              {formatRelativeTime(notification.createdAt)}
            </Text>
          </Stack>
          {!notification.isRead ? (
            <View
              style={{ width: 8, height: 8, borderRadius: theme.radius.pill, backgroundColor: theme.colors.accent.primary }}
            />
          ) : null}
        </Stack>
      </Surface>
    </Pressable>
  );
}
