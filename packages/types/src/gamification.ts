import type { UUID, ISODateTime } from "./common";

export interface GamificationProfile {
  level: number;
  name: string;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
  xpToNextLevel: number | null;
  isMaxLevel: boolean;
  streak: {
    current: number;
    longest: number;
    freezesAvailable: number;
  };
}

export interface AchievementView {
  id: UUID;
  slug: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: ISODateTime | null;
}

export type StreakEvent = "already_recorded" | "started" | "continued" | "continued_with_freeze" | "reset";

export interface GamificationEventResult {
  xpAwarded: number;
  streakEvent?: StreakEvent;
  currentStreak?: number;
  newAchievements: AchievementView[];
}

export type ChallengeType = "workouts_count" | "cardio_minutes" | "streak_days" | "custom";
export type ChallengePeriod = "weekly" | "monthly" | "fixed";
export type ChallengeParticipantStatus = "active" | "completed" | "failed";

export interface ChallengeView {
  id: UUID;
  title: string;
  description: string;
  type: ChallengeType;
  targetValue: number;
  period: ChallengePeriod;
  startDate: string;
  endDate: string;
  participation: { progressValue: number; status: ChallengeParticipantStatus } | null;
}
