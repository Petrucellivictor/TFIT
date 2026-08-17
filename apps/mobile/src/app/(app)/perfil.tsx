import { Alert, Image, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Button, ErrorState, Skeleton, Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { RadialGauge } from "@/components/RadialGauge";
import { useMe } from "@/hooks/useMe";
import { useGamificationProfile } from "@/hooks/useGamification";

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

function ProfileGamificationSummary() {
  const theme = useTheme();
  const router = useRouter();
  const gamification = useGamificationProfile();

  if (!gamification.data) return null;
  const { name, level, xpIntoLevel, xpForNextLevel, isMaxLevel, streak } = gamification.data;
  const progressPercent = isMaxLevel || !xpForNextLevel ? 100 : Math.round((xpIntoLevel / xpForNextLevel) * 100);

  return (
    <Pressable
      onPress={() => router.push("/achievements")}
      accessibilityRole="button"
      accessibilityLabel="Ver conquistas e progresso"
    >
      <Surface level="raised" bordered glow style={{ padding: theme.space.md }}>
        <Stack direction="row" align="center" gap="md">
          <RadialGauge value={progressPercent} size={64} strokeWidth={6} valueLabel={`${level}`} />
          <Stack gap="xxs" style={{ flex: 1 }}>
            <Text variant="label" color="secondary" style={{ letterSpacing: 0.6 }}>
              NÍVEL {level}
            </Text>
            <Text variant="bodyStrong">{name}</Text>
            <Text variant="caption" color="secondary">
              {isMaxLevel ? "Nível máximo alcançado" : `${xpIntoLevel} / ${xpForNextLevel} XP`}
            </Text>
          </Stack>
          {streak.current > 0 ? (
            <Stack align="center" gap="xxs">
              <Surface level="sunken" radius="pill" style={{ paddingVertical: theme.space.xxs, paddingHorizontal: theme.space.sm }}>
                <Stack direction="row" gap="xxs" align="center">
                  <Text>🔥</Text>
                  <Text variant="bodyStrong">{streak.current}</Text>
                </Stack>
              </Surface>
            </Stack>
          ) : null}
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
          <LinearGradient
            colors={theme.colors.gradient.hero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: theme.space.lg, borderRadius: theme.radius.soft }}
          >
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
                <Text variant="headline" style={{ color: theme.colors.gradient.heroText }}>
                  {me.data?.profile.displayName}
                </Text>
                <Text style={{ color: theme.colors.gradient.heroTextMuted }}>@{me.data?.profile.handle}</Text>
              </Stack>
            </Stack>
          </LinearGradient>
        )}

        <ProfileGamificationSummary />

        <Stack gap="sm">
          <ProfileLinkRow icon="trending-up-outline" label="Ver evolução" onPress={() => router.push("/evolution")} />
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

        <Button
          label="Sair da conta"
          variant="secondary"
          onPress={() =>
            Alert.alert("Sair da conta?", "Você poderá entrar novamente quando quiser.", [
              { text: "Cancelar", style: "cancel" },
              { text: "Sair", style: "destructive", onPress: () => signOut() },
            ])
          }
        />
      </Stack>
    </Screen>
  );
}
