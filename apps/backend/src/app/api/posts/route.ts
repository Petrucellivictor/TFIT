import { getDb, posts, postMedia } from "@tfit/database";
import { createPostSchema } from "@tfit/validation";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { buildPostSummaries } from "@/lib/postSummary";
import { isPostRateLimited } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  if (await isPostRateLimited(result.user.id)) return errors.rateLimited("Você atingiu o limite de posts por hora.");

  const parsed = createPostSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const db = getDb();
  const [post] = await db
    .insert(posts)
    .values({
      userId: result.user.id,
      type: parsed.data.type,
      caption: parsed.data.caption,
      visibility: parsed.data.visibility,
      metadata: parsed.data.metadata,
    })
    .returning();

  if (parsed.data.mediaUrls && parsed.data.mediaUrls.length > 0) {
    await db.insert(postMedia).values(
      parsed.data.mediaUrls.map((url, index) => ({ postId: post!.id, url, order: index + 1 })),
    );
  }

  const [summary] = await buildPostSummaries([post!], result.user.id);
  return jsonOk({ post: summary }, 201);
}
