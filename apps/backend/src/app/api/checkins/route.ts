import { desc, eq } from "drizzle-orm";
import { getDb, dailyCheckins } from "@tfit/database";
import { checkinInputSchema } from "@tfit/validation";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { awardXp, checkAndUnlockAchievements, recordStreakActivity, updateChallengeProgress } from "@/lib/gamification";

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const checkins = await db
    .select()
    .from(dailyCheckins)
    .where(eq(dailyCheckins.userId, result.user.id))
    .orderBy(desc(dailyCheckins.date))
    .limit(30);

  return jsonOk({ checkins });
}

export async function POST(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const parsed = checkinInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const [checkin] = await db
    .insert(dailyCheckins)
    .values({ userId: result.user.id, date: today, ...parsed.data })
    .onConflictDoUpdate({
      target: [dailyCheckins.userId, dailyCheckins.date],
      set: { ...parsed.data },
    })
    .returning();

  const [xpResult, streakResult] = await Promise.all([
    awardXp(result.user.id, "checkin", checkin!.id),
    recordStreakActivity(result.user.id),
  ]);
  await updateChallengeProgress(result.user.id, "streak_days", { kind: "set", value: streakResult.currentStreak });
  const newAchievements = await checkAndUnlockAchievements(result.user.id);

  return jsonOk(
    {
      checkin,
      gamification: {
        xpAwarded: xpResult.amount,
        streakEvent: streakResult.event,
        currentStreak: streakResult.currentStreak,
        newAchievements,
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.newLevel ?? undefined,
      },
    },
    201,
  );
}
