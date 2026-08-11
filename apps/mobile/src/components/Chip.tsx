import React from "react";
import { Pressable } from "react-native";
import { Text, useTheme } from "@tfit/ui";

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        borderWidth: 1,
        borderColor: selected ? theme.colors.accent.primary : theme.colors.border.subtle,
        backgroundColor: selected ? theme.colors.accent.primaryMuted : theme.colors.background.raised,
        borderRadius: theme.radius.pill,
        paddingVertical: theme.space.xs,
        paddingHorizontal: theme.space.md,
      }}
    >
      <Text variant="bodyStrong" color={selected ? "primary" : "secondary"}>
        {label}
      </Text>
    </Pressable>
  );
}
