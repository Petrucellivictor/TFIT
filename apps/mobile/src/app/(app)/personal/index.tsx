import { useState } from "react";
import { FlatList, Pressable, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState, ErrorState, Stack, Surface, Text, TextField, useTheme } from "@tfit/ui";
import type { ProfessionalListing } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { Avatar } from "@/components/Avatar";
import { ProfessionalCardSkeleton } from "@/components/ProfessionalCardSkeleton";
import { useProfessionalDirectory } from "@/hooks/useProfessionals";

function ProfessionalCard({ professional, onPress }: { professional: ProfessionalListing; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Abrir perfil de ${professional.displayName}`}>
      <Surface level="raised" style={{ padding: theme.space.md }}>
        <Stack direction="row" gap="sm" align="center">
          <Avatar uri={professional.avatarUrl} name={professional.displayName} size={44} />
          <Stack style={{ flex: 1 }}>
            <Text variant="bodyStrong">{professional.displayName}</Text>
            <Text color="secondary" variant="caption">
              {professional.specialty}
              {professional.city ? ` · ${professional.city}` : ""}
            </Text>
          </Stack>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.text.secondary} />
        </Stack>
      </Surface>
    </Pressable>
  );
}

export default function PersonalDirectoryScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const directory = useProfessionalDirectory(search);

  return (
    <Screen>
      <Stack gap="md" style={{ flex: 1, padding: 24 }}>
        <Text variant="title">Encontre um personal</Text>
        <Text color="secondary" variant="caption">
          Diretório de contato — a TFIT não verifica credenciais dos profissionais listados.
        </Text>

        <TextField placeholder="Buscar por nome ou especialidade" value={search} onChangeText={setSearch} />

        <Pressable
          onPress={() => router.push("/(app)/personal/register")}
          accessibilityRole="button"
          accessibilityLabel="É profissional? Cadastre-se aqui"
        >
          <Surface level="raised" bordered style={{ padding: theme.space.md }}>
            <Stack direction="row" gap="sm" align="center" justify="space-between">
              <Stack direction="row" gap="sm" align="center" style={{ flex: 1 }}>
                <Surface
                  radius="pill"
                  style={{
                    width: 36,
                    height: 36,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: theme.colors.accent.primaryMuted,
                  }}
                >
                  <Ionicons name="person-add-outline" size={18} color={theme.colors.accent.primary} />
                </Surface>
                <Text variant="bodyStrong">É profissional? Cadastre-se aqui</Text>
              </Stack>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.text.secondary} />
            </Stack>
          </Surface>
        </Pressable>

        {directory.isLoading ? (
          <Stack gap="sm">
            <ProfessionalCardSkeleton />
            <ProfessionalCardSkeleton />
            <ProfessionalCardSkeleton />
          </Stack>
        ) : directory.isError ? (
          <Stack style={{ flex: 1 }} justify="center">
            <ErrorState message="Não conseguimos carregar o diretório agora." />
          </Stack>
        ) : (
          <FlatList
            data={directory.data?.professionals ?? []}
            keyExtractor={(p) => p.userId}
            contentContainerStyle={{ gap: theme.space.sm }}
            refreshControl={<RefreshControl refreshing={directory.isRefetching} onRefresh={() => directory.refetch()} />}
            ListEmptyComponent={
              <EmptyState
                icon={<Ionicons name="school-outline" size={32} color={theme.colors.text.secondary} />}
                title="Nenhum profissional encontrado"
              />
            }
            renderItem={({ item }) => (
              <ProfessionalCard professional={item} onPress={() => router.push(`/(app)/personal/${item.userId}`)} />
            )}
          />
        )}
      </Stack>
    </Screen>
  );
}
