import { describe, expect, it } from "vitest";
import { recordActivity, type StreakState } from "./streaks";

const BASE: StreakState = { currentStreak: 0, longestStreak: 0, lastActivityDate: null, freezesAvailable: 1 };

describe("recordActivity", () => {
  it("starts a streak on first-ever activity", () => {
    const { state, event } = recordActivity(BASE, "2026-01-01");
    expect(event).toBe("started");
    expect(state.currentStreak).toBe(1);
    expect(state.longestStreak).toBe(1);
  });

  it("is a no-op when activity is recorded twice on the same day", () => {
    const first = recordActivity(BASE, "2026-01-01").state;
    const { state, event } = recordActivity(first, "2026-01-01");
    expect(event).toBe("already_recorded");
    expect(state.currentStreak).toBe(1);
  });

  it("continues the streak on a consecutive day", () => {
    const day1 = recordActivity(BASE, "2026-01-01").state;
    const { state, event } = recordActivity(day1, "2026-01-02");
    expect(event).toBe("continued");
    expect(state.currentStreak).toBe(2);
  });

  it("uses a freeze to bridge exactly one missed day", () => {
    const day1 = recordActivity(BASE, "2026-01-01").state;
    const { state, event } = recordActivity(day1, "2026-01-03");
    expect(event).toBe("continued_with_freeze");
    expect(state.currentStreak).toBe(2);
    expect(state.freezesAvailable).toBe(0);
  });

  it("resets the streak when missing a day with no freeze available", () => {
    const noFreeze: StreakState = { ...BASE, freezesAvailable: 0 };
    const day1 = recordActivity(noFreeze, "2026-01-01").state;
    const { state, event } = recordActivity(day1, "2026-01-03");
    expect(event).toBe("reset");
    expect(state.currentStreak).toBe(1);
  });

  it("resets the streak when missing more than one day even with a freeze available", () => {
    const day1 = recordActivity(BASE, "2026-01-01").state;
    const { state, event } = recordActivity(day1, "2026-01-05");
    expect(event).toBe("reset");
    expect(state.currentStreak).toBe(1);
    expect(state.freezesAvailable).toBe(1);
  });

  it("earns back a freeze every 7th consecutive day, capped at 2", () => {
    let state: StreakState = { ...BASE, freezesAvailable: 0 };
    const dates = [
      "2026-01-01",
      "2026-01-02",
      "2026-01-03",
      "2026-01-04",
      "2026-01-05",
      "2026-01-06",
      "2026-01-07",
    ];
    for (const date of dates) {
      state = recordActivity(state, date).state;
    }
    expect(state.currentStreak).toBe(7);
    expect(state.freezesAvailable).toBe(1);
  });

  it("preserves the longest streak even after a reset", () => {
    const day1 = recordActivity(BASE, "2026-01-01").state;
    const day2 = recordActivity(day1, "2026-01-02").state;
    const { state } = recordActivity(day2, "2026-02-01");
    expect(state.currentStreak).toBe(1);
    expect(state.longestStreak).toBe(2);
  });
});
