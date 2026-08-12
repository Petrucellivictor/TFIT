import { Stack, Text } from "@tfit/ui";
import type { PostComment } from "@tfit/types";
import { Avatar } from "./Avatar";
import { formatRelativeTime } from "@/lib/time";

export function CommentRow({ comment }: { comment: PostComment }) {
  return (
    <Stack direction="row" gap="sm" align="flex-start">
      <Avatar uri={comment.author.avatarUrl} name={comment.author.displayName} size={32} />
      <Stack gap="xxs" style={{ flex: 1 }}>
        <Text variant="caption" color="secondary">
          @{comment.author.handle} · {formatRelativeTime(comment.createdAt)}
        </Text>
        <Text>{comment.body}</Text>
      </Stack>
    </Stack>
  );
}
