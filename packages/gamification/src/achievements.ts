export interface UserGamificationStats {
  workoutsCompleted: number;
  currentStreakDays: number;
  personalRecordsCount: number;
  challengesCompleted: number;
}

export type AchievementCriteriaType =
  | "workouts_completed"
  | "streak_days"
  | "personal_records"
  | "challenges_completed";

export interface AchievementDefinition {
  id: string;
  criteriaType: string;
  criteriaValue: number;
}

const STAT_BY_CRITERIA: Record<AchievementCriteriaType, keyof UserGamificationStats> = {
  workouts_completed: "workoutsCompleted",
  streak_days: "currentStreakDays",
  personal_records: "personalRecordsCount",
  challenges_completed: "challengesCompleted",
};

/**
 * Returns the IDs of achievements whose criteria `stats` now satisfies,
 * excluding ones already unlocked. Unknown criteria types are skipped
 * rather than thrown on, so a future achievement type doesn't break
 * evaluation of the ones this version of the code understands.
 */
export function findNewlyUnlockedAchievements(
  stats: UserGamificationStats,
  achievements: AchievementDefinition[],
  alreadyUnlockedIds: Set<string>,
): string[] {
  return achievements
    .filter((a) => !alreadyUnlockedIds.has(a.id))
    .filter((a) => {
      const statKey = STAT_BY_CRITERIA[a.criteriaType as AchievementCriteriaType];
      if (!statKey) return false;
      return stats[statKey] >= a.criteriaValue;
    })
    .map((a) => a.id);
}
