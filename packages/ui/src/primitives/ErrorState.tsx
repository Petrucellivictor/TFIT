import { Stack } from "./Stack";
import { Text } from "./Text";

export interface ErrorStateProps {
  message?: string;
  hint?: string;
}

export function ErrorState({
  message = "Não conseguimos carregar seus dados agora.",
  hint = "Puxe para atualizar.",
}: ErrorStateProps) {
  return (
    <Stack align="center" justify="center" gap="xxs" style={{ padding: 32 }}>
      <Text color="secondary" style={{ textAlign: "center" }}>
        {message}
      </Text>
      <Text variant="caption" color="secondary" style={{ textAlign: "center" }}>
        {hint}
      </Text>
    </Stack>
  );
}
