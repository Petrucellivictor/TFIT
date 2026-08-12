import { and, asc, eq, isNull, inArray } from "drizzle-orm";
import { getDb, postComments, profiles } from "@tfit/database";
import { canViewPost } from "@tfit/social";
import { createCommentSchema } from "@tfit/validation";
import type { PostComment } from "@tfit/types";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { getRelationship, notifyUser } from "@/lib/social";
import { getVisiblePostById } from "@/lib/postSummary";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const post = await getVisiblePostById(id);
  if (!post) return errors.notFound("Post não encontrado.");

  const relationship = await getRelationship(result.user.id, post.userId);
  if (!canViewPost(post.visibility, relationship)) return errors.notFound("Post não encontrado.");

  const db = getDb();
  const rows = await db
    .select()
    .from(postComments)
    .where(and(eq(postComments.postId, id), isNull(postComments.deletedAt)))
    .orderBy(asc(postComments.createdAt));

  const authorIds = [...new Set(rows.map((r) => r.userId))];
  const authorRows = authorIds.length > 0 ? await db.select().from(profiles).where(inArray(profiles.userId, authorIds)) : [];
  const authorById = new Map(authorRows.map((a) => [a.userId, a]));

  const comments: PostComment[] = rows.map((row) => {
    const author = authorById.get(row.userId);
    return {
      id: row.id,
      author: author
        ? { userId: author.userId, handle: author.handle, displayName: author.displayName, avatarUrl: author.avatarUrl }
        : { userId: row.userId, handle: "", displayName: "Usuário", avatarUrl: null },
      body: row.body,
      createdAt: row.createdAt.toISOString(),
    };
  });

  return jsonOk({ comments });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const parsed = createCommentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation("Comentário inválido.");

  const post = await getVisiblePostById(id);
  if (!post) return errors.notFound("Post não encontrado.");

  const relationship = await getRelationship(result.user.id, post.userId);
  if (!canViewPost(post.visibility, relationship)) return errors.notFound("Post não encontrado.");

  const db = getDb();
  const [comment] = await db.insert(postComments).values({ postId: id, userId: result.user.id, body: parsed.data.body }).returning();

  await notifyUser(post.userId, "comment", { actorUserId: result.user.id, referenceId: id });

  return jsonOk({ comment }, 201);
}
