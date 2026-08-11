import { z } from "zod";

export const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(24)
  .regex(/^[a-z0-9_]+$/, "Use only lowercase letters, numbers, and underscores");

export const updateProfileSchema = z.object({
  handle: handleSchema.optional(),
  displayName: z.string().trim().min(1).max(60).optional(),
  bio: z.string().trim().max(280).optional(),
  isPrivate: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
