import { describe, expect, it } from "vitest";
import { createCommentSchema, createPostSchema, createReportSchema } from "./social";

describe("createPostSchema", () => {
  it("accepts a minimal text post", () => {
    expect(createPostSchema.safeParse({ type: "text", visibility: "public" }).success).toBe(true);
  });

  it("rejects an unknown post type", () => {
    expect(createPostSchema.safeParse({ type: "video", visibility: "public" }).success).toBe(false);
  });

  it("rejects an unknown visibility value", () => {
    expect(createPostSchema.safeParse({ type: "text", visibility: "everyone" }).success).toBe(false);
  });

  it("rejects a caption over 500 characters", () => {
    expect(createPostSchema.safeParse({ type: "text", visibility: "public", caption: "a".repeat(501) }).success).toBe(false);
  });

  it("rejects more than 4 media URLs", () => {
    const mediaUrls = Array.from({ length: 5 }, (_, i) => `https://example.com/${i}.jpg`);
    expect(createPostSchema.safeParse({ type: "photo", visibility: "public", mediaUrls }).success).toBe(false);
  });

  it("rejects a non-URL media entry", () => {
    expect(createPostSchema.safeParse({ type: "photo", visibility: "public", mediaUrls: ["not-a-url"] }).success).toBe(false);
  });

  it("accepts arbitrary metadata as a record", () => {
    expect(
      createPostSchema.safeParse({ type: "personal_record", visibility: "public", metadata: { exercise: "Supino", weightKg: 100 } })
        .success,
    ).toBe(true);
  });
});

describe("createCommentSchema", () => {
  it("accepts a non-empty comment", () => {
    expect(createCommentSchema.safeParse({ body: "Bom treino!" }).success).toBe(true);
  });

  it("rejects an empty comment", () => {
    expect(createCommentSchema.safeParse({ body: "" }).success).toBe(false);
  });

  it("rejects a comment over 500 characters", () => {
    expect(createCommentSchema.safeParse({ body: "a".repeat(501) }).success).toBe(false);
  });
});

describe("createReportSchema", () => {
  const validId = "00000000-0000-0000-0000-000000000000";

  it("accepts a valid report", () => {
    expect(createReportSchema.safeParse({ targetType: "post", targetId: validId, reason: "Spam" }).success).toBe(true);
  });

  it("rejects an unknown targetType", () => {
    expect(createReportSchema.safeParse({ targetType: "message", targetId: validId, reason: "Spam" }).success).toBe(false);
  });

  it("rejects a non-UUID targetId", () => {
    expect(createReportSchema.safeParse({ targetType: "post", targetId: "not-a-uuid", reason: "Spam" }).success).toBe(false);
  });

  it("rejects an empty reason", () => {
    expect(createReportSchema.safeParse({ targetType: "post", targetId: validId, reason: "" }).success).toBe(false);
  });

  it("rejects details over 1000 characters", () => {
    expect(
      createReportSchema.safeParse({ targetType: "post", targetId: validId, reason: "Spam", details: "a".repeat(1001) }).success,
    ).toBe(false);
  });
});
