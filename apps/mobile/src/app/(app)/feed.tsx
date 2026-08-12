import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Stack, Text, useTheme } from "@tfit/ui";
import type { PostSummary } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { PostCard } from "@/components/PostCard";
import { PostActionSheet } from "@/components/PostActionSheet";
import { ReportModal } from "@/components/ReportModal";
import { useMe } from "@/hooks/useMe";
import { useBlockUser, useDeletePost, useFeed, useNotifications, useReportContent, useToggleLike } from "@/hooks/useSocial";

export default function FeedScreen() {
  const theme = useTheme();
  const router = useRouter();
  const me = useMe();
  const feed = useFeed();
  const notifications = useNotifications();
  const toggleLike = useToggleLike();
  const deletePost = useDeletePost();
  const blockUser = useBlockUser();
  const reportContent = useReportContent();

  const [menuPost, setMenuPost] = useState<PostSummary | null>(null);
  const [reportPost, setReportPost] = useState<PostSummary | null>(null);

  if (feed.isLoading) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
        </Stack>
      </Screen>
    );
  }

  if (feed.isError) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1, padding: 32 }}>
          <Text color="secondary" style={{ textAlign: "center" }}>
            Não conseguimos carregar o feed agora. Puxe para atualizar.
          </Text>
        </Stack>
      </Screen>
    );
  }

  const posts = feed.data?.pages.flatMap((page) => page.posts) ?? [];
  const unreadCount = notifications.data?.notifications.filter((n) => !n.isRead).length ?? 0;

  return (
    <Screen>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, gap: theme.space.md }}
        ItemSeparatorComponent={() => <View style={{ height: theme.space.md }} />}
        refreshControl={<RefreshControl refreshing={feed.isRefetching} onRefresh={() => feed.refetch()} />}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
        }}
        ListHeaderComponent={
          <Stack direction="row" justify="space-between" align="center" style={{ marginBottom: theme.space.md }}>
            <Text variant="title">Feed</Text>
            <Pressable
              onPress={() => router.push("/notifications")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={unreadCount > 0 ? `Notificações, ${unreadCount} não lidas` : "Notificações"}
            >
              <Stack direction="row" gap="xxs" align="center">
                <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
                {unreadCount > 0 ? (
                  <View
                    style={{
                      minWidth: 18,
                      height: 18,
                      borderRadius: theme.radius.pill,
                      backgroundColor: theme.colors.feedback.danger,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 4,
                    }}
                  >
                    <Text variant="caption" color="inverse" style={{ fontSize: 10, lineHeight: 12 }}>
                      {unreadCount}
                    </Text>
                  </View>
                ) : null}
              </Stack>
            </Pressable>
          </Stack>
        }
        ListEmptyComponent={
          <Stack align="center" justify="center" gap="sm" style={{ paddingTop: 64 }}>
            <Ionicons name="people-outline" size={40} color={theme.colors.text.secondary} />
            <Text color="secondary" style={{ textAlign: "center" }}>
              Nenhum post ainda. Siga outras pessoas ou publique algo para começar.
            </Text>
          </Stack>
        }
        ListFooterComponent={feed.isFetchingNextPage ? <ActivityIndicator style={{ marginTop: theme.space.md }} /> : null}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPressAuthor={() => router.push({ pathname: "/profile/[handle]", params: { handle: item.author.handle } })}
            onPress={() => router.push({ pathname: "/post/[id]", params: { id: item.id } })}
            onToggleLike={() => toggleLike.mutate({ postId: item.id, liked: item.likedByViewer })}
            onOpenMenu={() => setMenuPost(item)}
          />
        )}
      />

      <PostActionSheet
        visible={Boolean(menuPost)}
        onClose={() => setMenuPost(null)}
        isOwnPost={Boolean(menuPost && me.data && menuPost.author.userId === me.data.profile.userId)}
        onDelete={menuPost ? () => deletePost.mutate(menuPost.id) : undefined}
        onReport={() => setReportPost(menuPost)}
        onBlockAuthor={menuPost ? () => blockUser.mutate(menuPost.author.userId) : undefined}
      />

      {reportPost ? (
        <ReportModal
          visible
          onClose={() => setReportPost(null)}
          targetType="post"
          targetId={reportPost.id}
          isSubmitting={reportContent.isPending}
          onSubmit={(input) => reportContent.mutate(input, { onSuccess: () => setReportPost(null) })}
        />
      ) : null}
    </Screen>
  );
}
