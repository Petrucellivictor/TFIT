import { FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, EmptyState, ErrorState, Stack, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { UserRow } from "@/components/UserRow";
import { UserRowSkeleton } from "@/components/UserRowSkeleton";
import { useBlockedUsers, useUnblockUser } from "@/hooks/useSocial";

export default function BlockedUsersScreen() {
  const theme = useTheme();
  const blockedUsers = useBlockedUsers();
  const unblockUser = useUnblockUser();

  if (blockedUsers.isLoading) {
    return (
      <Screen>
        <Stack gap="xs" style={{ padding: 24 }}>
          <UserRowSkeleton />
          <UserRowSkeleton />
        </Stack>
      </Screen>
    );
  }

  if (blockedUsers.isError) {
    return (
      <Screen>
        <Stack style={{ flex: 1 }} justify="center">
          <ErrorState message="Não conseguimos carregar essa lista agora." />
        </Stack>
      </Screen>
    );
  }

  return (
    <Screen>
      <Stack gap="md" style={{ flex: 1, padding: 24 }}>
        <Text variant="title">Usuários bloqueados</Text>
        <FlatList
          data={blockedUsers.data?.users ?? []}
          keyExtractor={(item) => item.userId}
          ItemSeparatorComponent={() => <Stack style={{ height: theme.space.xxs }} />}
          ListEmptyComponent={
            <EmptyState
              icon={<Ionicons name="shield-checkmark-outline" size={32} color={theme.colors.text.secondary} />}
              title="Você não bloqueou ninguém"
            />
          }
          renderItem={({ item }) => (
            <UserRow
              user={item}
              trailing={
                <Button
                  label="Desbloquear"
                  variant="secondary"
                  onPress={() => unblockUser.mutate(item.userId)}
                  disabled={unblockUser.isPending}
                />
              }
            />
          )}
        />
      </Stack>
    </Screen>
  );
}
