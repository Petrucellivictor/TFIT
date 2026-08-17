import { Stack } from "expo-router";
import { useTheme } from "@tfit/ui";
import { themedStackScreenOptions } from "@/lib/navigation";

export default function CheckinLayout() {
  const theme = useTheme();

  return (
    <Stack screenOptions={{ ...themedStackScreenOptions(theme), headerShown: true, headerTitle: "" }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
