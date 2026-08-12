import { and, eq } from "drizzle-orm";
import { getDb, profiles, followers } from "@tfit/database";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function GET(_req: Request, { params }: { params: Promise<{ handle: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { handle } = await params;
  const db = getDb();
  const target = await db.query.profiles.findFirst({ where: eq(profiles.handle, handle.toLowerCase()) });
  if (!target) return errors.notFound("Usuário não encontrado.");

  const rows = await db
    .select({ profile: profiles })
    .from(followers)
    .innerJoin(profiles, eq(followers.followedId, profiles.userId))
    .where(and(eq(followers.followerId, target.userId), eq(followers.status, "accepted")));

  return jsonOk({
    users: rows.map(({ profile }) => ({
      userId: profile.userId,
      handle: profile.handle,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    })),
  });
}
