import { describe, expect, it } from "vitest";
import { bodyMetricInputSchema, checkinInputSchema, createGoalInputSchema, measurementInputSchema, updateGoalInputSchema } from "./evolution";

describe("checkinInputSchema", () => {
  const valid = { energyLevel: 3, sleepQuality: 4, disposition: 2, recoveryPerception: 5, hasPain: false };

  it("accepts a valid check-in", () => {
    expect(checkinInputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects scale values out of 1-5 range", () => {
    expect(checkinInputSchema.safeParse({ ...valid, energyLevel: 0 }).success).toBe(false);
    expect(checkinInputSchema.safeParse({ ...valid, energyLevel: 6 }).success).toBe(false);
  });

  it("rejects non-integer scale values", () => {
    expect(checkinInputSchema.safeParse({ ...valid, sleepQuality: 3.5 }).success).toBe(false);
  });

  it("allows painNotes to be omitted but rejects it over 500 chars", () => {
    expect(checkinInputSchema.safeParse(valid).success).toBe(true);
    expect(checkinInputSchema.safeParse({ ...valid, painNotes: "a".repeat(501) }).success).toBe(false);
  });
});

describe("measurementInputSchema", () => {
  it("accepts an empty object (every field optional)", () => {
    expect(measurementInputSchema.safeParse({}).success).toBe(true);
  });

  it("rejects a measurement below its realistic minimum", () => {
    expect(measurementInputSchema.safeParse({ waistCm: 5 }).success).toBe(false);
  });

  it("rejects a measurement above its realistic maximum", () => {
    expect(measurementInputSchema.safeParse({ armCm: 500 }).success).toBe(false);
  });
});

describe("bodyMetricInputSchema", () => {
  it("requires weightKg within 20-400", () => {
    expect(bodyMetricInputSchema.safeParse({ weightKg: 80 }).success).toBe(true);
    expect(bodyMetricInputSchema.safeParse({ weightKg: 10 }).success).toBe(false);
    expect(bodyMetricInputSchema.safeParse({ weightKg: 500 }).success).toBe(false);
  });

  it("rejects bodyFatPercent outside 1-70", () => {
    expect(bodyMetricInputSchema.safeParse({ weightKg: 80, bodyFatPercent: 0 }).success).toBe(false);
    expect(bodyMetricInputSchema.safeParse({ weightKg: 80, bodyFatPercent: 71 }).success).toBe(false);
    expect(bodyMetricInputSchema.safeParse({ weightKg: 80, bodyFatPercent: 20 }).success).toBe(true);
  });
});

describe("createGoalInputSchema", () => {
  it("accepts a minimal valid goal", () => {
    expect(createGoalInputSchema.safeParse({ title: "Perder peso", goalType: "weight_target" }).success).toBe(true);
  });

  it("rejects an unknown goalType", () => {
    expect(createGoalInputSchema.safeParse({ title: "x", goalType: "not_a_type" }).success).toBe(false);
  });

  it("rejects an empty title", () => {
    expect(createGoalInputSchema.safeParse({ title: "", goalType: "custom" }).success).toBe(false);
  });

  it("rejects a malformed targetDate", () => {
    expect(createGoalInputSchema.safeParse({ title: "x", goalType: "custom", targetDate: "not-a-date" }).success).toBe(false);
  });
});

describe("updateGoalInputSchema", () => {
  it("accepts each valid status", () => {
    for (const status of ["active", "achieved", "abandoned"]) {
      expect(updateGoalInputSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects an invalid status", () => {
    expect(updateGoalInputSchema.safeParse({ status: "completed" }).success).toBe(false);
  });
});
