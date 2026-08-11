import type { OnboardingPayload } from "@tfit/types";
import { reviewWorkoutPlan, type ExerciseMeta, type WorkoutPlanDraft } from "@tfit/fitness-engine";
import { getDb, exerciseLibrary } from "@tfit/database";
import { inArray } from "drizzle-orm";
import { assessFitness, type TrainingProfile } from "./agents/fitnessAssessor";
import { proposeSplit, type SplitProposal } from "./agents/personalTrainer";
import { selectExercisesForWorkout } from "./agents/exerciseSelector";
import { combineWorkouts } from "./agents/combinationSpecialist";
import { reviewSafety, type SafetyVerdict } from "./agents/safetyAgent";
import { reviewWorkout, type ReviewerVerdict } from "./agents/workoutReviewer";
import { fetchCandidateExercises } from "./exerciseCandidates";

const MAX_GENERATION_ATTEMPTS = 3;

export type GenerateWorkoutPlanResult =
  | {
      status: "approved";
      plan: WorkoutPlanDraft;
      profile: TrainingProfile;
      splitReasoning: string;
      safetyVerdict: SafetyVerdict;
      reviewerVerdict: ReviewerVerdict;
    }
  | { status: "failed"; reason: string; attempts: number };

/**
 * The Fit Orchestrator (agents/01-orchestrator) — deterministic pipeline
 * code, not an LLM call. Runs the full generation pipeline from master spec
 * §13, looping the Personal Trainer step on rejection up to
 * MAX_GENERATION_ATTEMPTS before giving up with a friendly, structured
 * failure (never a raw error to the end user — see master spec §45).
 */
export async function generateWorkoutPlan(
  onboarding: OnboardingPayload,
  userId: string,
): Promise<GenerateWorkoutPlanResult> {
  const profile = await assessFitness(onboarding, userId);

  let feedback: string[] | undefined;

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    const split = await proposeSplit(profile, userId, feedback);

    const draftOrRejection = await composeWorkouts(split, onboarding, profile, userId);
    if (draftOrRejection.status === "rejected") {
      feedback = draftOrRejection.reasons;
      continue;
    }

    const plan = draftOrRejection.plan;

    const exerciseMetaMap = await loadExerciseMeta(plan);
    const rulesVerdict = reviewWorkoutPlan({
      plan,
      exercises: exerciseMetaMap,
      health: onboarding.health,
      context: {
        daysPerWeek: onboarding.daysPerWeek,
        minutesPerSession: onboarding.minutesPerSession,
        experienceLevel: onboarding.experienceLevel,
      },
    });

    if (!rulesVerdict.approved) {
      feedback = rulesVerdict.violations.filter((v) => v.severity === "block").map((v) => v.message);
      continue;
    }

    const safetyVerdict = await reviewSafety(
      { health: onboarding.health, otherLimitations: onboarding.health.otherLimitations ?? null, plan },
      userId,
    );

    if (safetyVerdict.verdict === "blocked") {
      feedback = [`Safety Agent blocked this plan: ${safetyVerdict.rationale}`];
      continue;
    }
    if (safetyVerdict.verdict === "adapt") {
      feedback = safetyVerdict.requiredAdaptations.length > 0 ? safetyVerdict.requiredAdaptations : [safetyVerdict.rationale];
      continue;
    }

    const reviewerVerdict = await reviewWorkout(
      { profile, splitReasoning: split.reasoning, plan },
      userId,
    );

    if (reviewerVerdict.verdict === "REJECTED") {
      feedback = reviewerVerdict.corrections.length > 0 ? reviewerVerdict.corrections : [reviewerVerdict.justification];
      continue;
    }

    return {
      status: "approved",
      plan,
      profile,
      splitReasoning: split.reasoning,
      safetyVerdict,
      reviewerVerdict,
    };
  }

  return {
    status: "failed",
    reason:
      "Não conseguimos gerar um treino que passasse em todas as verificações de qualidade e segurança após várias tentativas.",
    attempts: MAX_GENERATION_ATTEMPTS,
  };
}

type ComposeResult = { status: "composed"; plan: WorkoutPlanDraft } | { status: "rejected"; reasons: string[] };

async function composeWorkouts(
  split: SplitProposal,
  onboarding: OnboardingPayload,
  profile: TrainingProfile,
  userId: string,
): Promise<ComposeResult> {
  const selections = await Promise.all(
    split.workouts.map(async (workout) => {
      const candidates = await fetchCandidateExercises(workout.targetMuscles, onboarding.health, profile.level);
      if (candidates.length === 0) {
        return { workout, exerciseIds: [] as string[], candidates };
      }
      const exerciseIds = await selectExercisesForWorkout(
        {
          workoutName: workout.name,
          dayOfWeek: workout.dayOfWeek,
          targetMuscles: workout.targetMuscles,
          exerciseCount: Math.min(workout.exerciseCount, candidates.length),
          candidates,
          equipmentPreference: onboarding.equipmentPreference,
        },
        userId,
      );
      return { workout, exerciseIds, candidates };
    }),
  );

  const empty = selections.filter((s) => s.exerciseIds.length === 0);
  if (empty.length > 0) {
    return {
      status: "rejected",
      reasons: empty.map(
        (s) => `No suitable exercises found in the library for "${s.workout.name}" (${s.workout.targetMuscles.join(", ")}).`,
      ),
    };
  }

  const combinationInput = {
    experienceLevel: profile.level,
    minutesPerSession: profile.recommendedMinutesPerSession,
    workouts: selections.map(({ workout, exerciseIds, candidates }) => ({
      name: workout.name,
      dayOfWeek: workout.dayOfWeek,
      exercises: exerciseIds.map((id) => {
        const meta = candidates.find((c) => c.id === id)!;
        return { id: meta.id, name: meta.name, primaryMuscle: meta.primaryMuscle, level: meta.level };
      }),
    })),
  };

  const combination = await combineWorkouts(combinationInput, userId);

  return {
    status: "composed",
    plan: {
      splitName: split.splitName,
      daysPerWeek: split.workouts.length,
      workouts: combination.workouts,
    },
  };
}

async function loadExerciseMeta(plan: WorkoutPlanDraft): Promise<Map<string, ExerciseMeta>> {
  const ids = [...new Set(plan.workouts.flatMap((w) => w.exercises.map((e) => e.exerciseId)))];
  if (ids.length === 0) return new Map();

  const db = getDb();
  const rows = await db.select().from(exerciseLibrary).where(inArray(exerciseLibrary.id, ids));

  return new Map(
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
}
