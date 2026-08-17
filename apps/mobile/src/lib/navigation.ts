import type { Theme } from "@tfit/ui";

/**
 * Shared native-stack header styling. Without this, any screen with
 * headerShown enabled falls back to React Navigation's unstyled light-mode
 * default (white bar, black text), which clashes with the TFIT Gold theme.
 */
export function themedStackScreenOptions(theme: Theme) {
  return {
    headerStyle: { backgroundColor: theme.colors.background.raised },
    headerTintColor: theme.colors.accent.primary,
    headerTitleStyle: { color: theme.colors.text.primary, fontWeight: "700" as const },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: theme.colors.background.base },
  };
}
