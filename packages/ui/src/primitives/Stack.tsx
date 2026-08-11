import React from "react";
import { View, type ViewProps } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { SpaceToken } from "../tokens/spacing";

export interface StackProps extends ViewProps {
  direction?: "row" | "column";
  gap?: SpaceToken;
  align?: "flex-start" | "center" | "flex-end" | "stretch";
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
}

export function Stack({
  direction = "column",
  gap = "md",
  align = "stretch",
  justify = "flex-start",
  style,
  ...rest
}: StackProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: direction,
          gap: theme.space[gap],
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
      {...rest}
    />
  );
}
