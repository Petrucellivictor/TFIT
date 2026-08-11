import { describe, expect, it } from "vitest";
import { reviewWorkoutPlan } from "./reviewWorkoutPlan";
import type { ExerciseMeta, HealthConstraints, TrainingContext, WorkoutPlanDraft } from "./types";

const NO_HEALTH_FLAGS: HealthConstraints = {
  hasHeartConditions: false,
  hasHighBloodPressure: false,
  hasDiabetes: false,
  hasJointProblems: false,
  hasSpineProblems: false,
  hasRecentInjuriesOrSurgeries: false,
  hasRespiratoryProblems: false,
  hasPainDuringExercise: false,
};

const CONTEXT: TrainingContext = {
  daysPerWeek: 1,
  minutesPerSession: 45,
  experienceLevel: "one_to_two_years",
};

function exercise(overrides: Partial<ExerciseMeta> & { id: string }): ExerciseMeta {
  return {
    name: overrides.id,
    primaryMuscle: "chest",
    secondaryMuscles: [],
    equipment: "barbell",
    level: "intermediate",
    contraindicationTags: [],
    ...overrides,
  };
}

function planWith(exercisesInWorkout: WorkoutPlanDraft["workouts"][number]["exercises"]): WorkoutPlanDraft {
  return {
    splitName: "Full body",
    daysPerWeek: 1,
    workouts: [{ name: "Treino A", dayOfWeek: 1, exercises: exercisesInWorkout }],
  };
}

describe("reviewWorkoutPlan", () => {
  it("approves a well-formed plan within safe bounds", () => {
    const exercises = new Map([["bench-press", exercise({ id: "bench-press" })]]);
    const plan = planWith([
      { exerciseId: "bench-press", order: 1, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 90 },
    ]);

    const verdict = reviewWorkoutPlan({ plan, exercises, health: NO_HEALTH_FLAGS, context: CONTEXT });

    expect(verdict.approved).toBe(true);
  });

  it("blocks an exercise that is not in the library", () => {
    const exercises = new Map<string, ExerciseMeta>();
    const plan = planWith([
      { exerciseId: "invented-exercise", order: 1, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
    ]);

    const verdict = reviewWorkoutPlan({ plan, exercises, health: NO_HEALTH_FLAGS, context: CONTEXT });

    expect(verdict.approved).toBe(false);
    expect(verdict.violations.map((v) => v.code)).toContain("unknown_exercise");
  });

  it("blocks an exercise contraindicated by a reported health condition", () => {
    const exercises = new Map([
      ["box-jump", exercise({ id: "box-jump", contraindicationTags: ["high-joint-impact"] })],
    ]);
    const plan = planWith([
      { exerciseId: "box-jump", order: 1, sets: 3, repsMin: 8, repsMax: 12, restSeconds: 60 },
    ]);
    const health: HealthConstraints = { ...NO_HEALTH_FLAGS, hasJointProblems: true };

    const verdict = reviewWorkoutPlan({ plan, exercises, health, context: CONTEXT });

    expect(verdict.approved).toBe(false);
    expect(verdict.violations.map((v) => v.code)).toContain("contraindicated_exercise");
  });

  it("blocks a plan whose weekly volume for one muscle group exceeds the safety ceiling", () => {
    const exercises = new Map([["bench-press", exercise({ id: "bench-press" })]]);
    const plan = planWith(
      Array.from({ length: 8 }, (_, i) => ({
        exerciseId: "bench-press",
        order: i + 1,
        sets: 4,
        repsMin: 8,
        repsMax: 12,
        restSeconds: 90,
      })),
    );

    const verdict = reviewWorkoutPlan({ plan, exercises, health: NO_HEALTH_FLAGS, context: CONTEXT });

    expect(verdict.approved).toBe(false);
    expect(verdict.violations.map((v) => v.code)).toContain("excessive_weekly_volume");
  });

  it("flags out-of-range set/rep/rest values without silently clamping them", () => {
    const exercises = new Map([["bench-press", exercise({ id: "bench-press" })]]);
    const plan = planWith([
      { exerciseId: "bench-press", order: 1, sets: 20, repsMin: 8, repsMax: 12, restSeconds: 90 },
    ]);

    const verdict = reviewWorkoutPlan({ plan, exercises, health: NO_HEALTH_FLAGS, context: CONTEXT });

    expect(verdict.approved).toBe(false);
    expect(verdict.violations.map((v) => v.code)).toContain("invalid_prescription");
  });

  it("warns (but does not block) when reported pain suggests professional review", () => {
    const exercises = new Map([["bench-press", exercise({ id: "bench-press" })]]);
    const plan = planWith([
      { exerciseId: "bench-press", order: 1, sets: 4, repsMin: 8, repsMax: 12, restSeconds: 90 },
    ]);
    const health: HealthConstraints = { ...NO_HEALTH_FLAGS, hasPainDuringExercise: true };

    const verdict = reviewWorkoutPlan({ plan, exercises, health, context: CONTEXT });

    const flag = verdict.violations.find((v) => v.code === "recommend_professional_evaluation");
    expect(flag?.severity).toBe("warn");
    expect(verdict.approved).toBe(true);
  });
});
