import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb, profiles, posts } from "@tfit/database";
import { canViewPost } from "@tfit/social";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { getRelationship } from "@/lib/social";
import { buildPostSummaries } from "@/lib/postSummary";

export async function GET(_req: Request, { params }: { params: Promise<{ handle: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { handle } = await params;
  const db = getDb();
  const target = await db.query.profiles.findFirst({ where: eq(profiles.handle, handle.toLowerCase()) });
  if (!target) return errors.notFound("Usuário não encontrado.");

  const relationship = await getRelationship(result.user.id, target.userId);
  if (relationship.isBlocked) return jsonOk({ posts: [] });

  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.userId, target.userId), isNull(posts.deletedAt)))
    .orderBy(desc(posts.createdAt))
    .limit(60);

  const visibleRows = rows.filter((post) => canViewPost(post.visibility, relationship));
  const summaries = await buildPostSummaries(visibleRows, result.user.id);

  return jsonOk({ posts: summaries });
}
