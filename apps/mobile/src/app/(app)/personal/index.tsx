import { useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Surface, Text, TextField, useTheme } from "@tfit/ui";
import type { ProfessionalListing } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { useProfessionalDirectory } from "@/hooks/useProfessionals";

function ProfessionalCard({ professional, onPress }: { professional: ProfessionalListing; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Surface level="raised" style={{ padding: theme.space.md, gap: theme.space.xxs }}>
        <Stack direction="row" gap="sm" align="center">
          {professional.avatarUrl ? (
            <Image source={{ uri: professional.avatarUrl }} style={{ width: 44, height: 44, borderRadius: theme.radius.pill }} />
          ) : (
            <Surface level="sunken" style={{ width: 44, height: 44, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center" }}>
              <Text variant="bodyStrong">{professional.displayName.charAt(0)}</Text>
            </Surface>
          )}
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
  const { data, isLoading } = useProfessionalDirectory(search);

  return (
    <Screen>
      <Stack gap="md" style={{ flex: 1, padding: 24 }}>
        <Text variant="title">Encontre um personal</Text>
        <Text color="secondary" variant="caption">
          Diretório de contato — a TFIT não verifica credenciais dos profissionais listados.
        </Text>

        <TextField placeholder="Buscar por nome ou especialidade" value={search} onChangeText={setSearch} />

        <Pressable onPress={() => router.push("/(app)/personal/register")}>
          <Surface level="sunken" style={{ padding: theme.space.md }}>
            <Stack direction="row" gap="sm" align="center" justify="space-between">
              <Text variant="bodyStrong">É profissional? Cadastre-se aqui</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.text.secondary} />
            </Stack>
          </Surface>
        </Pressable>

        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={data?.professionals ?? []}
            keyExtractor={(p) => p.userId}
            contentContainerStyle={{ gap: theme.space.sm }}
            ListEmptyComponent={
              <Text color="secondary" style={{ textAlign: "center", marginTop: theme.space.lg }}>
                Nenhum profissional encontrado.
              </Text>
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
