import { Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Button, ErrorState, Skeleton, Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { useMe } from "@/hooks/useMe";

function ProfileLinkRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Surface level="raised" style={{ padding: theme.space.md }}>
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="row" gap="sm" align="center">
            <Ionicons name={icon} size={20} color={theme.colors.accent.primary} />
            <Text variant="bodyStrong">{label}</Text>
          </Stack>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.text.secondary} />
        </Stack>
      </Surface>
    </Pressable>
  );
}

export default function PerfilScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { signOut } = useClerk();
  const me = useMe();

  return (
    <Screen>
      <Stack gap="lg" style={{ flex: 1, padding: 24 }}>
        {me.isLoading ? (
          <Stack direction="row" gap="md" align="center">
            <Skeleton width={64} height={64} radius="pill" />
            <Stack gap="xxs" style={{ flex: 1 }}>
              <Skeleton width="50%" height={18} />
              <Skeleton width="35%" height={14} />
            </Stack>
          </Stack>
        ) : me.isError ? (
          <ErrorState message="Não conseguimos carregar seu perfil agora." />
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

        <Stack gap="sm">
          <ProfileLinkRow icon="trending-up-outline" label="Ver evolução" onPress={() => router.push("/evolution")} />
          <ProfileLinkRow icon="trophy-outline" label="Conquistas" onPress={() => router.push("/achievements")} />
          <ProfileLinkRow icon="flag-outline" label="Desafios" onPress={() => router.push("/challenges")} />
          <ProfileLinkRow icon="notifications-outline" label="Notificações" onPress={() => router.push("/notifications")} />
          <ProfileLinkRow
            icon="person-add-outline"
            label="Solicitações de seguidor"
            onPress={() => router.push("/follow-requests")}
          />
          <ProfileLinkRow
            icon="person-remove-outline"
            label="Usuários bloqueados"
            onPress={() => router.push("/blocked-users")}
          />
          {me.data?.profile.handle ? (
            <ProfileLinkRow
              icon="grid-outline"
              label="Ver meu perfil público"
              onPress={() =>
                router.push({ pathname: "/profile/[handle]", params: { handle: me.data!.profile.handle } })
              }
            />
          ) : null}
        </Stack>

        <Stack style={{ flex: 1 }} />

        <Button label="Sair da conta" variant="secondary" onPress={() => signOut()} />
      </Stack>
    </Screen>
  );
}
