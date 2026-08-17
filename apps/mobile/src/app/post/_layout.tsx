import { Stack } from "expo-router";
import { useTheme } from "@tfit/ui";
import { themedStackScreenOptions } from "@/lib/navigation";

export default function PostLayout() {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ ...themedStackScreenOptions(theme), headerShown: true, headerTitle: "" }}>
      <Stack.Screen name="create" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
