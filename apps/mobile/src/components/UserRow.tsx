import type { ReactNode } from "react";
import { Pressable } from "react-native";
import { Stack, Text, useTheme } from "@tfit/ui";
import type { PostAuthor } from "@tfit/types";
import { Avatar } from "./Avatar";

export function UserRow({ user, onPress, trailing }: { user: PostAuthor; onPress?: () => void; trailing?: ReactNode }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? `Abrir perfil de ${user.displayName}` : undefined}
    >
      <Stack direction="row" align="center" justify="space-between" style={{ paddingVertical: theme.space.sm }}>
        <Stack direction="row" gap="sm" align="center" style={{ flex: 1 }}>
          <Avatar uri={user.avatarUrl} name={user.displayName} size={44} />
          <Stack gap="xxs">
            <Text variant="bodyStrong">{user.displayName}</Text>
            <Text variant="caption" color="secondary">
              @{user.handle}
            </Text>
          </Stack>
        </Stack>
        {trailing}
      </Stack>
    </Pressable>
  );
}
