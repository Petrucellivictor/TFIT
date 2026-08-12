import { describe, expect, it } from "vitest";
import { onboardingPayloadSchema } from "./onboarding";

const validHealth = {
  hasHeartConditions: false,
  hasHighBloodPressure: false,
  hasDiabetes: false,
  hasJointProblems: false,
  hasSpineProblems: false,
  hasRecentInjuriesOrSurgeries: false,
  hasRespiratoryProblems: false,
  hasPainDuringExercise: false,
};

const validPayload = {
  weightKg: 75,
  heightCm: 175,
  age: 30,
  goals: ["gain_muscle"],
  health: validHealth,
  daysPerWeek: 4,
  minutesPerSession: 60,
  experienceLevel: "under_6_months",
  equipmentPreference: "balanced",
};

describe("onboardingPayloadSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(onboardingPayloadSchema.safeParse(validPayload).success).toBe(true);
  });

  it("requires at least one goal", () => {
    expect(onboardingPayloadSchema.safeParse({ ...validPayload, goals: [] }).success).toBe(false);
  });

  it("rejects more than 3 goals", () => {
    expect(
      onboardingPayloadSchema.safeParse({
        ...validPayload,
        goals: ["lose_weight", "gain_muscle", "gain_strength", "improve_conditioning"],
      }).success,
    ).toBe(false);
  });

  it("rejects an unknown goal value", () => {
    expect(onboardingPayloadSchema.safeParse({ ...validPayload, goals: ["become_immortal"] }).success).toBe(false);
  });

  it("rejects age outside 13-100", () => {
    expect(onboardingPayloadSchema.safeParse({ ...validPayload, age: 12 }).success).toBe(false);
    expect(onboardingPayloadSchema.safeParse({ ...validPayload, age: 101 }).success).toBe(false);
  });

  it("rejects daysPerWeek outside 1-7", () => {
    expect(onboardingPayloadSchema.safeParse({ ...validPayload, daysPerWeek: 0 }).success).toBe(false);
    expect(onboardingPayloadSchema.safeParse({ ...validPayload, daysPerWeek: 8 }).success).toBe(false);
  });

  it("requires every health field to be a boolean, none optional", () => {
    const { hasHeartConditions: _drop, ...incompleteHealth } = validHealth;
    expect(onboardingPayloadSchema.safeParse({ ...validPayload, health: incompleteHealth }).success).toBe(false);
  });

  it("allows otherLimitations to be omitted but caps it at 500 chars", () => {
    expect(onboardingPayloadSchema.safeParse(validPayload).success).toBe(true);
    expect(
      onboardingPayloadSchema.safeParse({
        ...validPayload,
        health: { ...validHealth, otherLimitations: "a".repeat(501) },
      }).success,
    ).toBe(false);
  });

  it("rejects an unrecognized experienceLevel or equipmentPreference", () => {
    expect(onboardingPayloadSchema.safeParse({ ...validPayload, experienceLevel: "expert" }).success).toBe(false);
    expect(onboardingPayloadSchema.safeParse({ ...validPayload, equipmentPreference: "bodyweight" }).success).toBe(false);
  });
});
