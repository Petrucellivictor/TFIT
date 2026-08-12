import { eq, inArray, and } from "drizzle-orm";
import { getDb, workoutPlans, workouts, workoutExercises, exerciseLibrary } from "@tfit/database";
import { reviewWorkoutPlan, type ExerciseMeta, type RuleViolation } from "@tfit/fitness-engine";
import type { CreateManualPlanInput } from "@tfit/validation";
import { loadOnboardingPayload } from "./onboardingPayload";

/**
 * Manual plans go through the same deterministic rules engine as
 * AI-generated ones (docs/AGENTS.md's rules-engine gate), but with a
 * different failure mode: a person choosing their own exercises is making
 * an informed choice, not receiving a pushed recommendation, so structural
 * problems (invented exercise, nonsensical numbers) still hard-block, but
 * health/volume concerns are surfaced as warnings rather than rejections.
 * A shared/copied plan's warnings are re-checked against the recipient at
 * accept time for the same reason a recommendation would be.
 */
const HARD_BLOCK_CODES = new Set(["unknown_exercise", "invalid_prescription"]);

export interface PlanReviewOutcome {
  blocked: RuleViolation[];
  warnings: RuleViolation[];
}

export async function reviewManualPlan(userId: string, input: CreateManualPlanInput): Promise<PlanReviewOutcome | null> {
  const onboarding = await loadOnboardingPayload(userId);
  if (!onboarding) return null;

  const exerciseIds = [...new Set(input.workouts.flatMap((w) => w.exercises.map((e) => e.exerciseId)))];
  const db = getDb();
  const rows = exerciseIds.length > 0
    ? await db.select().from(exerciseLibrary).where(inArray(exerciseLibrary.id, exerciseIds))
    : [];
  const exerciseMap = new Map<string, ExerciseMeta>(
    rows.map((r) => [
      r.id,
      {
        id: r.id,
        name: r.name,
        primaryMuscle: r.primaryMuscle,
        secondaryMuscles: r.secondaryMuscles,
        equipment: r.equipment,
        level: r.level,
        contraindicationTags: r.contraindicationTags,
      },
    ]),
  );

  const verdict = reviewWorkoutPlan({
    plan: { splitName: input.splitName, daysPerWeek: input.workouts.length, workouts: input.workouts },
    exercises: exerciseMap,
    health: onboarding.health,
    context: {
      daysPerWeek: onboarding.daysPerWeek,
      minutesPerSession: onboarding.minutesPerSession,
      experienceLevel: onboarding.experienceLevel,
    },
  });

  return {
    blocked: verdict.violations.filter((v) => HARD_BLOCK_CODES.has(v.code)),
    warnings: verdict.violations.filter((v) => !HARD_BLOCK_CODES.has(v.code)),
  };
}

interface CopyPlanOptions {
  sourcePlanId: string;
  ownerUserId: string;
  source: "copied" | "shared";
  sharedByUserId?: string;
  activate?: boolean;
}

/** Deep-copies a plan (+ its workouts + exercise prescriptions) for a new owner. */
export async function copyPlanForUser({ sourcePlanId, ownerUserId, source, sharedByUserId, activate }: CopyPlanOptions) {
  const db = getDb();

  const sourcePlan = await db.query.workoutPlans.findFirst({ where: eq(workoutPlans.id, sourcePlanId) });
  if (!sourcePlan) return null;

  const sourceWorkouts = await db.select().from(workouts).where(eq(workouts.planId, sourcePlanId));
  const sourceWorkoutIds = sourceWorkouts.map((w) => w.id);
  const sourceExercises =
    sourceWorkoutIds.length > 0
      ? await db.select().from(workoutExercises).where(inArray(workoutExercises.workoutId, sourceWorkoutIds))
      : [];

  return db.transaction(async (tx) => {
    if (activate) {
      await tx.update(workoutPlans).set({ status: "archived" }).where(eq(workoutPlans.userId, ownerUserId));
    }

    const [newPlan] = await tx
      .insert(workoutPlans)
      .values({
        userId: ownerUserId,
        splitName: sourcePlan.splitName,
        daysPerWeek: sourcePlan.daysPerWeek,
        status: activate ? "active" : "archived",
        reasoning: sourcePlan.reasoning,
        source,
        sharedByUserId: sharedByUserId ?? null,
        sourcePlanId: sourcePlan.id,
      })
      .returning();

    for (const workout of sourceWorkouts) {
      const [newWorkout] = await tx
        .insert(workouts)
        .values({ planId: newPlan!.id, name: workout.name, dayOfWeek: workout.dayOfWeek })
        .returning();

      const exercisesForWorkout = sourceExercises.filter((e) => e.workoutId === workout.id);
      if (exercisesForWorkout.length > 0) {
        await tx.insert(workoutExercises).values(
          exercisesForWorkout.map((e) => ({
            workoutId: newWorkout!.id,
            exerciseId: e.exerciseId,
            order: e.order,
            sets: e.sets,
            repsMin: e.repsMin,
            repsMax: e.repsMax,
            restSeconds: e.restSeconds,
            notes: e.notes,
          })),
        );
      }
    }

    return newPlan!;
  });
}

export async function userOwnsPlan(userId: string, planId: string): Promise<boolean> {
  const db = getDb();
  const plan = await db.query.workoutPlans.findFirst({
    where: and(eq(workoutPlans.id, planId), eq(workoutPlans.userId, userId)),
  });
  return Boolean(plan);
}
