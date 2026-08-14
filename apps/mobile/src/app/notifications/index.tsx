import { FlatList, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { NotificationView } from "@tfit/types";
import { EmptyState, ErrorState, Stack, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { NotificationRow } from "@/components/NotificationRow";
import { UserRowSkeleton } from "@/components/UserRowSkeleton";
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
        <Stack gap="xs" style={{ padding: 24 }}>
          <UserRowSkeleton />
          <UserRowSkeleton />
          <UserRowSkeleton />
        </Stack>
      </Screen>
    );
  }

  if (notifications.isError) {
    return (
      <Screen>
        <Stack style={{ flex: 1 }} justify="center">
          <ErrorState message="Não conseguimos carregar suas notificações agora." />
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
            <EmptyState
              icon={<Ionicons name="notifications-outline" size={32} color={theme.colors.text.secondary} />}
              title="Nenhuma notificação por enquanto"
            />
          }
          renderItem={({ item }) => <NotificationRow notification={item} onPress={() => openNotification(item)} />}
        />
      </Stack>
    </Screen>
  );
}
