import type { UUID } from "./common";

export interface ExerciseAnimation {
  url: string;
  format: string;
}

export interface ExerciseDetail {
  id: UUID;
  slug: string;
  name: string;
  description: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  level: string;
  instructions: string;
  commonMistakes: string | null;
  contraindicationTags: string[];
  animation: ExerciseAnimation | null;
}
