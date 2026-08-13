import type { ReactNode } from "react";
import { Stack } from "./Stack";
import { Text } from "./Text";
import { Button } from "./Button";

export interface EmptyStateProps {
  /** Caller-provided icon/illustration — kept decoupled from any specific icon library. */
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Stack align="center" justify="center" gap="sm" style={{ padding: 32 }}>
      {icon}
      <Text variant="bodyStrong" style={{ textAlign: "center" }}>
        {title}
      </Text>
      {description ? (
        <Text color="secondary" style={{ textAlign: "center" }}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} variant="secondary" onPress={onAction} /> : null}
    </Stack>
  );
}
