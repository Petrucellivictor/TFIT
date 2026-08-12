import { ActivityIndicator, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Button, Stack, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { UserRow } from "@/components/UserRow";
import { useAcceptFollowRequest, useFollowRequests, useRejectFollowRequest } from "@/hooks/useSocial";

export default function FollowRequestsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const requests = useFollowRequests();
  const accept = useAcceptFollowRequest();
  const reject = useRejectFollowRequest();

  if (requests.isLoading) {
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
        <Text variant="title">Solicitações de seguidor</Text>
        <FlatList
          data={requests.data?.requests ?? []}
          keyExtractor={(item) => item.userId}
          ItemSeparatorComponent={() => <Stack style={{ height: theme.space.xxs }} />}
          ListEmptyComponent={
            <Text color="secondary" style={{ textAlign: "center", marginTop: 32 }}>
              Nenhuma solicitação pendente.
            </Text>
          }
          renderItem={({ item }) => (
            <UserRow
              user={item}
              onPress={() => router.push({ pathname: "/profile/[handle]", params: { handle: item.handle } })}
              trailing={
                <Stack direction="row" gap="xs">
                  <Button label="Aceitar" onPress={() => accept.mutate(item.userId)} disabled={accept.isPending} />
                  <Button
                    label="Recusar"
                    variant="secondary"
                    onPress={() => reject.mutate(item.userId)}
                    disabled={reject.isPending}
                  />
                </Stack>
              }
            />
          )}
        />
      </Stack>
    </Screen>
  );
}
