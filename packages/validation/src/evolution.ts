import { z } from "zod";

export const checkinInputSchema = z.object({
  energyLevel: z.number().int().min(1).max(5),
  sleepQuality: z.number().int().min(1).max(5),
  disposition: z.number().int().min(1).max(5),
  recoveryPerception: z.number().int().min(1).max(5),
  hasPain: z.boolean(),
  painNotes: z.string().trim().max(500).optional(),
});

export const measurementInputSchema = z.object({
  waistCm: z.number().min(20).max(300).optional(),
  chestCm: z.number().min(20).max(300).optional(),
  hipCm: z.number().min(20).max(300).optional(),
  armCm: z.number().min(5).max(100).optional(),
  thighCm: z.number().min(10).max(150).optional(),
  calfCm: z.number().min(10).max(100).optional(),
  shoulderCm: z.number().min(20).max(300).optional(),
});

export const bodyMetricInputSchema = z.object({
  weightKg: z.number().min(20).max(400),
  bodyFatPercent: z.number().min(1).max(70).optional(),
});

export const createGoalInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  goalType: z.enum(["weight_target", "measurement_target", "exercise_pr", "custom"]),
  targetValue: z.number().optional(),
  exerciseId: z.string().uuid().optional(),
  targetDate: z.string().date().optional(),
});

export const updateGoalInputSchema = z.object({
  status: z.enum(["active", "achieved", "abandoned"]),
});
