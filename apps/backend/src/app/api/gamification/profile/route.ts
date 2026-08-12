import { eq, sql } from "drizzle-orm";
import { getDb, xpTransactions, streaks } from "@tfit/database";
import { getLevelProgress } from "@tfit/gamification";
import { jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const [[{ totalXp }], streak] = await Promise.all([
    db
      .select({ totalXp: sql<number>`coalesce(sum(${xpTransactions.amount}), 0)::int` })
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, result.user.id)),
    db.query.streaks.findFirst({ where: eq(streaks.userId, result.user.id) }),
  ]);

  return jsonOk({
    ...getLevelProgress(totalXp),
    streak: {
      current: streak?.currentStreak ?? 0,
      longest: streak?.longestStreak ?? 0,
      freezesAvailable: streak?.freezesAvailable ?? 1,
    },
  });
}
