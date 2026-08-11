import type { UUID, ISODateTime, UnitSystem } from "./common";
import type { FitnessGoal, ExperienceLevel, EquipmentPreference } from "./onboarding";

export interface User {
  id: UUID;
  clerkId: string;
  createdAt: ISODateTime;
}

export interface Profile {
  userId: UUID;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
}

export interface UserPreferences {
  userId: UUID;
  unitSystem: UnitSystem;
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
}

export interface UserGoal {
  id: UUID;
  userId: UUID;
  goal: FitnessGoal;
  createdAt: ISODateTime;
}

export interface UserHealthProfile {
  userId: UUID;
  hasHeartConditions: boolean;
  hasHighBloodPressure: boolean;
  hasDiabetes: boolean;
  hasJointProblems: boolean;
  hasSpineProblems: boolean;
  hasRecentInjuriesOrSurgeries: boolean;
  hasRespiratoryProblems: boolean;
  hasPainDuringExercise: boolean;
  otherLimitations: string | null;
  updatedAt: ISODateTime;
}

export interface BodyMetric {
  id: UUID;
  userId: UUID;
  weightKg: number | null;
  heightCm: number | null;
  bodyFatPercent: number | null;
  age: number | null;
  recordedAt: ISODateTime;
}

export interface MeResponse {
  user: User;
  profile: Profile;
  preferences: UserPreferences;
  goals: UserGoal[];
  onboardingCompleted: boolean;
  experienceLevel: ExperienceLevel | null;
  equipmentPreference: EquipmentPreference | null;
}
