import { Stack } from "expo-router";

export default function PersonalStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" options={{ headerShown: true, title: "Meu perfil profissional" }} />
      <Stack.Screen name="[userId]" options={{ headerShown: true, title: "Profissional" }} />
    </Stack>
  );
}
