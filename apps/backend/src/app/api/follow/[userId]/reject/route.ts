import { and, eq } from "drizzle-orm";
import { getDb, followers } from "@tfit/database";
import { jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function POST(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { userId: requesterId } = await params;
  const db = getDb();
  await db
    .delete(followers)
    .where(and(eq(followers.followerId, requesterId), eq(followers.followedId, result.user.id), eq(followers.status, "pending")));

  return jsonOk({ rejected: true });
}
