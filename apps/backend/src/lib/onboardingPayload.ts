import { eq, desc } from "drizzle-orm";
import { getDb, userGoals, userHealthProfiles, trainingPreferences, bodyMetrics } from "@tfit/database";
import type { OnboardingPayload } from "@tfit/types";

/**
 * Reassembles the normalized onboarding tables back into the OnboardingPayload
 * shape the AI pipeline and fitness-engine expect. Returns null if the user
 * hasn't completed onboarding yet (any required row missing).
 */
export async function loadOnboardingPayload(userId: string): Promise<OnboardingPayload | null> {
  const db = getDb();

  const [goals, health, training, latestMetric] = await Promise.all([
    db.query.userGoals.findMany({ where: eq(userGoals.userId, userId) }),
    db.query.userHealthProfiles.findFirst({ where: eq(userHealthProfiles.userId, userId) }),
    db.query.trainingPreferences.findFirst({ where: eq(trainingPreferences.userId, userId) }),
    db.query.bodyMetrics.findFirst({
      where: eq(bodyMetrics.userId, userId),
      orderBy: [desc(bodyMetrics.recordedAt)],
    }),
  ]);

  if (!health || !training || !latestMetric || goals.length === 0) return null;
  if (latestMetric.weightKg === null || latestMetric.heightCm === null || latestMetric.age === null) return null;

  return {
    weightKg: Number(latestMetric.weightKg),
    heightCm: Number(latestMetric.heightCm),
    age: latestMetric.age,
    goals: goals.map((g) => g.goal),
    health: {
      hasHeartConditions: health.hasHeartConditions,
      hasHighBloodPressure: health.hasHighBloodPressure,
      hasDiabetes: health.hasDiabetes,
      hasJointProblems: health.hasJointProblems,
      hasSpineProblems: health.hasSpineProblems,
      hasRecentInjuriesOrSurgeries: health.hasRecentInjuriesOrSurgeries,
      hasRespiratoryProblems: health.hasRespiratoryProblems,
      hasPainDuringExercise: health.hasPainDuringExercise,
      otherLimitations: health.otherLimitations ?? undefined,
    },
    daysPerWeek: training.daysPerWeek,
    minutesPerSession: training.minutesPerSession,
    experienceLevel: training.experienceLevel,
    equipmentPreference: training.equipmentPreference,
  };
}
