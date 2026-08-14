import { useState } from "react";
import { FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { EmptyState, ErrorState, Stack, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { Chip } from "@/components/Chip";
import { UserRow } from "@/components/UserRow";
import { UserRowSkeleton } from "@/components/UserRowSkeleton";
import { useFollowers, useFollowing } from "@/hooks/useSocial";

export default function ConnectionsScreen() {
  const { handle, tab } = useLocalSearchParams<{ handle: string; tab?: string }>();
  const theme = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"followers" | "following">(tab === "following" ? "following" : "followers");

  const followers = useFollowers(handle);
  const following = useFollowing(handle);

  const query = activeTab === "followers" ? followers : following;
  const users = query.data?.users ?? [];

  return (
    <Screen>
      <Stack gap="md" style={{ flex: 1, padding: 24 }}>
        <Stack direction="row" gap="sm">
          <Chip label="Seguidores" selected={activeTab === "followers"} onPress={() => setActiveTab("followers")} />
          <Chip label="Seguindo" selected={activeTab === "following"} onPress={() => setActiveTab("following")} />
        </Stack>

        {query.isLoading ? (
          <Stack gap="xs">
            <UserRowSkeleton />
            <UserRowSkeleton />
            <UserRowSkeleton />
          </Stack>
        ) : query.isError ? (
          <Stack style={{ flex: 1 }} justify="center">
            <ErrorState message="Não conseguimos carregar essa lista agora." />
          </Stack>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.userId}
            ItemSeparatorComponent={() => <Stack style={{ height: theme.space.xxs }} />}
            ListEmptyComponent={
              <EmptyState
                icon={<Ionicons name="people-outline" size={32} color={theme.colors.text.secondary} />}
                title="Ninguém por aqui ainda"
              />
            }
            renderItem={({ item }) => (
              <UserRow user={item} onPress={() => router.push({ pathname: "/profile/[handle]", params: { handle: item.handle } })} />
            )}
          />
        )}
      </Stack>
    </Screen>
  );
}
