import { describe, expect, it } from "vitest";
import { createManualPlanSchema, sharePlanInputSchema } from "./workoutPlans";

const validExercise = {
  exerciseId: "00000000-0000-0000-0000-000000000000",
  order: 1,
  sets: 3,
  repsMin: 8,
  repsMax: 12,
  restSeconds: 60,
};

const validWorkout = { name: "Treino A", dayOfWeek: 1, exercises: [validExercise] };
const validPlan = { splitName: "ABC", workouts: [validWorkout] };

describe("createManualPlanSchema", () => {
  it("accepts a minimal valid plan", () => {
    expect(createManualPlanSchema.safeParse(validPlan).success).toBe(true);
  });

  it("rejects a plan with no workouts", () => {
    expect(createManualPlanSchema.safeParse({ ...validPlan, workouts: [] }).success).toBe(false);
  });

  it("rejects more than 7 workouts", () => {
    const workouts = Array.from({ length: 8 }, (_, i) => ({ ...validWorkout, dayOfWeek: (i % 7) + 1 }));
    expect(createManualPlanSchema.safeParse({ ...validPlan, workouts }).success).toBe(false);
  });

  it("rejects a workout with no exercises", () => {
    expect(createManualPlanSchema.safeParse({ ...validPlan, workouts: [{ ...validWorkout, exercises: [] }] }).success).toBe(false);
  });

  it("rejects more than 20 exercises in a single workout", () => {
    const exercises = Array.from({ length: 21 }, (_, i) => ({ ...validExercise, order: i + 1 }));
    expect(createManualPlanSchema.safeParse({ ...validPlan, workouts: [{ ...validWorkout, exercises }] }).success).toBe(false);
  });

  it("rejects dayOfWeek outside 1-7", () => {
    expect(createManualPlanSchema.safeParse({ ...validPlan, workouts: [{ ...validWorkout, dayOfWeek: 0 }] }).success).toBe(false);
    expect(createManualPlanSchema.safeParse({ ...validPlan, workouts: [{ ...validWorkout, dayOfWeek: 8 }] }).success).toBe(false);
  });

  it("rejects a non-UUID exerciseId", () => {
    expect(
      createManualPlanSchema.safeParse({
        ...validPlan,
        workouts: [{ ...validWorkout, exercises: [{ ...validExercise, exerciseId: "not-a-uuid" }] }],
      }).success,
    ).toBe(false);
  });

  it("rejects sets outside 1-10", () => {
    expect(
      createManualPlanSchema.safeParse({
        ...validPlan,
        workouts: [{ ...validWorkout, exercises: [{ ...validExercise, sets: 0 }] }],
      }).success,
    ).toBe(false);
    expect(
      createManualPlanSchema.safeParse({
        ...validPlan,
        workouts: [{ ...validWorkout, exercises: [{ ...validExercise, sets: 11 }] }],
      }).success,
    ).toBe(false);
  });

  it("rejects restSeconds above 600", () => {
    expect(
      createManualPlanSchema.safeParse({
        ...validPlan,
        workouts: [{ ...validWorkout, exercises: [{ ...validExercise, restSeconds: 601 }] }],
      }).success,
    ).toBe(false);
  });
});

describe("sharePlanInputSchema", () => {
  it("accepts and normalizes a valid handle", () => {
    const result = sharePlanInputSchema.safeParse({ handle: "  Amigo_1  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.handle).toBe("amigo_1");
  });

  it("rejects an invalid handle", () => {
    expect(sharePlanInputSchema.safeParse({ handle: "a" }).success).toBe(false);
  });
});
