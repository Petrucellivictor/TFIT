import React from "react";
import { View, type ViewProps } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { RadiusToken } from "../tokens/spacing";

export interface SurfaceProps extends ViewProps {
  level?: "base" | "raised" | "sunken";
  radius?: RadiusToken;
}

export function Surface({ level = "raised", radius = "soft", style, ...rest }: SurfaceProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.background[level],
          borderRadius: theme.radius[radius],
        },
        style,
      ]}
      {...rest}
    />
  );
}
