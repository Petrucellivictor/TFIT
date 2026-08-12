import { z } from "zod";

const manualExerciseSchema = z.object({
  exerciseId: z.string().uuid(),
  order: z.number().int().min(1),
  sets: z.number().int().min(1).max(10),
  repsMin: z.number().int().min(1).max(50),
  repsMax: z.number().int().min(1).max(50),
  restSeconds: z.number().int().min(0).max(600),
  notes: z.string().trim().max(280).optional(),
});

const manualWorkoutSchema = z.object({
  name: z.string().trim().min(1).max(80),
  dayOfWeek: z.number().int().min(1).max(7),
  exercises: z.array(manualExerciseSchema).min(1).max(20),
});

export const createManualPlanSchema = z.object({
  splitName: z.string().trim().min(1).max(80),
  workouts: z.array(manualWorkoutSchema).min(1).max(7),
});

export type CreateManualPlanInput = z.infer<typeof createManualPlanSchema>;

export const sharePlanInputSchema = z.object({
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/),
});
