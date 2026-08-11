import { LIMITS } from "./constants";
import { activeContraindicationTags, requiresProfessionalReview } from "./contraindications";
import type {
  ExerciseMeta,
  HealthConstraints,
  RuleViolation,
  TrainingContext,
  WorkoutPlanDraft,
} from "./types";
import type { RuleEngineVerdict } from "./types";

export interface ReviewWorkoutPlanInput {
  plan: WorkoutPlanDraft;
  exercises: Map<string, ExerciseMeta>;
  health: HealthConstraints;
  context: TrainingContext;
}

export function reviewWorkoutPlan({ plan, exercises, health, context }: ReviewWorkoutPlanInput): RuleEngineVerdict {
  const violations: RuleViolation[] = [];
  const contraindicated = new Set(activeContraindicationTags(health));
  const weeklySetsByMuscle = new Map<string, number>();

  if (plan.workouts.length !== context.daysPerWeek) {
    violations.push({
      code: "days_per_week_mismatch",
      severity: "warn",
      message: `Plan has ${plan.workouts.length} workouts but the user asked for ${context.daysPerWeek} days/week.`,
    });
  }

  for (const workout of plan.workouts) {
    if (
      workout.exercises.length < LIMITS.exercisesPerWorkout.min ||
      workout.exercises.length > LIMITS.exercisesPerWorkout.max
    ) {
      violations.push({
        code: "exercise_count_out_of_range",
        severity: "warn",
        message: `"${workout.name}" has ${workout.exercises.length} exercises (expected ${LIMITS.exercisesPerWorkout.min}-${LIMITS.exercisesPerWorkout.max}).`,
      });
    }

    let estimatedSeconds = 0;

    for (const prescription of workout.exercises) {
      const meta = exercises.get(prescription.exerciseId);

      if (!meta) {
        violations.push({
          code: "unknown_exercise",
          severity: "block",
          message: `Exercise ${prescription.exerciseId} is not in the exercise library.`,
          exerciseId: prescription.exerciseId,
        });
        continue;
      }

      if (
        prescription.sets < LIMITS.setsPerExercise.min ||
        prescription.sets > LIMITS.setsPerExercise.max ||
        prescription.repsMin < LIMITS.repsPerSet.min ||
        prescription.repsMax > LIMITS.repsPerSet.max ||
        prescription.repsMin > prescription.repsMax ||
        prescription.restSeconds < LIMITS.restSeconds.min ||
        prescription.restSeconds > LIMITS.restSeconds.max
      ) {
        violations.push({
          code: "invalid_prescription",
          severity: "block",
          message: `${meta.name}: sets/reps/rest are outside safe bounds.`,
          exerciseId: prescription.exerciseId,
        });
      }

      const exerciseTags = meta.contraindicationTags;
      const hit = exerciseTags.find((tag) => contraindicated.has(tag));
      if (hit) {
        violations.push({
          code: "contraindicated_exercise",
          severity: "block",
          message: `${meta.name} is contraindicated (${hit}) given the user's reported health conditions.`,
          exerciseId: prescription.exerciseId,
        });
      }

      const setsForVolume = prescription.sets;
      weeklySetsByMuscle.set(meta.primaryMuscle, (weeklySetsByMuscle.get(meta.primaryMuscle) ?? 0) + setsForVolume);
      for (const secondary of meta.secondaryMuscles) {
        weeklySetsByMuscle.set(secondary, (weeklySetsByMuscle.get(secondary) ?? 0) + setsForVolume * 0.5);
      }

      const avgReps = (prescription.repsMin + prescription.repsMax) / 2;
      estimatedSeconds +=
        prescription.sets * (avgReps * LIMITS.secondsPerRepEstimate + prescription.restSeconds);
    }

    const estimatedMinutes = estimatedSeconds / 60;
    const target = context.minutesPerSession;
    const tolerance = target * LIMITS.sessionDurationTolerance;
    if (Math.abs(estimatedMinutes - target) > tolerance) {
      violations.push({
        code: "session_duration_mismatch",
        severity: "warn",
        message: `"${workout.name}" is estimated at ~${Math.round(estimatedMinutes)} min vs. the requested ${target} min.`,
      });
    }
  }

  for (const [muscle, sets] of weeklySetsByMuscle) {
    if (sets > LIMITS.weeklySetsPerMuscleGroupMax) {
      violations.push({
        code: "excessive_weekly_volume",
        severity: "block",
        message: `${muscle}: ${sets} weekly sets exceeds the ${LIMITS.weeklySetsPerMuscleGroupMax}-set safety ceiling.`,
      });
    }
  }

  if (requiresProfessionalReview(health)) {
    violations.push({
      code: "recommend_professional_evaluation",
      severity: "warn",
      message: "User reported pain or a recent injury/surgery — recommend evaluation by a health professional.",
    });
  }

  return {
    approved: violations.every((v) => v.severity !== "block"),
    violations,
  };
}
