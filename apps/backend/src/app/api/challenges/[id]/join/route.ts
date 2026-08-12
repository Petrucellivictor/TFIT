import { eq } from "drizzle-orm";
import { getDb, challenges, challengeParticipants, streaks } from "@tfit/database";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { awardXp } from "@/lib/gamification";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id: challengeId } = await params;
  const db = getDb();

  const challenge = await db.query.challenges.findFirst({ where: eq(challenges.id, challengeId) });
  if (!challenge) return errors.notFound("Desafio não encontrado.");

  const today = new Date().toISOString().slice(0, 10);
  if (today < challenge.startDate || today > challenge.endDate) {
    return errors.validation("Esse desafio não está mais disponível para entrar.");
  }

  const existing = await db.query.challengeParticipants.findFirst({
    where: (p, { and, eq: eqOp }) => and(eqOp(p.challengeId, challengeId), eqOp(p.userId, result.user.id)),
  });
  if (existing) return jsonOk({ participant: existing });

  // Streak challenges start from wherever the user's streak already is — workouts_count starts at 0
  // (retroactively counting past sessions in the period is a reasonable future improvement, not done here).
  let startingProgress = 0;
  if (challenge.type === "streak_days") {
    const streak = await db.query.streaks.findFirst({ where: eq(streaks.userId, result.user.id) });
    startingProgress = streak?.currentStreak ?? 0;
  }

  const completesImmediately = startingProgress >= challenge.targetValue;

  const [participant] = await db
    .insert(challengeParticipants)
    .values({
      challengeId,
      userId: result.user.id,
      progressValue: startingProgress,
      status: completesImmediately ? "completed" : "active",
      completedAt: completesImmediately ? new Date() : null,
    })
    .returning();

  if (completesImmediately) {
    await awardXp(result.user.id, "challenge_completed", participant!.id);
  }

  return jsonOk({ participant }, 201);
}
