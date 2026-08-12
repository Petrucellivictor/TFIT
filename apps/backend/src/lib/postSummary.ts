import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb, posts, postMedia, postLikes, postComments, profiles, type Post } from "@tfit/database";
import type { PostSummary } from "@tfit/types";

/** Batched (not N+1) construction of PostSummary for a list of already-visibility-filtered post rows. */
export async function buildPostSummaries(postRows: Post[], viewerId: string): Promise<PostSummary[]> {
  if (postRows.length === 0) return [];

  const db = getDb();
  const postIds = postRows.map((p) => p.id);
  const userIds = [...new Set(postRows.map((p) => p.userId))];

  const [authorRows, mediaRows, likeCountRows, viewerLikeRows, commentCountRows] = await Promise.all([
    db.select().from(profiles).where(inArray(profiles.userId, userIds)),
    db.select().from(postMedia).where(inArray(postMedia.postId, postIds)).orderBy(postMedia.order),
    db
      .select({ postId: postLikes.postId, count: sql<number>`count(*)::int` })
      .from(postLikes)
      .where(inArray(postLikes.postId, postIds))
      .groupBy(postLikes.postId),
    db.select({ postId: postLikes.postId }).from(postLikes).where(and(inArray(postLikes.postId, postIds), eq(postLikes.userId, viewerId))),
    db
      .select({ postId: postComments.postId, count: sql<number>`count(*)::int` })
      .from(postComments)
      .where(inArray(postComments.postId, postIds))
      .groupBy(postComments.postId),
  ]);

  const authorByUserId = new Map(authorRows.map((a) => [a.userId, a]));
  const mediaByPostId = new Map<string, string[]>();
  for (const media of mediaRows) {
    const list = mediaByPostId.get(media.postId) ?? [];
    list.push(media.url);
    mediaByPostId.set(media.postId, list);
  }
  const likeCountByPostId = new Map(likeCountRows.map((r) => [r.postId, r.count]));
  const commentCountByPostId = new Map(commentCountRows.map((r) => [r.postId, r.count]));
  const viewerLikedPostIds = new Set(viewerLikeRows.map((r) => r.postId));

  return postRows.map((post) => {
    const author = authorByUserId.get(post.userId);
    return {
      id: post.id,
      author: author
        ? { userId: author.userId, handle: author.handle, displayName: author.displayName, avatarUrl: author.avatarUrl }
        : { userId: post.userId, handle: "", displayName: "Usuário", avatarUrl: null },
      type: post.type,
      caption: post.caption,
      visibility: post.visibility,
      metadata: (post.metadata as Record<string, unknown> | null) ?? null,
      mediaUrls: mediaByPostId.get(post.id) ?? [],
      likeCount: likeCountByPostId.get(post.id) ?? 0,
      commentCount: commentCountByPostId.get(post.id) ?? 0,
      likedByViewer: viewerLikedPostIds.has(post.id),
      createdAt: post.createdAt.toISOString(),
    };
  });
}

export async function getVisiblePostById(postId: string): Promise<Post | null> {
  const db = getDb();
  const post = await db.query.posts.findFirst({ where: and(eq(posts.id, postId), sql`${posts.deletedAt} is null`) });
  return post ?? null;
}
