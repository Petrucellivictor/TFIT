import { ActivityIndicator, FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import type { NotificationView } from "@tfit/types";
import { Stack, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { NotificationRow } from "@/components/NotificationRow";
import { useMarkNotificationsRead, useNotifications } from "@/hooks/useSocial";

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const notifications = useNotifications();
  const markAllRead = useMarkNotificationsRead();

  const openNotification = (notification: NotificationView) => {
    if (notification.type === "comment" || notification.type === "like") {
      if (notification.referenceId) router.push({ pathname: "/post/[id]", params: { id: notification.referenceId } });
      return;
    }
    if (notification.type === "new_follower" || notification.type === "follow_request") {
      if (notification.actor) router.push({ pathname: "/profile/[handle]", params: { handle: notification.actor.handle } });
      return;
    }
    if (notification.type === "achievement_unlocked") {
      router.push("/achievements");
    }
  };

  if (notifications.isLoading) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
        </Stack>
      </Screen>
    );
  }

  const items = notifications.data?.notifications ?? [];
  const hasUnread = items.some((n) => !n.isRead);

  return (
    <Screen>
      <Stack gap="md" style={{ flex: 1, padding: 24 }}>
        <Stack direction="row" justify="space-between" align="center">
          <Text variant="title">Notificações</Text>
          {hasUnread ? (
            <Pressable onPress={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
              <Text variant="label" style={{ color: theme.colors.accent.primary }}>
                Marcar tudo como lido
              </Text>
            </Pressable>
          ) : null}
        </Stack>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <Stack style={{ height: theme.space.xs }} />}
          ListEmptyComponent={
            <Text color="secondary" style={{ textAlign: "center", marginTop: 32 }}>
              Nenhuma notificação por enquanto.
            </Text>
          }
          renderItem={({ item }) => <NotificationRow notification={item} onPress={() => openNotification(item)} />}
        />
      </Stack>
    </Screen>
  );
}
