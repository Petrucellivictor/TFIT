import { ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Surface, Text, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { useMe } from "@/hooks/useMe";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function HomeScreen() {
  const theme = useTheme();
  const me = useMe();

  return (
    <Screen>
      <Stack gap="lg" style={{ flex: 1, padding: 24 }}>
        {me.isLoading ? (
          <ActivityIndicator />
        ) : me.isError ? (
          <Text color="secondary">Não conseguimos carregar seus dados agora. Puxe para atualizar.</Text>
        ) : (
          <Text variant="title">
            {greeting()}, {me.data?.profile.displayName.split(" ")[0]}
          </Text>
        )}

        <Surface
          level="raised"
          style={{ padding: theme.space.lg, gap: theme.space.sm, alignItems: "center" }}
        >
          <Ionicons name="barbell-outline" size={28} color={theme.colors.text.secondary} />
          <Text variant="bodyStrong" style={{ textAlign: "center" }}>
            Seu primeiro treino chega na próxima fase
          </Text>
          <Text color="secondary" style={{ textAlign: "center" }}>
            Estamos com sua avaliação em mãos. A geração de treinos com IA é o próximo passo do App Fit.
          </Text>
        </Surface>
      </Stack>
    </Screen>
  );
}
