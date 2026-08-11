import { and, eq, gte, sql } from "drizzle-orm";
import { getDb, aiAgentRuns } from "@tfit/database";

/**
 * Interim rate limiting via a Postgres count query. docs/SECURITY.md calls
 * for Upstash-backed rate limiting on AI endpoints, but Upstash isn't
 * provisioned yet (Marketplace terms pending) — this is a real, working
 * safeguard in the meantime, not a placeholder. Swap for Upstash `Ratelimit`
 * once provisioned; the call site (route handlers) won't need to change.
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
