import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { lightColors, darkColors, type ColorTokens } from "../tokens/colors";
import { typography } from "../tokens/typography";
import { space, radius } from "../tokens/spacing";
import { motion } from "../tokens/motion";

export type ThemePreference = "light" | "dark" | "system";

export interface Theme {
  scheme: "light" | "dark";
  colors: ColorTokens;
  typography: typeof typography;
  space: typeof space;
  radius: typeof radius;
  motion: typeof motion;
  reducedMotion: boolean;
}

const ThemeContext = createContext<Theme | null>(null);

function buildTheme(scheme: "light" | "dark", reducedMotion: boolean): Theme {
  return {
    scheme,
    colors: scheme === "dark" ? darkColors : lightColors,
    typography,
    space,
    radius,
    motion,
    reducedMotion,
  };
}

export interface ThemeProviderProps {
  /** User's explicit override from user_preferences; "system" follows the OS. */
  preference?: ThemePreference;
  reducedMotion?: boolean;
  children: React.ReactNode;
}

export function ThemeProvider({ preference = "system", reducedMotion = false, children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const scheme = preference === "system" ? (systemScheme ?? "light") : preference;
  const theme = useMemo(() => buildTheme(scheme, reducedMotion), [scheme, reducedMotion]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return theme;
}
