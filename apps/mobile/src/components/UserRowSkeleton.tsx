import { Skeleton, Stack, useTheme } from "@tfit/ui";

export function UserRowSkeleton() {
  const theme = useTheme();
  return (
    <Stack direction="row" gap="sm" align="center" style={{ paddingVertical: theme.space.sm }}>
      <Skeleton width={44} height={44} radius="pill" />
      <Stack gap="xxs" style={{ flex: 1 }}>
        <Skeleton width="45%" height={14} />
        <Skeleton width="30%" height={11} />
      </Stack>
    </Stack>
  );
}
