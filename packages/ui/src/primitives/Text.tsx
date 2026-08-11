import React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { TypographyToken } from "../tokens/typography";

export interface TextProps extends RNTextProps {
  variant?: TypographyToken;
  color?: "primary" | "secondary" | "inverse" | "disabled";
}

export function Text({ variant = "body", color = "primary", style, ...rest }: TextProps) {
  const theme = useTheme();
  const typeStyle = theme.typography[variant];

  return (
    <RNText
      style={[
        {
          fontSize: typeStyle.fontSize,
          lineHeight: typeStyle.lineHeight,
          fontWeight: typeStyle.fontWeight,
          letterSpacing: typeStyle.letterSpacing,
          color: theme.colors.text[color],
        },
        style,
      ]}
      {...rest}
    />
  );
}
