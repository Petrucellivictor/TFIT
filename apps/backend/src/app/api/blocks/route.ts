import { eq } from "drizzle-orm";
import { getDb, blockedUsers, profiles } from "@tfit/database";
import { jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const rows = await db
    .select({ profile: profiles })
    .from(blockedUsers)
    .innerJoin(profiles, eq(blockedUsers.blockedId, profiles.userId))
    .where(eq(blockedUsers.blockerId, result.user.id));

  return jsonOk({
    users: rows.map(({ profile }) => ({
      userId: profile.userId,
      handle: profile.handle,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    })),
  });
}
