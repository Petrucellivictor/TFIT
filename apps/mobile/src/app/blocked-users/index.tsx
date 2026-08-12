import { ActivityIndicator, FlatList } from "react-native";
import { Button, Stack, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { UserRow } from "@/components/UserRow";
import { useBlockedUsers, useUnblockUser } from "@/hooks/useSocial";

export default function BlockedUsersScreen() {
  const theme = useTheme();
  const blockedUsers = useBlockedUsers();
  const unblockUser = useUnblockUser();

  if (blockedUsers.isLoading) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
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
            <Text color="secondary" style={{ textAlign: "center", marginTop: 32 }}>
              Você não bloqueou ninguém.
            </Text>
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
