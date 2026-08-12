import { and, eq } from "drizzle-orm";
import { getDb, notifications } from "@tfit/database";
import { jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function POST() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, result.user.id), eq(notifications.isRead, false)));

  return jsonOk({ read: true });
}
