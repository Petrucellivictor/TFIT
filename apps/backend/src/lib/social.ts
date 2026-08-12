import { and, eq, or, sql } from "drizzle-orm";
import { getDb, followers, blockedUsers, notifications, type Profile } from "@tfit/database";
import type { ViewerRelationship } from "@tfit/social";
import type { FollowStatus, NotificationType, PublicProfile } from "@tfit/types";

export async function isBlockedEitherWay(userAId: string, userBId: string): Promise<boolean> {
  const db = getDb();
  const row = await db.query.blockedUsers.findFirst({
    where: or(
      and(eq(blockedUsers.blockerId, userAId), eq(blockedUsers.blockedId, userBId)),
      and(eq(blockedUsers.blockerId, userBId), eq(blockedUsers.blockedId, userAId)),
    ),
  });
  return Boolean(row);
}

/** Builds the relationship object packages/social's canViewPost decides visibility from. */
export async function getRelationship(viewerId: string, authorId: string): Promise<ViewerRelationship> {
  if (viewerId === authorId) {
    return { isSelf: true, isFollowingAccepted: false, isFriend: false, isBlocked: false };
  }

  const db = getDb();
  const [viewerFollowsAuthor, authorFollowsViewer, blocked] = await Promise.all([
    db.query.followers.findFirst({
      where: and(eq(followers.followerId, viewerId), eq(followers.followedId, authorId), eq(followers.status, "accepted")),
    }),
    db.query.followers.findFirst({
      where: and(eq(followers.followerId, authorId), eq(followers.followedId, viewerId), eq(followers.status, "accepted")),
    }),
    isBlockedEitherWay(viewerId, authorId),
  ]);

  return {
    isSelf: false,
    isFollowingAccepted: Boolean(viewerFollowsAuthor),
    isFriend: Boolean(viewerFollowsAuthor) && Boolean(authorFollowsViewer),
    isBlocked: blocked,
  };
}

export async function buildPublicProfile(target: Profile, viewerId: string): Promise<PublicProfile> {
  const db = getDb();

  const [followerCountRow, followingCountRow, relationship] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(followers)
      .where(and(eq(followers.followedId, target.userId), eq(followers.status, "accepted"))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(followers)
      .where(and(eq(followers.followerId, target.userId), eq(followers.status, "accepted"))),
    getRelationship(viewerId, target.userId),
  ]);

  let followStatus: FollowStatus = "none";
  if (relationship.isSelf) {
    followStatus = "self";
  } else {
    const viewerFollowRow = await db.query.followers.findFirst({
      where: and(eq(followers.followerId, viewerId), eq(followers.followedId, target.userId)),
    });
    if (viewerFollowRow) followStatus = viewerFollowRow.status;
  }

  return {
    userId: target.userId,
    handle: target.handle,
    displayName: target.displayName,
    avatarUrl: target.avatarUrl,
    bio: target.bio,
    isPrivate: target.isPrivate,
    followerCount: followerCountRow[0]?.count ?? 0,
    followingCount: followingCountRow[0]?.count ?? 0,
    followStatus,
    isFriend: relationship.isFriend,
  };
}

/** Best-effort — a failed notification must never break the action that triggered it. */
export async function notifyUser(
  userId: string,
  type: NotificationType,
  options: { actorUserId?: string; referenceId?: string; message?: string } = {},
): Promise<void> {
  if (options.actorUserId === userId) return; // never notify yourself about your own action

  try {
    const db = getDb();
    await db.insert(notifications).values({
      userId,
      type,
      actorUserId: options.actorUserId ?? null,
      referenceId: options.referenceId ?? null,
      message: options.message ?? null,
    });
  } catch (error) {
    console.error("notifyUser failed", { userId, type, error });
  }
}
