import React from "react";
import { View } from "react-native";
import { useTheme } from "@tfit/ui";

export function Sparkline({ values, height = 48 }: { values: number[]; height?: number }) {
  const theme = useTheme();
  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height, gap: 3 }}>
      {values.map((value, index) => {
        const ratio = (value - min) / range;
        const barHeight = Math.max(4, ratio * height);
        return (
          <View
            key={index}
            style={{
              flex: 1,
              height: barHeight,
              backgroundColor: theme.colors.accent.primary,
              borderRadius: theme.radius.sharp,
              opacity: 0.5 + ratio * 0.5,
            }}
          />
        );
      })}
    </View>
  );
}
