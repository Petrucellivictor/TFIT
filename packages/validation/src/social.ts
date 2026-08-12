import { z } from "zod";

export const createPostSchema = z.object({
  type: z.enum(["photo", "workout", "achievement", "personal_record", "streak", "text"]),
  caption: z.string().trim().max(500).optional(),
  visibility: z.enum(["public", "followers", "friends", "private"]),
  mediaUrls: z.array(z.string().url()).max(4).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreatePostFormInput = z.infer<typeof createPostSchema>;

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(500),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const createReportSchema = z.object({
  targetType: z.enum(["post", "comment", "user"]),
  targetId: z.string().uuid(),
  reason: z.string().trim().min(1).max(120),
  details: z.string().trim().max(1000).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
