import { Skeleton, Stack, Surface, useTheme } from "@tfit/ui";

export function PostCardSkeleton() {
  const theme = useTheme();
  return (
    <Surface level="raised" style={{ padding: theme.space.md, gap: theme.space.sm }}>
      <Stack direction="row" gap="sm" align="center">
        <Skeleton width={40} height={40} radius="pill" />
        <Stack gap="xxs" style={{ flex: 1 }}>
          <Skeleton width="50%" height={14} />
          <Skeleton width="30%" height={11} />
        </Stack>
      </Stack>
      <Skeleton height={220} radius="soft" />
    </Surface>
  );
}
