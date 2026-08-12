import { and, eq, gte, sql } from "drizzle-orm";
import { getDb, aiAgentRuns, followers, postComments, posts, professionalServices, reports } from "@tfit/database";

/**
 * Interim rate limiting via Postgres count queries over each action's own
 * table — no separate "rate limit events" bookkeeping table, so a burst of
 * rejected attempts can't itself balloon storage, and deleting/soft-deleting
 * a row afterward doesn't reset the count (you can't spam-then-delete your
 * way around it). docs/SECURITY.md calls for Upstash-backed rate limiting,
 * but Upstash isn't provisioned yet (Marketplace terms pending) — this is a
 * real, working safeguard in the meantime, not a placeholder. Swap for
 * Upstash `Ratelimit` once provisioned; call sites won't need to change.
 */
export async function isRateLimited(userId: string, agentName: string, maxPerHour: number): Promise<boolean> {
  const db = getDb();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(aiAgentRuns)
    .where(and(eq(aiAgentRuns.userId, userId), eq(aiAgentRuns.agentName, agentName), gte(aiAgentRuns.createdAt, oneHourAgo)));

  return count >= maxPerHour;
}

export async function isPostRateLimited(userId: string, maxPerHour = 20): Promise<boolean> {
  const db = getDb();
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .where(and(eq(posts.userId, userId), gte(posts.createdAt, since)));
  return count >= maxPerHour;
}

export async function isCommentRateLimited(userId: string, maxPerHour = 60): Promise<boolean> {
  const db = getDb();
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(postComments)
    .where(and(eq(postComments.userId, userId), gte(postComments.createdAt, since)));
  return count >= maxPerHour;
}

export async function isFollowRateLimited(userId: string, maxPerHour = 100): Promise<boolean> {
  const db = getDb();
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(followers)
    .where(and(eq(followers.followerId, userId), gte(followers.createdAt, since)));
  return count >= maxPerHour;
}

export async function isReportRateLimited(userId: string, maxPerHour = 10): Promise<boolean> {
  const db = getDb();
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reports)
    .where(and(eq(reports.reporterId, userId), gte(reports.createdAt, since)));
  return count >= maxPerHour;
}

export async function isServiceCreateRateLimited(userId: string, maxPerHour = 20): Promise<boolean> {
  const db = getDb();
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(professionalServices)
    .where(and(eq(professionalServices.professionalId, userId), gte(professionalServices.createdAt, since)));
  return count >= maxPerHour;
}
