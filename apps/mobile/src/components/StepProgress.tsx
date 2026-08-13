import React from "react";
import { View } from "react-native";
import { useTheme } from "@tfit/ui";

export function StepProgress({ total, current }: { total: number; current: number }) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: theme.space.xs }}>
      {Array.from({ length: total }).map((_, i) => {
        const isFilled = i <= current;
        const isCurrent = i === current;
        const size = isCurrent ? 10 : 7;
        return (
          <View
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: theme.radius.pill,
              backgroundColor: isFilled ? theme.colors.accent.primary : "transparent",
              borderWidth: isFilled ? 0 : 1.5,
              borderColor: theme.colors.border.subtle,
            }}
          />
        );
      })}
    </View>
  );
}
