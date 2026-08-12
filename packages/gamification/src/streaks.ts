/**
 * Streak recovery mechanic (master spec §20: "recuperação de streak sem
 * incentivar excesso de treinamento"). A single missed day doesn't reset
 * the streak if a freeze is available; freezes are earned back by
 * sustaining a streak (every 7th consecutive day), not by training harder
 * or more often — the reward is for consistency, not volume.
 */

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // YYYY-MM-DD
  freezesAvailable: number;
}

export type StreakEvent = "already_recorded" | "started" | "continued" | "continued_with_freeze" | "reset";

export interface StreakUpdateResult {
  state: StreakState;
  event: StreakEvent;
}

const MAX_FREEZES = 2;
const FREEZE_EARNED_EVERY_DAYS = 7;

function daysBetween(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00Z`).getTime();
  const to = new Date(`${toISO}T00:00:00Z`).getTime();
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export function recordActivity(state: StreakState, todayISO: string): StreakUpdateResult {
  if (state.lastActivityDate === todayISO) {
    return { state, event: "already_recorded" };
  }

  if (state.lastActivityDate === null) {
    return {
      state: { ...state, currentStreak: 1, longestStreak: Math.max(state.longestStreak, 1), lastActivityDate: todayISO },
      event: "started",
    };
  }

  const gap = daysBetween(state.lastActivityDate, todayISO);

  if (gap === 1 || (gap === 2 && state.freezesAvailable > 0)) {
    const newStreak = state.currentStreak + 1;
    const earnsFreeze = newStreak % FREEZE_EARNED_EVERY_DAYS === 0;
    const freezesAvailable = gap === 2 ? state.freezesAvailable - 1 : state.freezesAvailable;

    return {
      state: {
        currentStreak: newStreak,
        longestStreak: Math.max(state.longestStreak, newStreak),
        lastActivityDate: todayISO,
        freezesAvailable: Math.min(MAX_FREEZES, earnsFreeze ? freezesAvailable + 1 : freezesAvailable),
      },
      event: gap === 2 ? "continued_with_freeze" : "continued",
    };
  }

  return {
    state: { ...state, currentStreak: 1, lastActivityDate: todayISO },
    event: "reset",
  };
}
