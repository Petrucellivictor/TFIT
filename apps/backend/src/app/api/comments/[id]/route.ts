import { eq } from "drizzle-orm";
import { getDb, postComments } from "@tfit/database";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const db = getDb();
  const comment = await db.query.postComments.findFirst({ where: eq(postComments.id, id) });
  if (!comment || comment.userId !== result.user.id) return errors.notFound("Comentário não encontrado.");

  await db.update(postComments).set({ deletedAt: new Date() }).where(eq(postComments.id, id));
  return jsonOk({ deleted: true });
}
