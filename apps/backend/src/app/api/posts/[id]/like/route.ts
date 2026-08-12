import { and, eq } from "drizzle-orm";
import { getDb, postLikes } from "@tfit/database";
import { canViewPost } from "@tfit/social";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { getRelationship, notifyUser } from "@/lib/social";
import { getVisiblePostById } from "@/lib/postSummary";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const post = await getVisiblePostById(id);
  if (!post) return errors.notFound("Post não encontrado.");

  const relationship = await getRelationship(result.user.id, post.userId);
  if (!canViewPost(post.visibility, relationship)) return errors.notFound("Post não encontrado.");

  const db = getDb();
  const [like] = await db
    .insert(postLikes)
    .values({ postId: id, userId: result.user.id })
    .onConflictDoNothing({ target: [postLikes.postId, postLikes.userId] })
    .returning();

  if (like) {
    await notifyUser(post.userId, "like", { actorUserId: result.user.id, referenceId: id });
  }

  return jsonOk({ liked: true }, 201);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const db = getDb();
  await db.delete(postLikes).where(and(eq(postLikes.postId, id), eq(postLikes.userId, result.user.id)));

  return jsonOk({ liked: false });
}
