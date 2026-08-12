import { describe, expect, it } from "vitest";
import { handleSchema, updateProfileSchema } from "./profile";

describe("handleSchema", () => {
  it("accepts a valid lowercase handle", () => {
    expect(handleSchema.safeParse("joao_silva1").success).toBe(true);
  });

  it("lowercases and trims a mixed-case handle with surrounding whitespace", () => {
    const result = handleSchema.safeParse("  Joao_Silva1  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("joao_silva1");
  });

  it("rejects a handle shorter than 3 characters", () => {
    expect(handleSchema.safeParse("ab").success).toBe(false);
  });

  it("rejects a handle longer than 24 characters", () => {
    expect(handleSchema.safeParse("a".repeat(25)).success).toBe(false);
  });

  it("rejects characters outside lowercase letters, digits, and underscore", () => {
    expect(handleSchema.safeParse("joao-silva").success).toBe(false);
    expect(handleSchema.safeParse("joao.silva").success).toBe(false);
    expect(handleSchema.safeParse("joao silva").success).toBe(false);
    expect(handleSchema.safeParse("joão").success).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  it("accepts an empty object (every field optional)", () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
  });

  it("accepts a partial update with just displayName", () => {
    expect(updateProfileSchema.safeParse({ displayName: "João" }).success).toBe(true);
  });

  it("rejects a bio over 280 characters", () => {
    expect(updateProfileSchema.safeParse({ bio: "a".repeat(281) }).success).toBe(false);
  });

  it("rejects an empty displayName", () => {
    expect(updateProfileSchema.safeParse({ displayName: "" }).success).toBe(false);
  });

  it("rejects an invalid handle even when other fields are valid", () => {
    expect(updateProfileSchema.safeParse({ displayName: "João", handle: "a" }).success).toBe(false);
  });
});
