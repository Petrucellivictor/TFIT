import { and, eq, gte, lte } from "drizzle-orm";
import { getDb, challenges, challengeParticipants } from "@tfit/database";
import { jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const [activeChallenges, participations] = await Promise.all([
    db
      .select()
      .from(challenges)
      .where(and(eq(challenges.isPublic, true), lte(challenges.startDate, today), gte(challenges.endDate, today))),
    db.select().from(challengeParticipants).where(eq(challengeParticipants.userId, result.user.id)),
  ]);

  const participationByChallengeId = new Map(participations.map((p) => [p.challengeId, p]));

  const response = activeChallenges.map((challenge) => {
    const participation = participationByChallengeId.get(challenge.id);
    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      type: challenge.type,
      targetValue: challenge.targetValue,
      period: challenge.period,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      participation: participation
        ? { progressValue: participation.progressValue, status: participation.status }
        : null,
    };
  });

  return jsonOk({ challenges: response });
}
