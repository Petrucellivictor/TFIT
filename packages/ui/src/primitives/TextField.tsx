import React from "react";
import { TextInput, View, type TextInputProps } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View>
      {label ? (
        <Text variant="label" color="secondary" style={{ marginBottom: theme.space.xxs }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={theme.colors.text.disabled}
        style={[
          {
            borderWidth: 1,
            borderColor: error ? theme.colors.feedback.danger : theme.colors.border.subtle,
            borderRadius: theme.radius.soft,
            paddingVertical: theme.space.sm,
            paddingHorizontal: theme.space.md,
            fontSize: theme.typography.body.fontSize,
            color: theme.colors.text.primary,
            backgroundColor: theme.colors.background.raised,
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text variant="caption" style={{ color: theme.colors.feedback.danger, marginTop: theme.space.xxs }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
