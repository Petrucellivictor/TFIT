import React from "react";
import { View, type ViewProps } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { RadiusToken } from "../tokens/spacing";

export interface SurfaceProps extends ViewProps {
  level?: "base" | "raised" | "sunken";
  radius?: RadiusToken;
  /** Hairline border in the subtle border token — gives a card a defined edge against dark surfaces. */
  bordered?: boolean;
  /** Accent-tinted shadow for hero/highlight cards — use sparingly, not on every card. */
  glow?: boolean;
}

export function Surface({ level = "raised", radius = "soft", bordered = false, glow = false, style, ...rest }: SurfaceProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.background[level],
          borderRadius: theme.radius[radius],
        },
        bordered ? { borderWidth: 1, borderColor: theme.colors.border.subtle } : null,
        glow
          ? {
              shadowColor: theme.colors.accent.primary,
              shadowOpacity: theme.scheme === "dark" ? 0.35 : 0.22,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 10,
            }
          : null,
        style,
      ]}
      {...rest}
    />
  );
}
