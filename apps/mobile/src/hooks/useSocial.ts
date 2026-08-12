import { useAuth } from "@clerk/expo";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreatePostInput,
  FollowStatus,
  NotificationView,
  PostAuthor,
  PostComment,
  PostSummary,
  PublicProfile,
} from "@tfit/types";
import type { CreateReportInput } from "@tfit/validation";
import { apiFetch } from "@/lib/api";

export function useFeed() {
  const { getToken, isSignedIn } = useAuth();

  return useInfiniteQuery({
    queryKey: ["feed"],
    enabled: isSignedIn,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const token = await getToken();
      const qs = pageParam ? `?before=${encodeURIComponent(pageParam)}` : "";
      return apiFetch<{ posts: PostSummary[]; nextCursor: string | null }>(`/api/feed${qs}`, token);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useCreatePost() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePostInput) => {
      const token = await getToken();
      return apiFetch<{ post: PostSummary }>("/api/posts", token, { method: "POST", body: JSON.stringify(input) });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });
}

export function usePost(postId: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["post", postId],
    enabled: isSignedIn && Boolean(postId),
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ post: PostSummary }>(`/api/posts/${postId}`, token);
    },
  });
}

export function useDeletePost() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const token = await getToken();
      return apiFetch(`/api/posts/${postId}`, token, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });
}

export function useToggleLike() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      const token = await getToken();
      return apiFetch<{ liked: boolean }>(`/api/posts/${postId}/like`, token, { method: liked ? "DELETE" : "POST" });
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}

export function useComments(postId: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["comments", postId],
    enabled: isSignedIn && Boolean(postId),
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ comments: PostComment[] }>(`/api/posts/${postId}/comments`, token);
    },
  });
}

export function useAddComment(postId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: string) => {
      const token = await getToken();
      return apiFetch<{ comment: PostComment }>(`/api/posts/${postId}/comments`, token, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}

export function useDeleteComment(postId: string) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const token = await getToken();
      return apiFetch(`/api/comments/${commentId}`, token, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}

export function useProfile(handle: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["profile", handle],
    enabled: isSignedIn && Boolean(handle),
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ profile: PublicProfile }>(`/api/users/${handle}`, token);
    },
  });
}

export function useUserPosts(handle: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["profile-posts", handle],
    enabled: isSignedIn && Boolean(handle),
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ posts: PostSummary[] }>(`/api/users/${handle}/posts`, token);
    },
  });
}

export function useFollowers(handle: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["followers", handle],
    enabled: isSignedIn && Boolean(handle),
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ users: PostAuthor[] }>(`/api/users/${handle}/followers`, token);
    },
  });
}

export function useFollowing(handle: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["following", handle],
    enabled: isSignedIn && Boolean(handle),
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ users: PostAuthor[] }>(`/api/users/${handle}/following`, token);
    },
  });
}

function useInvalidateProfileState() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["followers"] });
    queryClient.invalidateQueries({ queryKey: ["following"] });
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  };
}

export function useFollowUser() {
  const { getToken } = useAuth();
  const invalidate = useInvalidateProfileState();

  return useMutation({
    mutationFn: async (userId: string) => {
      const token = await getToken();
      return apiFetch<{ status: FollowStatus }>(`/api/follow/${userId}`, token, { method: "POST" });
    },
    onSuccess: invalidate,
  });
}

export function useUnfollowUser() {
  const { getToken } = useAuth();
  const invalidate = useInvalidateProfileState();

  return useMutation({
    mutationFn: async (userId: string) => {
      const token = await getToken();
      return apiFetch(`/api/follow/${userId}`, token, { method: "DELETE" });
    },
    onSuccess: invalidate,
  });
}

export function useFollowRequests() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["follow-requests"],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ requests: PostAuthor[] }>("/api/follow/requests", token);
    },
  });
}

export function useAcceptFollowRequest() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProfileState();

  return useMutation({
    mutationFn: async (userId: string) => {
      const token = await getToken();
      return apiFetch(`/api/follow/${userId}/accept`, token, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-requests"] });
      invalidate();
    },
  });
}

export function useRejectFollowRequest() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const token = await getToken();
      return apiFetch(`/api/follow/${userId}/reject`, token, { method: "POST" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["follow-requests"] }),
  });
}

export function useBlockedUsers() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["blocked-users"],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ users: PostAuthor[] }>("/api/blocks", token);
    },
  });
}

export function useBlockUser() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateProfileState();

  return useMutation({
    mutationFn: async (userId: string) => {
      const token = await getToken();
      return apiFetch(`/api/blocks/${userId}`, token, { method: "POST" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-users"] });
      invalidate();
    },
  });
}

export function useUnblockUser() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const token = await getToken();
      return apiFetch(`/api/blocks/${userId}`, token, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blocked-users"] }),
  });
}

export function useReportContent() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateReportInput) => {
      const token = await getToken();
      return apiFetch<{ reported: boolean }>("/api/reports", token, { method: "POST", body: JSON.stringify(input) });
    },
  });
}

export function useNotifications() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["notifications"],
    enabled: isSignedIn,
    queryFn: async () => {
      const token = await getToken();
      return apiFetch<{ notifications: NotificationView[] }>("/api/notifications", token);
    },
  });
}

export function useMarkNotificationsRead() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return apiFetch("/api/notifications/read-all", token, { method: "POST" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
