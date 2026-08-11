import React from "react";
import { View } from "react-native";
import { useTheme } from "@tfit/ui";

export function StepProgress({ total, current }: { total: number; current: number }) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: "row", gap: theme.space.xxs }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: theme.radius.pill,
            backgroundColor: i <= current ? theme.colors.accent.primary : theme.colors.border.subtle,
          }}
        />
      ))}
    </View>
  );
}
