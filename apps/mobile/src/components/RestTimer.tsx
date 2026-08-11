import { useEffect, useState } from "react";
import { Button, Stack, Text, useTheme } from "@tfit/ui";

export function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const theme = useTheme();
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onDone();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: only re-run on remaining tick
  }, [remaining]);

  return (
    <Stack align="center" gap="lg" style={{ flex: 1, justifyContent: "center", padding: 32 }}>
      <Text variant="label" color="secondary">
        DESCANSO
      </Text>
      <Text style={{ fontSize: 64, fontWeight: "700", color: theme.colors.accent.primary }}>{remaining}s</Text>
      <Button label="Pular descanso" variant="secondary" onPress={onDone} />
    </Stack>
  );
}
