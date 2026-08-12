import { desc, eq, inArray } from "drizzle-orm";
import { getDb, notifications, profiles } from "@tfit/database";
import type { NotificationView } from "@tfit/types";
import { jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, result.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);

  const actorIds = [...new Set(rows.map((r) => r.actorUserId).filter((id): id is string => Boolean(id)))];
  const actorRows = actorIds.length > 0 ? await db.select().from(profiles).where(inArray(profiles.userId, actorIds)) : [];
  const actorById = new Map(actorRows.map((a) => [a.userId, a]));

  const views: NotificationView[] = rows.map((row) => {
    const actor = row.actorUserId ? actorById.get(row.actorUserId) : undefined;
    return {
      id: row.id,
      type: row.type,
      actor: actor
        ? { userId: actor.userId, handle: actor.handle, displayName: actor.displayName, avatarUrl: actor.avatarUrl }
        : null,
      referenceId: row.referenceId,
      message: row.message,
      isRead: row.isRead,
      createdAt: row.createdAt.toISOString(),
    };
  });

  return jsonOk({ notifications: views });
}
