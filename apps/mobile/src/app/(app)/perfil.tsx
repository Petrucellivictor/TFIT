import { ActivityIndicator, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Button, Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { useMe } from "@/hooks/useMe";

export default function PerfilScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut } = useClerk();
  const me = useMe();

  return (
    <Screen>
      <Stack gap="lg" style={{ flex: 1, padding: 24 }}>
        {me.isLoading ? (
          <ActivityIndicator />
        ) : (
          <Stack direction="row" gap="md" align="center">
            {me.data?.profile.avatarUrl ? (
              <Image
                source={{ uri: me.data.profile.avatarUrl }}
                style={{ width: 64, height: 64, borderRadius: theme.radius.pill }}
              />
            ) : (
              <Surface
                level="sunken"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: theme.radius.pill,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text variant="title">{me.data?.profile.displayName.charAt(0) ?? "?"}</Text>
              </Surface>
            )}
            <Stack>
              <Text variant="headline">{me.data?.profile.displayName}</Text>
              <Text color="secondary">@{me.data?.profile.handle}</Text>
            </Stack>
          </Stack>
        )}

        <Pressable onPress={() => router.push("/evolution")}>
          <Surface level="raised" style={{ padding: theme.space.md }}>
            <Stack direction="row" justify="space-between" align="center">
              <Stack direction="row" gap="sm" align="center">
                <Ionicons name="trending-up-outline" size={20} color={theme.colors.accent.primary} />
                <Text variant="bodyStrong">Ver evolução</Text>
              </Stack>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.text.secondary} />
            </Stack>
          </Surface>
        </Pressable>

        <Stack style={{ flex: 1 }} />

        <Button label="Sair da conta" variant="secondary" onPress={() => signOut()} />
      </Stack>
    </Screen>
  );
}
