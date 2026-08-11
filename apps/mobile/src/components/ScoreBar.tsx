import React from "react";
import { View } from "react-native";
import { Stack, Text, useTheme } from "@tfit/ui";

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const theme = useTheme();

  return (
    <Stack gap="xxs">
      <Stack direction="row" justify="space-between">
        <Text variant="caption" color="secondary">
          {label}
        </Text>
        <Text variant="caption" color="secondary">
          {value}
        </Text>
      </Stack>
      <View
        style={{
          height: 6,
          borderRadius: theme.radius.pill,
          backgroundColor: theme.colors.background.sunken,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${value}%`,
            height: "100%",
            backgroundColor: theme.colors.accent.primary,
            borderRadius: theme.radius.pill,
          }}
        />
      </View>
    </Stack>
  );
}
