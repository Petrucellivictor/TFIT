import { and, eq } from "drizzle-orm";
import { getDb, followers, profiles } from "@tfit/database";
import { jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const rows = await db
    .select({ profile: profiles })
    .from(followers)
    .innerJoin(profiles, eq(followers.followerId, profiles.userId))
    .where(and(eq(followers.followedId, result.user.id), eq(followers.status, "pending")));

  return jsonOk({
    requests: rows.map(({ profile }) => ({
      userId: profile.userId,
      handle: profile.handle,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    })),
  });
}
