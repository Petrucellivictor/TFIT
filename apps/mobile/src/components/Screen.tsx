import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Surface, useTheme } from "@tfit/ui";
import type { ViewProps } from "react-native";

export function Screen({ style, ...rest }: ViewProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.base }}>
      <Surface level="base" style={[{ flex: 1 }, style]} {...rest} />
    </SafeAreaView>
  );
}
