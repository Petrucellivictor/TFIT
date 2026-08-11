import { Stack } from "expo-router";

export default function TreinosStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[workoutId]" options={{ headerShown: true }} />
    </Stack>
  );
}
