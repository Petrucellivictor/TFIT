import { describe, expect, it } from "vitest";
import { computeFitScore } from "./fitScore";

describe("computeFitScore", () => {
  it("gives a perfect score across the board for a fully engaged user", () => {
    const result = computeFitScore({
      completedSessionsLast4Weeks: 12,
      plannedSessionsLast4Weeks: 12,
      checkinsLast30Days: 30,
      avgRecoveryPerceptionLast14Days: 5,
      newPersonalRecordsLast90Days: 3,
    });

    expect(result).toEqual({ overall: 100, consistency: 100, training: 100, evolution: 100, habits: 100, recovery: 100 });
  });

  it("gives a zero score for a completely inactive user with no plan", () => {
    const result = computeFitScore({
      completedSessionsLast4Weeks: 0,
      plannedSessionsLast4Weeks: 0,
      checkinsLast30Days: 0,
      avgRecoveryPerceptionLast14Days: null,
      newPersonalRecordsLast90Days: 0,
    });

    // recovery defaults to neutral (50) when nothing has been logged, not zero.
    expect(result.consistency).toBe(0);
    expect(result.training).toBe(0);
    expect(result.evolution).toBe(0);
    expect(result.habits).toBe(0);
    expect(result.recovery).toBe(50);
    expect(result.overall).toBe(10);
  });

  it("never exceeds 100 even when a user overachieves the baseline", () => {
    const result = computeFitScore({
      completedSessionsLast4Weeks: 20,
      plannedSessionsLast4Weeks: 12,
      checkinsLast30Days: 45,
      avgRecoveryPerceptionLast14Days: 5,
      newPersonalRecordsLast90Days: 10,
    });

    expect(result.consistency).toBe(100);
    expect(result.training).toBe(100);
    expect(result.evolution).toBe(100);
    expect(result.habits).toBe(100);
  });

  it("maps a neutral recovery perception (3 of 5) to a mid-range recovery score", () => {
    const result = computeFitScore({
      completedSessionsLast4Weeks: 0,
      plannedSessionsLast4Weeks: 0,
      checkinsLast30Days: 0,
      avgRecoveryPerceptionLast14Days: 3,
      newPersonalRecordsLast90Days: 0,
    });

    expect(result.recovery).toBe(50);
  });
});
