import { and, eq } from "drizzle-orm";
import { getDb, followers, profiles } from "@tfit/database";
import { resolveFollowStatus } from "@tfit/social";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { isBlockedEitherWay, notifyUser } from "@/lib/social";

export async function POST(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { userId: targetId } = await params;
  if (targetId === result.user.id) return errors.validation("Você não pode seguir a si mesmo.");

  const db = getDb();
  const target = await db.query.profiles.findFirst({ where: eq(profiles.userId, targetId) });
  if (!target) return errors.notFound("Usuário não encontrado.");
  if (await isBlockedEitherWay(result.user.id, targetId)) return errors.notFound("Usuário não encontrado.");

  const status = resolveFollowStatus(target.isPrivate);

  const [follow] = await db
    .insert(followers)
    .values({ followerId: result.user.id, followedId: targetId, status })
    .onConflictDoNothing({ target: [followers.followerId, followers.followedId] })
    .returning();

  if (follow) {
    await notifyUser(targetId, status === "pending" ? "follow_request" : "new_follower", {
      actorUserId: result.user.id,
    });
  }

  return jsonOk({ status }, 201);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { userId: targetId } = await params;
  const db = getDb();
  await db.delete(followers).where(and(eq(followers.followerId, result.user.id), eq(followers.followedId, targetId)));

  return jsonOk({ unfollowed: true });
}
