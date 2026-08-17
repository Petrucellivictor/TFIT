import { and, desc, eq, gte } from "drizzle-orm";
import {
  getDb,
  workoutSessions,
  workoutPlans,
  dailyCheckins,
  personalRecords,
  bodyMetrics,
  smartGoals,
  exerciseLibrary,
  streaks,
} from "@tfit/database";
import { computeFitScore } from "@tfit/fitness-engine";
import type { ProgressResponse } from "@tfit/types";
import { jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;
  const userId = result.user.id;

  const db = getDb();
  const now = new Date();
  const fourWeeksAgo = new Date(now.getTime() - 28 * DAY_MS);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * DAY_MS);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * DAY_MS);

  const [activePlan, completedSessions, checkins, recentPrRows, weightRows, goalRows, streakRow] = await Promise.all([
    db.query.workoutPlans.findFirst({
      where: and(eq(workoutPlans.userId, userId), eq(workoutPlans.status, "active")),
    }),
    db
      .select()
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(workoutSessions.status, "completed"),
          gte(workoutSessions.startedAt, fourWeeksAgo),
        ),
      ),
    db.select().from(dailyCheckins).where(and(eq(dailyCheckins.userId, userId), gte(dailyCheckins.date, thirtyDaysAgoStr()))),
    db
      .select({ record: personalRecords, exerciseName: exerciseLibrary.name })
      .from(personalRecords)
      .leftJoin(exerciseLibrary, eq(personalRecords.exerciseId, exerciseLibrary.id))
      .where(and(eq(personalRecords.userId, userId), gte(personalRecords.achievedAt, ninetyDaysAgo)))
      .orderBy(desc(personalRecords.achievedAt)),
    db
      .select()
      .from(bodyMetrics)
      .where(eq(bodyMetrics.userId, userId))
      .orderBy(desc(bodyMetrics.recordedAt))
      .limit(30),
    db
      .select({ goal: smartGoals, exerciseName: exerciseLibrary.name })
      .from(smartGoals)
      .leftJoin(exerciseLibrary, eq(smartGoals.exerciseId, exerciseLibrary.id))
      .where(and(eq(smartGoals.userId, userId), eq(smartGoals.status, "active")))
      .orderBy(desc(smartGoals.createdAt)),
    db.query.streaks.findFirst({ where: eq(streaks.userId, userId) }),
  ]);

  const recentCheckins = checkins.filter((c) => new Date(c.date) >= fourteenDaysAgo);
  const avgRecovery =
    recentCheckins.length > 0
      ? recentCheckins.reduce((sum, c) => sum + c.recoveryPerception, 0) / recentCheckins.length
      : null;

  const fitScore = computeFitScore({
    completedSessionsLast4Weeks: completedSessions.length,
    plannedSessionsLast4Weeks: activePlan ? activePlan.daysPerWeek * 4 : 0,
    checkinsLast30Days: checkins.length,
    avgRecoveryPerceptionLast14Days: avgRecovery,
    newPersonalRecordsLast90Days: recentPrRows.length,
  });

  const response: ProgressResponse = {
    fitScore,
    weightTrend: weightRows
      .filter((w) => w.weightKg !== null)
      .reverse()
      .map((w) => ({ weightKg: Number(w.weightKg), recordedAt: w.recordedAt.toISOString() })),
    recentPersonalRecords: recentPrRows.slice(0, 5).map(({ record, exerciseName }) => ({
      exerciseName: exerciseName ?? "Exercício",
      weightKg: Number(record.weightKg),
      reps: record.reps,
      achievedAt: record.achievedAt.toISOString(),
    })),
    activeGoals: goalRows.map(({ goal, exerciseName }) => ({
      id: goal.id,
      title: goal.title,
      goalType: goal.goalType,
      targetValue: goal.targetValue ? Number(goal.targetValue) : null,
      exerciseId: goal.exerciseId,
      exerciseName: exerciseName ?? null,
      targetDate: goal.targetDate,
      status: goal.status,
      createdAt: goal.createdAt.toISOString(),
      achievedAt: goal.achievedAt?.toISOString() ?? null,
    })),
    // Same persisted streak shown on the home screen (freeze-aware, advances on
    // check-in OR workout completion) — previously recomputed a separate,
    // check-in-only value here, which could disagree with home and confuse users.
    currentStreakDays: streakRow?.currentStreak ?? 0,
  };

  return jsonOk(response);
}

function thirtyDaysAgoStr(): string {
  return new Date(Date.now() - 30 * DAY_MS).toISOString().slice(0, 10);
}
