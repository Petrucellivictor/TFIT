import { describe, expect, it } from "vitest";
import { findNewlyUnlockedAchievements, type AchievementDefinition, type UserGamificationStats } from "./achievements";

const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "first-workout", criteriaType: "workouts_completed", criteriaValue: 1 },
  { id: "ten-workouts", criteriaType: "workouts_completed", criteriaValue: 10 },
  { id: "week-streak", criteriaType: "streak_days", criteriaValue: 7 },
  { id: "first-pr", criteriaType: "personal_records", criteriaValue: 1 },
];

const NO_STATS: UserGamificationStats = {
  workoutsCompleted: 0,
  currentStreakDays: 0,
  personalRecordsCount: 0,
  challengesCompleted: 0,
};

describe("findNewlyUnlockedAchievements", () => {
  it("unlocks nothing when no criteria are met", () => {
    expect(findNewlyUnlockedAchievements(NO_STATS, ACHIEVEMENTS, new Set())).toEqual([]);
  });

  it("unlocks every achievement whose threshold is met", () => {
    const stats: UserGamificationStats = { ...NO_STATS, workoutsCompleted: 12, personalRecordsCount: 1 };
    const unlocked = findNewlyUnlockedAchievements(stats, ACHIEVEMENTS, new Set());
    expect(unlocked.sort()).toEqual(["first-pr", "first-workout", "ten-workouts"].sort());
  });

  it("excludes achievements already unlocked", () => {
    const stats: UserGamificationStats = { ...NO_STATS, workoutsCompleted: 12 };
    const unlocked = findNewlyUnlockedAchievements(stats, ACHIEVEMENTS, new Set(["first-workout"]));
    expect(unlocked).toEqual(["ten-workouts"]);
  });

  it("ignores an achievement with an unrecognized criteria type instead of throwing", () => {
    const weird: AchievementDefinition = { id: "mystery", criteriaType: "does_not_exist", criteriaValue: 1 };
    expect(() => findNewlyUnlockedAchievements(NO_STATS, [weird], new Set())).not.toThrow();
    expect(findNewlyUnlockedAchievements(NO_STATS, [weird], new Set())).toEqual([]);
  });
});
