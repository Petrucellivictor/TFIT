import { eq } from "drizzle-orm";
import { getDb, achievements, userAchievements } from "@tfit/database";
import { jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const [catalog, unlocked] = await Promise.all([
    db.select().from(achievements),
    db.select().from(userAchievements).where(eq(userAchievements.userId, result.user.id)),
  ]);

  const unlockedByAchievementId = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

  const response = catalog.map((achievement) => ({
    id: achievement.id,
    slug: achievement.slug,
    name: achievement.name,
    description: achievement.description,
    icon: achievement.icon,
    unlockedAt: unlockedByAchievementId.get(achievement.id)?.toISOString() ?? null,
  }));

  return jsonOk({ achievements: response });
}
