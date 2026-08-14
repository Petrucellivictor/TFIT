import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { getDb, users, workoutSessions } from "@tfit/database";
import { ACCOUNT_PROVISIONING_MESSAGE, errors, jsonOk } from "@/lib/http";
import { awardXp, checkAndUnlockAchievements, recordStreakActivity, updateChallengeProgress } from "@/lib/gamification";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return errors.unauthorized();

  const { id: sessionId } = await params;
  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return errors.notFound(ACCOUNT_PROVISIONING_MESSAGE);

  const session = await db.query.workoutSessions.findFirst({
    where: and(eq(workoutSessions.id, sessionId), eq(workoutSessions.userId, user.id)),
  });
  if (!session) return errors.notFound("Sessão de treino não encontrada.");

  const [updated] = await db
    .update(workoutSessions)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(workoutSessions.id, session.id))
    .returning();

  const [xpResult, streakResult] = await Promise.all([
    awardXp(user.id, "workout_completed", session.id),
    recordStreakActivity(user.id),
  ]);
  await updateChallengeProgress(user.id, "workouts_count", { kind: "increment", by: 1 });
  const newAchievements = await checkAndUnlockAchievements(user.id);

  return jsonOk({
    session: updated,
    gamification: {
      xpAwarded: xpResult.amount,
      streakEvent: streakResult.event,
      currentStreak: streakResult.currentStreak,
      newAchievements,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel ?? undefined,
    },
  });
}
