import { View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import { Text } from "./Text";

export interface BadgeProps {
  /** Numeric badge (e.g. unread count). Omit and use `dot` for a presence-only indicator. */
  count?: number;
  dot?: boolean;
  tone?: "accent" | "danger";
}

export function Badge({ count, dot = false, tone = "danger" }: BadgeProps) {
  const theme = useTheme();
  const backgroundColor = tone === "danger" ? theme.colors.feedback.danger : theme.colors.accent.primary;

  if (dot) {
    return <View style={{ width: 8, height: 8, borderRadius: theme.radius.pill, backgroundColor }} />;
  }

  if (!count || count <= 0) return null;

  return (
    <View
      style={{
        minWidth: 18,
        height: 18,
        borderRadius: theme.radius.pill,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
      }}
    >
      <Text variant="caption" color="inverse" style={{ fontSize: 10, lineHeight: 12 }}>
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
}
