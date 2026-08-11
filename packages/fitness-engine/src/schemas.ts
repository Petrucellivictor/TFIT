import { z } from "zod";
import type { MuscleGroup } from "./types";
import { LIMITS } from "./constants";

/** Single source of truth for the MuscleGroup literal union — keep in sync with types.ts. */
export const muscleGroupSchema = z.enum([
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "abs",
  "forearms",
  "full_body",
  "cardio",
]) satisfies z.ZodType<MuscleGroup>;

/** Matches ExercisePrescription in types.ts — used to validate agent output before it reaches reviewWorkoutPlan. */
export const exercisePrescriptionSchema = z.object({
  exerciseId: z.string(),
  order: z.number().int().min(1),
  sets: z.number().int().min(LIMITS.setsPerExercise.min).max(LIMITS.setsPerExercise.max),
  repsMin: z.number().int().min(LIMITS.repsPerSet.min).max(LIMITS.repsPerSet.max),
  repsMax: z.number().int().min(LIMITS.repsPerSet.min).max(LIMITS.repsPerSet.max),
  restSeconds: z.number().int().min(LIMITS.restSeconds.min).max(LIMITS.restSeconds.max),
  notes: z.string().optional(),
});

/** Matches WorkoutDraft in types.ts. */
export const workoutDraftSchema = z.object({
  name: z.string(),
  dayOfWeek: z.number().int().min(1).max(7),
  exercises: z.array(exercisePrescriptionSchema).min(1),
});
