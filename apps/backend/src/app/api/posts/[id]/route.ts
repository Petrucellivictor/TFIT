import { eq } from "drizzle-orm";
import { getDb, posts } from "@tfit/database";
import { canViewPost } from "@tfit/social";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { getRelationship } from "@/lib/social";
import { buildPostSummaries, getVisiblePostById } from "@/lib/postSummary";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const post = await getVisiblePostById(id);
  if (!post) return errors.notFound("Post não encontrado.");

  const relationship = await getRelationship(result.user.id, post.userId);
  if (!canViewPost(post.visibility, relationship)) return errors.notFound("Post não encontrado.");

  const [summary] = await buildPostSummaries([post], result.user.id);
  return jsonOk({ post: summary });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const db = getDb();
  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!post || post.userId !== result.user.id) return errors.notFound("Post não encontrado.");

  await db.update(posts).set({ deletedAt: new Date() }).where(eq(posts.id, id));
  return jsonOk({ deleted: true });
}
