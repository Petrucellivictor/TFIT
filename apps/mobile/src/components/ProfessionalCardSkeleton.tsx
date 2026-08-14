import { Skeleton, Stack, Surface, useTheme } from "@tfit/ui";

export function ProfessionalCardSkeleton() {
  const theme = useTheme();
  return (
    <Surface level="raised" style={{ padding: theme.space.md }}>
      <Stack direction="row" gap="sm" align="center">
        <Skeleton width={44} height={44} radius="pill" />
        <Stack gap="xxs" style={{ flex: 1 }}>
          <Skeleton width="55%" height={14} />
          <Skeleton width="35%" height={11} />
        </Stack>
      </Stack>
    </Surface>
  );
}
