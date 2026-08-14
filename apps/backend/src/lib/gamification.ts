import { and, eq, gte, sql } from "drizzle-orm";
import {
  getDb,
  xpTransactions,
  streaks,
  achievements,
  userAchievements,
  challenges,
  challengeParticipants,
  workoutSessions,
  personalRecords,
  type Achievement,
} from "@tfit/database";
import {
  XP_AWARDS,
  MAX_XP_PER_DAY,
  recordActivity,
  findNewlyUnlockedAchievements,
  getLevelProgress,
  type XpReason,
  type StreakState,
  type StreakEvent,
} from "@tfit/gamification";
import type { LevelUpInfo } from "@tfit/types";
import { notifyUser } from "./social";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface XpAwardResult {
  amount: number;
  leveledUp: boolean;
  newLevel: LevelUpInfo | null;
}

const NO_AWARD: XpAwardResult = { amount: 0, leveledUp: false, newLevel: null };

/**
 * Awards XP for a specific event, deduped by (userId, reason, referenceId)
 * at the database level (docs/DATABASE.md) and capped per day as a backstop
 * (packages/gamification MAX_XP_PER_DAY). Best-effort: gamification must
 * never break the primary action it's attached to.
 */
export async function awardXp(userId: string, reason: XpReason, referenceId: string): Promise<XpAwardResult> {
  try {
    const db = getDb();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [{ total }] = await db
      .select({ total: sql<number>`coalesce(sum(${xpTransactions.amount}), 0)::int` })
      .from(xpTransactions)
      .where(and(eq(xpTransactions.userId, userId), gte(xpTransactions.createdAt, startOfDay)));

    const amount = Math.max(0, Math.min(XP_AWARDS[reason], MAX_XP_PER_DAY - total));
    if (amount === 0) return NO_AWARD;

    const [{ totalXp: totalBefore }] = await db
      .select({ totalXp: sql<number>`coalesce(sum(${xpTransactions.amount}), 0)::int` })
      .from(xpTransactions)
      .where(eq(xpTransactions.userId, userId));

    const [inserted] = await db
      .insert(xpTransactions)
      .values({ userId, reason, referenceId, amount })
      .onConflictDoNothing({ target: [xpTransactions.userId, xpTransactions.reason, xpTransactions.referenceId] })
      .returning();

    if (!inserted) return NO_AWARD;

    const levelBefore = getLevelProgress(totalBefore).level;
    const progressAfter = getLevelProgress(totalBefore + amount);
    const leveledUp = progressAfter.level > levelBefore;

    return { amount, leveledUp, newLevel: leveledUp ? { level: progressAfter.level, name: progressAfter.name } : null };
  } catch (error) {
    console.error("awardXp failed", { userId, reason, referenceId, error });
    return NO_AWARD;
  }
}

export async function recordStreakActivity(userId: string): Promise<{ event: StreakEvent; currentStreak: number }> {
  try {
    const db = getDb();
    const existing = await db.query.streaks.findFirst({ where: eq(streaks.userId, userId) });

    const current: StreakState = existing
      ? {
          currentStreak: existing.currentStreak,
          longestStreak: existing.longestStreak,
          lastActivityDate: existing.lastActivityDate,
          freezesAvailable: existing.freezesAvailable,
        }
      : { currentStreak: 0, longestStreak: 0, lastActivityDate: null, freezesAvailable: 1 };

    const { state, event } = recordActivity(current, todayISO());

    await db
      .insert(streaks)
      .values({ userId, ...state, updatedAt: new Date() })
      .onConflictDoUpdate({ target: streaks.userId, set: { ...state, updatedAt: new Date() } });

    return { event, currentStreak: state.currentStreak };
  } catch (error) {
    console.error("recordStreakActivity failed", { userId, error });
    return { event: "already_recorded", currentStreak: 0 };
  }
}

type ChallengeProgressMode = { kind: "increment"; by: number } | { kind: "set"; value: number };

export async function updateChallengeProgress(
  userId: string,
  type: "workouts_count" | "streak_days",
  mode: ChallengeProgressMode,
): Promise<void> {
  try {
    const db = getDb();
    const today = todayISO();

    const activeParticipations = await db
      .select({ participant: challengeParticipants, challenge: challenges })
      .from(challengeParticipants)
      .innerJoin(challenges, eq(challengeParticipants.challengeId, challenges.id))
      .where(
        and(
          eq(challengeParticipants.userId, userId),
          eq(challengeParticipants.status, "active"),
          eq(challenges.type, type),
        ),
      );

    for (const { participant, challenge } of activeParticipations) {
      if (today < challenge.startDate || today > challenge.endDate) continue;

      const newValue = mode.kind === "increment" ? participant.progressValue + mode.by : mode.value;
      const completed = newValue >= challenge.targetValue;

      await db
        .update(challengeParticipants)
        .set({
          progressValue: newValue,
          status: completed ? "completed" : "active",
          completedAt: completed ? new Date() : null,
        })
        .where(eq(challengeParticipants.id, participant.id));

      if (completed) {
        await awardXp(userId, "challenge_completed", participant.id);
      }
    }
  } catch (error) {
    console.error("updateChallengeProgress failed", { userId, type, error });
  }
}

export async function checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
  try {
    const db = getDb();

    const [workoutsCompletedRows, streakRow, personalRecordsRows, challengesCompletedRows, catalog, unlockedRows] =
      await Promise.all([
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(workoutSessions)
          .where(and(eq(workoutSessions.userId, userId), eq(workoutSessions.status, "completed"))),
        db.query.streaks.findFirst({ where: eq(streaks.userId, userId) }),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(personalRecords)
          .where(eq(personalRecords.userId, userId)),
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(challengeParticipants)
          .where(and(eq(challengeParticipants.userId, userId), eq(challengeParticipants.status, "completed"))),
        db.select().from(achievements),
        db.select({ achievementId: userAchievements.achievementId }).from(userAchievements).where(eq(userAchievements.userId, userId)),
      ]);

    const stats = {
      workoutsCompleted: workoutsCompletedRows[0]?.count ?? 0,
      currentStreakDays: streakRow?.currentStreak ?? 0,
      personalRecordsCount: personalRecordsRows[0]?.count ?? 0,
      challengesCompleted: challengesCompletedRows[0]?.count ?? 0,
    };

    const alreadyUnlocked = new Set(unlockedRows.map((r) => r.achievementId));
    const newlyUnlockedIds = findNewlyUnlockedAchievements(stats, catalog, alreadyUnlocked);

    const byId = new Map(catalog.map((a) => [a.id, a]));

    if (newlyUnlockedIds.length > 0) {
      await db
        .insert(userAchievements)
        .values(newlyUnlockedIds.map((achievementId) => ({ userId, achievementId })))
        .onConflictDoNothing({ target: [userAchievements.userId, userAchievements.achievementId] });

      await Promise.all(
        newlyUnlockedIds.map((id) =>
          notifyUser(userId, "achievement_unlocked", { referenceId: id, message: byId.get(id)?.name }),
        ),
      );
    }

    return newlyUnlockedIds.map((id) => byId.get(id)!).filter(Boolean);
  } catch (error) {
    console.error("checkAndUnlockAchievements failed", { userId, error });
    return [];
  }
}
