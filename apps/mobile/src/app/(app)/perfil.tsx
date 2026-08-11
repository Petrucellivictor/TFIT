import { ActivityIndicator, Image } from "react-native";
import { useClerk } from "@clerk/expo";
import { Button, Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { useMe } from "@/hooks/useMe";

export default function PerfilScreen() {
  const theme = useTheme();
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

        <Stack style={{ flex: 1 }} />

        <Button label="Sair da conta" variant="secondary" onPress={() => signOut()} />
      </Stack>
    </Screen>
  );
}
