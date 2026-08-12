import React from "react";
import { Pressable } from "react-native";
import { Stack, Text, useTheme } from "@tfit/ui";

export function ScaleSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
}) {
  const theme = useTheme();

  return (
    <Stack gap="xs">
      <Text variant="label" color="secondary">
        {label.toUpperCase()}
      </Text>
      <Stack direction="row" gap="sm">
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              accessibilityRole="button"
              accessibilityLabel={`${label}, nível ${n} de 5`}
              accessibilityState={{ selected }}
              style={{
                flex: 1,
                aspectRatio: 1,
                borderRadius: theme.radius.soft,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: selected ? theme.colors.accent.primary : theme.colors.border.subtle,
                backgroundColor: selected ? theme.colors.accent.primaryMuted : theme.colors.background.raised,
              }}
            >
              <Text variant="bodyStrong" color={selected ? "primary" : "secondary"}>
                {n}
              </Text>
            </Pressable>
          );
        })}
      </Stack>
    </Stack>
  );
}
