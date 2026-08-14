import { useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, EmptyState, ErrorState, Skeleton, Stack, Text, useTheme } from "@tfit/ui";
import type { PostSummary } from "@tfit/types";
import { Screen } from "@/components/Screen";
import { Avatar } from "@/components/Avatar";
import { PostActionSheet } from "@/components/PostActionSheet";
import { ReportModal } from "@/components/ReportModal";
import { useMe } from "@/hooks/useMe";
import { useBlockUser, useFollowUser, useProfile, useReportContent, useUnfollowUser, useUserPosts } from "@/hooks/useSocial";

export default function ProfileScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const theme = useTheme();
  const router = useRouter();
  const me = useMe();
  const profile = useProfile(handle);
  const userPosts = useUserPosts(handle);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const blockUser = useBlockUser();
  const reportContent = useReportContent();

  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  if (profile.isLoading) {
    return (
      <Screen>
        <Stack gap="lg" style={{ padding: 24 }}>
          <Stack direction="row" gap="md" align="center">
            <Skeleton width={72} height={72} radius="pill" />
            <Stack gap="xxs" style={{ flex: 1 }}>
              <Skeleton width="50%" height={18} />
              <Skeleton width="35%" height={14} />
            </Stack>
          </Stack>
          <Stack direction="row" gap="md">
            <Skeleton style={{ flex: 1 }} height={110} />
            <Skeleton style={{ flex: 1 }} height={110} />
            <Skeleton style={{ flex: 1 }} height={110} />
          </Stack>
        </Stack>
      </Screen>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <Screen>
        <Stack style={{ flex: 1 }} justify="center">
          <ErrorState message="Não conseguimos carregar esse perfil agora." />
        </Stack>
      </Screen>
    );
  }

  const { profile: person } = profile.data;
  const isSelf = person.followStatus === "self" || person.userId === me.data?.profile.userId;
  const posts = userPosts.data?.posts ?? [];
  const isPrivateLocked = person.isPrivate && person.followStatus !== "accepted" && !isSelf;

  const followAction = () => {
    if (person.followStatus === "none") followUser.mutate(person.userId);
    else unfollowUser.mutate(person.userId);
  };

  const followLabel =
    person.followStatus === "accepted"
      ? "Seguindo"
      : person.followStatus === "pending"
        ? "Solicitação enviada"
        : "Seguir";

  return (
    <Screen>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ padding: 24, gap: 2 }}
        columnWrapperStyle={{ gap: 2 }}
        ListHeaderComponent={
          <Stack gap="lg" style={{ marginBottom: theme.space.lg }}>
            <Stack direction="row" justify="space-between" align="flex-start">
              <Stack direction="row" gap="md" align="center" style={{ flex: 1 }}>
                <Avatar uri={person.avatarUrl} name={person.displayName} size={72} />
                <Stack gap="xxs" style={{ flex: 1 }}>
                  <Text variant="headline">{person.displayName}</Text>
                  <Text color="secondary">@{person.handle}</Text>
                  {person.isFriend ? (
                    <Text variant="caption" style={{ color: theme.colors.accent.primary }}>
                      Amigos
                    </Text>
                  ) : null}
                </Stack>
              </Stack>
              {!isSelf ? (
                <Pressable
                  onPress={() => setMenuOpen(true)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Abrir menu do perfil"
                >
                  <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.text.secondary} />
                </Pressable>
              ) : null}
            </Stack>

            {person.bio ? <Text color="secondary">{person.bio}</Text> : null}

            <Stack direction="row" gap="xl">
              <Pressable
                onPress={() =>
                  router.push({ pathname: "/profile/[handle]/connections", params: { handle: person.handle, tab: "followers" } })
                }
              >
                <Stack gap="xxs" align="center">
                  <Text variant="bodyStrong">{person.followerCount}</Text>
                  <Text variant="caption" color="secondary">
                    Seguidores
                  </Text>
                </Stack>
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({ pathname: "/profile/[handle]/connections", params: { handle: person.handle, tab: "following" } })
                }
              >
                <Stack gap="xxs" align="center">
                  <Text variant="bodyStrong">{person.followingCount}</Text>
                  <Text variant="caption" color="secondary">
                    Seguindo
                  </Text>
                </Stack>
              </Pressable>
            </Stack>

            {!isSelf ? (
              <Button
                label={followLabel}
                variant={person.followStatus === "accepted" || person.followStatus === "pending" ? "secondary" : "primary"}
                onPress={followAction}
                disabled={followUser.isPending || unfollowUser.isPending}
              />
            ) : null}
          </Stack>
        }
        ListEmptyComponent={
          isPrivateLocked ? (
            <EmptyState
              icon={<Ionicons name="lock-closed-outline" size={32} color={theme.colors.text.secondary} />}
              title="Esta conta é privada"
              description="Siga para ver os posts."
            />
          ) : (
            <EmptyState
              icon={<Ionicons name="images-outline" size={32} color={theme.colors.text.secondary} />}
              title="Nenhum post ainda"
            />
          )
        }
        renderItem={({ item }: { item: PostSummary }) => {
          const thumb = item.mediaUrls[0];
          return (
            <Pressable
              onPress={() => router.push({ pathname: "/post/[id]", params: { id: item.id } })}
              style={{ flex: 1 / 3, aspectRatio: 1 }}
              accessibilityRole="button"
              accessibilityLabel="Abrir post"
            >
              {thumb ? (
                <Image source={{ uri: thumb }} style={{ flex: 1, backgroundColor: theme.colors.background.sunken }} contentFit="cover" />
              ) : (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.background.sunken,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: theme.space.xs,
                  }}
                >
                  <Text variant="caption" numberOfLines={3} style={{ textAlign: "center" }}>
                    {item.caption ?? ""}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        }}
      />

      <PostActionSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        isOwnPost={false}
        onReport={() => setReportOpen(true)}
        onBlockAuthor={() => blockUser.mutate(person.userId)}
      />

      {reportOpen ? (
        <ReportModal
          visible
          onClose={() => setReportOpen(false)}
          targetType="user"
          targetId={person.userId}
          isSubmitting={reportContent.isPending}
          onSubmit={(input) => reportContent.mutate(input, { onSuccess: () => setReportOpen(false) })}
        />
      ) : null}
    </Screen>
  );
}
