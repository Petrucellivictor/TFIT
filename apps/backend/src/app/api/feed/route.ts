import { and, desc, eq, inArray, isNull, lt } from "drizzle-orm";
import { getDb, posts, followers } from "@tfit/database";
import { canViewPost, type ViewerRelationship } from "@tfit/social";
import { jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { buildPostSummaries } from "@/lib/postSummary";

const PAGE_SIZE = 20;

/**
 * Reverse-chronological, no ranking algorithm — see docs/DATABASE.md on why
 * that's the honest choice here rather than a "relevance" model we have no
 * usage data to justify.
 */
export async function GET(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;
  const viewerId = result.user.id;

  const { searchParams } = new URL(req.url);
  const before = searchParams.get("before");

  const db = getDb();
  const followedRows = await db
    .select({ followedId: followers.followedId })
    .from(followers)
    .where(and(eq(followers.followerId, viewerId), eq(followers.status, "accepted")));
  const followedIds = followedRows.map((r) => r.followedId);
  const authorIds = [...new Set([viewerId, ...followedIds])];

  const rows = await db
    .select()
    .from(posts)
    .where(
      and(
        inArray(posts.userId, authorIds),
        isNull(posts.deletedAt),
        before ? lt(posts.createdAt, new Date(before)) : undefined,
      ),
    )
    .orderBy(desc(posts.createdAt))
    .limit(PAGE_SIZE);

  // Everyone in `authorIds` is either the viewer or someone they accepted-follow,
  // so isFollowingAccepted is trivially known; only "friend" (mutual) needs a check.
  const followedBackRows =
    followedIds.length > 0
      ? await db
          .select({ followerId: followers.followerId })
          .from(followers)
          .where(and(inArray(followers.followerId, followedIds), eq(followers.followedId, viewerId), eq(followers.status, "accepted")))
      : [];
  const followsMeBack = new Set(followedBackRows.map((r) => r.followerId));

  const visibleRows = rows.filter((post) => {
    const relationship: ViewerRelationship = {
      isSelf: post.userId === viewerId,
      isFollowingAccepted: post.userId === viewerId || followedIds.includes(post.userId),
      isFriend: followsMeBack.has(post.userId),
      isBlocked: false, // blocked authors are never followed, so they can't appear in authorIds
    };
    return canViewPost(post.visibility, relationship);
  });

  const summaries = await buildPostSummaries(visibleRows, viewerId);
  const nextCursor = rows.length === PAGE_SIZE ? rows[rows.length - 1]!.createdAt.toISOString() : null;

  return jsonOk({ posts: summaries, nextCursor });
}
