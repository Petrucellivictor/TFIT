import { and, eq, or } from "drizzle-orm";
import { getDb, blockedUsers, followers } from "@tfit/database";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function POST(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { userId: targetId } = await params;
  if (targetId === result.user.id) return errors.validation("Você não pode bloquear a si mesmo.");

  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.insert(blockedUsers).values({ blockerId: result.user.id, blockedId: targetId }).onConflictDoNothing();
    // Blocking severs any existing follow relationship in either direction.
    await tx
      .delete(followers)
      .where(
        or(
          and(eq(followers.followerId, result.user.id), eq(followers.followedId, targetId)),
          and(eq(followers.followerId, targetId), eq(followers.followedId, result.user.id)),
        ),
      );
  });

  return jsonOk({ blocked: true }, 201);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { userId: targetId } = await params;
  const db = getDb();
  await db.delete(blockedUsers).where(and(eq(blockedUsers.blockerId, result.user.id), eq(blockedUsers.blockedId, targetId)));

  return jsonOk({ blocked: false });
}
