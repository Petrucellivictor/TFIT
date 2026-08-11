import type { UUID, ISODateTime } from "./common";

export interface DailyCheckin {
  id: UUID;
  date: string;
  energyLevel: number;
  sleepQuality: number;
  disposition: number;
  recoveryPerception: number;
  hasPain: boolean;
  painNotes: string | null;
}

export interface CheckinInput {
  energyLevel: number;
  sleepQuality: number;
  disposition: number;
  recoveryPerception: number;
  hasPain: boolean;
  painNotes?: string;
}

export interface Measurement {
  id: UUID;
  waistCm: number | null;
  chestCm: number | null;
  hipCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  calfCm: number | null;
  shoulderCm: number | null;
  recordedAt: ISODateTime;
}

export type MeasurementInput = Omit<Measurement, "id" | "recordedAt">;

export type GoalType = "weight_target" | "measurement_target" | "exercise_pr" | "custom";
export type GoalStatus = "active" | "achieved" | "abandoned";

export interface Goal {
  id: UUID;
  title: string;
  goalType: GoalType;
  targetValue: number | null;
  exerciseId: UUID | null;
  exerciseName: string | null;
  targetDate: string | null;
  status: GoalStatus;
  createdAt: ISODateTime;
  achievedAt: ISODateTime | null;
}

export interface CreateGoalInput {
  title: string;
  goalType: GoalType;
  targetValue?: number;
  exerciseId?: UUID;
  targetDate?: string;
}

export interface FitScore {
  overall: number;
  consistency: number;
  training: number;
  evolution: number;
  habits: number;
  recovery: number;
}

export interface WeightTrendPoint {
  weightKg: number;
  recordedAt: ISODateTime;
}

export interface ProgressResponse {
  fitScore: FitScore;
  weightTrend: WeightTrendPoint[];
  recentPersonalRecords: {
    exerciseName: string;
    weightKg: number;
    reps: number;
    achievedAt: ISODateTime;
  }[];
  activeGoals: Goal[];
  currentStreakDays: number;
}
