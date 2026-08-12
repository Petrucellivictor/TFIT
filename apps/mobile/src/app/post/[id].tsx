import { useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Button, Stack, Text, TextField, useTheme } from "@tfit/ui";
import { Screen } from "@/components/Screen";
import { PostCard } from "@/components/PostCard";
import { CommentRow } from "@/components/CommentRow";
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
        <Stack align="center" justify="center" style={{ flex: 1 }}>
          <ActivityIndicator />
        </Stack>
      </Screen>
    );
  }

  if (post.isError || !post.data) {
    return (
      <Screen>
        <Stack align="center" justify="center" style={{ flex: 1, padding: 32 }}>
          <Text color="secondary" style={{ textAlign: "center" }}>
            Não conseguimos encontrar esse post.
          </Text>
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
                onOpenMenu={() => setMenuOpen(true)}
              />
            </View>
          }
          ListEmptyComponent={
            comments.isLoading ? (
              <ActivityIndicator />
            ) : (
              <Text color="secondary" style={{ textAlign: "center" }}>
                Seja o primeiro a comentar.
              </Text>
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
