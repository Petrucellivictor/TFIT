import { useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Stack, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { Chip } from "@/components/Chip";
import { UserRow } from "@/components/UserRow";
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
          <Stack align="center" justify="center" style={{ flex: 1 }}>
            <ActivityIndicator />
          </Stack>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.userId}
            ItemSeparatorComponent={() => <Stack style={{ height: theme.space.xxs }} />}
            ListEmptyComponent={
              <Text color="secondary" style={{ textAlign: "center", marginTop: 32 }}>
                Ninguém por aqui ainda.
              </Text>
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
