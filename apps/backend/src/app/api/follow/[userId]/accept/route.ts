import { and, eq } from "drizzle-orm";
import { getDb, followers } from "@tfit/database";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { notifyUser } from "@/lib/social";

export async function POST(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { userId: requesterId } = await params;
  const db = getDb();

  const [updated] = await db
    .update(followers)
    .set({ status: "accepted" })
    .where(and(eq(followers.followerId, requesterId), eq(followers.followedId, result.user.id), eq(followers.status, "pending")))
    .returning();

  if (!updated) return errors.notFound("Solicitação não encontrada.");

  await notifyUser(requesterId, "new_follower", { actorUserId: result.user.id });
  return jsonOk({ accepted: true });
}
