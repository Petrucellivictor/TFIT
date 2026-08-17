import { Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { IconButton, useTheme } from "@tfit/ui";
import { themedStackScreenOptions } from "@/lib/navigation";

export default function WorkoutSessionLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        ...themedStackScreenOptions(theme),
        headerShown: true,
        headerTitle: "",
        headerLeft: () => (
          <IconButton
            icon={<Ionicons name="chevron-back" size={22} color={theme.colors.accent.primary} />}
            accessibilityLabel="Sair do treino"
            onPress={() => {
              Alert.alert(
                "Sair do treino?",
                "As séries já registradas continuam salvas, mas a sessão só é marcada como concluída ao final.",
                [
                  { text: "Continuar treino", style: "cancel" },
                  { text: "Sair", style: "destructive", onPress: () => router.back() },
                ],
              );
            }}
          />
        ),
      }}
    >
      <Stack.Screen name="[sessionId]" />
    </Stack>
  );
}
