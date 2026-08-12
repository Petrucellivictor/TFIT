import { Stack } from "expo-router";

export default function TreinosStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[workoutId]" options={{ headerShown: true }} />
      <Stack.Screen name="plans" options={{ headerShown: true, title: "Meus planos" }} />
      <Stack.Screen name="builder" options={{ headerShown: true, title: "Criar treino" }} />
      <Stack.Screen name="plan/[planId]" options={{ headerShown: true, title: "Plano" }} />
    </Stack>
  );
}
