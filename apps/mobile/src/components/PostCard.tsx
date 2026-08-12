import { Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Surface, Text, useTheme } from "@tfit/ui";
import type { PostSummary } from "@tfit/types";
import { Avatar } from "./Avatar";
import { formatRelativeTime } from "@/lib/time";

const POST_TYPE_LABEL: Partial<Record<PostSummary["type"], string>> = {
  workout: "Treino concluído",
  achievement: "Nova conquista",
  personal_record: "Novo recorde pessoal",
  streak: "Sequência em dia",
};

export function PostCard({
  post,
  onPressAuthor,
  onPress,
  onToggleLike,
  onOpenMenu,
}: {
  post: PostSummary;
  onPressAuthor: () => void;
  onPress: () => void;
  onToggleLike: () => void;
  onOpenMenu: () => void;
}) {
  const theme = useTheme();
  const typeLabel = POST_TYPE_LABEL[post.type];
  const heroMediaUrl = post.mediaUrls[0];

  return (
    <Surface level="raised" style={{ overflow: "hidden" }}>
      <Stack gap="sm" style={{ padding: theme.space.md }}>
        <Stack direction="row" align="center" justify="space-between">
          <Pressable onPress={onPressAuthor} style={{ flex: 1 }}>
            <Stack direction="row" gap="sm" align="center">
              <Avatar uri={post.author.avatarUrl} name={post.author.displayName} size={40} />
              <Stack gap="xxs" style={{ flex: 1 }}>
                <Text variant="bodyStrong">{post.author.displayName}</Text>
                <Text variant="caption" color="secondary">
                  @{post.author.handle} · {formatRelativeTime(post.createdAt)}
                </Text>
              </Stack>
            </Stack>
          </Pressable>
          <Pressable onPress={onOpenMenu} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text.secondary} />
          </Pressable>
        </Stack>

        {typeLabel ? (
          <Stack direction="row" gap="xs" align="center">
            <Ionicons name="sparkles" size={14} color={theme.colors.accent.primary} />
            <Text variant="label" style={{ color: theme.colors.accent.primary }}>
              {typeLabel.toUpperCase()}
            </Text>
          </Stack>
        ) : null}

        {post.caption ? <Text>{post.caption}</Text> : null}
      </Stack>

      {heroMediaUrl ? (
        <Pressable onPress={onPress}>
          <Image
            source={{ uri: heroMediaUrl }}
            style={{ width: "100%", aspectRatio: 1, backgroundColor: theme.colors.background.sunken }}
            contentFit="cover"
          />
        </Pressable>
      ) : null}

      <Stack direction="row" gap="lg" align="center" style={{ padding: theme.space.md }}>
        <Pressable onPress={onToggleLike} hitSlop={8}>
          <Stack direction="row" gap="xxs" align="center">
            <Ionicons
              name={post.likedByViewer ? "heart" : "heart-outline"}
              size={22}
              color={post.likedByViewer ? theme.colors.feedback.danger : theme.colors.text.secondary}
            />
            <Text variant="caption" color="secondary">
              {post.likeCount}
            </Text>
          </Stack>
        </Pressable>
        <Pressable onPress={onPress} hitSlop={8}>
          <Stack direction="row" gap="xxs" align="center">
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.text.secondary} />
            <Text variant="caption" color="secondary">
              {post.commentCount}
            </Text>
          </Stack>
        </Pressable>
      </Stack>
    </Surface>
  );
}
