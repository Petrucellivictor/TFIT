import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Text, useTheme } from "@tfit/ui";
import { Screen } from "./Screen";

export function ComingSoon({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  const theme = useTheme();

  return (
    <Screen>
      <Stack align="center" justify="center" gap="md" style={{ flex: 1, padding: 32 }}>
        <Ionicons name={icon} size={40} color={theme.colors.text.disabled} />
        <Text variant="headline" style={{ textAlign: "center" }}>
          {title}
        </Text>
        <Text color="secondary" style={{ textAlign: "center" }}>
          {description}
        </Text>
      </Stack>
    </Screen>
  );
}
