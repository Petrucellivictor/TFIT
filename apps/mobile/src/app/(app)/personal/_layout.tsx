import { Stack } from "expo-router";
import { useTheme } from "@tfit/ui";
import { themedStackScreenOptions } from "@/lib/navigation";

export default function PersonalStackLayout() {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ ...themedStackScreenOptions(theme), headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" options={{ headerShown: true, title: "Meu perfil profissional" }} />
      <Stack.Screen name="menu" options={{ headerShown: true, title: "Meu cardápio" }} />
      <Stack.Screen name="[userId]" options={{ headerShown: true, title: "Profissional" }} />
    </Stack>
  );
}
