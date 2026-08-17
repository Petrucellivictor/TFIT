import { Alert, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, EmptyState, ErrorState, Stack, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { UserRow } from "@/components/UserRow";
import { UserRowSkeleton } from "@/components/UserRowSkeleton";
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
        <Stack gap="xs" style={{ padding: 24 }}>
          <UserRowSkeleton />
          <UserRowSkeleton />
        </Stack>
      </Screen>
    );
  }

  if (requests.isError) {
    return (
      <Screen>
        <Stack style={{ flex: 1 }} justify="center">
          <ErrorState message="Não conseguimos carregar as solicitações agora." />
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
            <EmptyState
              icon={<Ionicons name="person-add-outline" size={32} color={theme.colors.text.secondary} />}
              title="Nenhuma solicitação pendente"
            />
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
                    onPress={() =>
                      Alert.alert("Recusar solicitação?", `${item.displayName} não será notificado(a).`, [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Recusar", style: "destructive", onPress: () => reject.mutate(item.userId) },
                      ])
                    }
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
