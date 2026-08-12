import type { UUID, ISODateTime } from "./common";

export interface WorkoutExerciseDetail {
  id: UUID;
  order: number;
  sets: number;
  repsMin: number;
  repsMax: number;
  restSeconds: number;
  notes: string | null;
  exercise: {
    id: UUID;
    slug: string;
    name: string;
    primaryMuscle: string;
    equipment: string;
    instructions: string;
  };
}

export interface WorkoutDetail {
  id: UUID;
  name: string;
  dayOfWeek: number;
  exercises: WorkoutExerciseDetail[];
}

export type WorkoutPlanSource = "ai_generated" | "manual" | "copied" | "shared";

export interface WorkoutPlanDetail {
  id: UUID;
  splitName: string;
  daysPerWeek: number;
  status: "active" | "archived";
  reasoning: string | null;
  source: WorkoutPlanSource;
  sharedByHandle: string | null;
  createdAt: ISODateTime;
  workouts: WorkoutDetail[];
}

export interface WorkoutPlanSummary {
  id: UUID;
  splitName: string;
  daysPerWeek: number;
  status: "active" | "archived";
  source: WorkoutPlanSource;
  sharedByHandle: string | null;
  createdAt: ISODateTime;
}

export type SetFeedback = "easy" | "adequate" | "hard" | "very_hard";

export interface WorkoutSession {
  id: UUID;
  userId: UUID;
  workoutId: UUID;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: ISODateTime;
  completedAt: ISODateTime | null;
}

export interface LogSetInput {
  workoutExerciseId: UUID;
  setNumber: number;
  repsCompleted: number;
  weightKg?: number;
  feedback?: SetFeedback;
}
