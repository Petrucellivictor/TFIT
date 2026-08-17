import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, EmptyState, ErrorState, Stack, TextField, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { PostCard } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/PostCardSkeleton";
import { CommentRow } from "@/components/CommentRow";
import { UserRowSkeleton } from "@/components/UserRowSkeleton";
import { PostActionSheet } from "@/components/PostActionSheet";
import { ReportModal } from "@/components/ReportModal";
import { useMe } from "@/hooks/useMe";
import { useAddComment, useBlockUser, useComments, useDeletePost, usePost, useReportContent, useToggleLike } from "@/hooks/useSocial";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const me = useMe();
  const post = usePost(id);
  const comments = useComments(id);
  const toggleLike = useToggleLike();
  const addComment = useAddComment(id);
  const deletePost = useDeletePost();
  const blockUser = useBlockUser();
  const reportContent = useReportContent();

  const [commentBody, setCommentBody] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  if (post.isLoading) {
    return (
      <Screen>
        <Stack style={{ padding: 24 }}>
          <PostCardSkeleton />
        </Stack>
      </Screen>
    );
  }

  if (post.isError || !post.data) {
    return (
      <Screen>
        <Stack style={{ flex: 1 }} justify="center">
          <ErrorState message="Não conseguimos encontrar esse post." />
        </Stack>
      </Screen>
    );
  }

  const { post: item } = post.data;
  const isOwnPost = item.author.userId === me.data?.profile.userId;

  const submitComment = () => {
    const body = commentBody.trim();
    if (!body) return;
    addComment.mutate(body, { onSuccess: () => setCommentBody("") });
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          data={comments.data?.comments ?? []}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 24, gap: theme.space.md }}
          ItemSeparatorComponent={() => <View style={{ height: theme.space.md }} />}
          ListHeaderComponent={
            <View style={{ marginBottom: theme.space.md }}>
              <PostCard
                post={item}
                onPressAuthor={() => router.push({ pathname: "/profile/[handle]", params: { handle: item.author.handle } })}
                onPress={() => {}}
                onToggleLike={() => toggleLike.mutate({ postId: item.id, liked: item.likedByViewer })}
                isTogglingLike={toggleLike.isPending && toggleLike.variables?.postId === item.id}
                onOpenMenu={() => setMenuOpen(true)}
              />
            </View>
          }
          ListEmptyComponent={
            comments.isLoading ? (
              <Stack gap="md">
                <UserRowSkeleton />
                <UserRowSkeleton />
              </Stack>
            ) : (
              <EmptyState
                icon={<Ionicons name="chatbubble-outline" size={32} color={theme.colors.text.secondary} />}
                title="Seja o primeiro a comentar"
              />
            )
          }
          renderItem={({ item: comment }) => <CommentRow comment={comment} />}
        />

        <Stack direction="row" gap="sm" align="center" style={{ padding: theme.space.md, paddingTop: 0 }}>
          <TextField
            style={{ flex: 1 }}
            placeholder="Adicionar um comentário..."
            value={commentBody}
            onChangeText={setCommentBody}
          />
          <Button label="Enviar" onPress={submitComment} disabled={!commentBody.trim() || addComment.isPending} />
        </Stack>
      </KeyboardAvoidingView>

      <PostActionSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        isOwnPost={isOwnPost}
        onDelete={() => {
          deletePost.mutate(item.id, { onSuccess: () => router.back() });
        }}
        onReport={() => setReportOpen(true)}
        onBlockAuthor={() => blockUser.mutate(item.author.userId)}
      />

      {reportOpen ? (
        <ReportModal
          visible
          onClose={() => setReportOpen(false)}
          targetType="post"
          targetId={item.id}
          isSubmitting={reportContent.isPending}
          onSubmit={(input) => reportContent.mutate(input, { onSuccess: () => setReportOpen(false) })}
        />
      ) : null}
    </Screen>
  );
}
