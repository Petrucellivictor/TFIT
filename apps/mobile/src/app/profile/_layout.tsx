import { Stack } from "expo-router";
import { useTheme } from "@tfit/ui";
import { themedStackScreenOptions } from "@/lib/navigation";

export default function ProfileLayout() {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ ...themedStackScreenOptions(theme), headerShown: true, headerTitle: "" }}>
      <Stack.Screen name="[handle]" />
      <Stack.Screen name="[handle]/connections" options={{ headerTitle: "Conexões" }} />
    </Stack>
  );
}
