import { inArray } from "drizzle-orm";
import { getDb, exerciseLibrary } from "@tfit/database";
import { activeContraindicationTags, type HealthConstraints, type MuscleGroup } from "@tfit/fitness-engine";
import type { CandidateExercise } from "./agents/exerciseSelector";

const LEVEL_CEILING: Record<string, string[]> = {
  beginner: ["beginner"],
  intermediate: ["beginner", "intermediate"],
  advanced: ["beginner", "intermediate", "advanced"],
};

/**
 * First safety layer: contraindicated and above-level exercises are never
 * even offered as candidates. The rules engine (layer two) and Safety Agent
 * (layer three, qualitative) still re-check the final plan independently.
 */
export async function fetchCandidateExercises(
  targetMuscles: MuscleGroup[],
  health: HealthConstraints,
  userLevel: "beginner" | "intermediate" | "advanced",
): Promise<CandidateExercise[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(exerciseLibrary)
    .where(inArray(exerciseLibrary.primaryMuscle, targetMuscles));

  const badTags = new Set(activeContraindicationTags(health));
  const allowedLevels = new Set(LEVEL_CEILING[userLevel]);

  return rows
    .filter((r) => !r.contraindicationTags.some((tag) => badTags.has(tag)))
    .filter((r) => allowedLevels.has(r.level))
    .map((r) => ({
      id: r.id,
      name: r.name,
      primaryMuscle: r.primaryMuscle,
      secondaryMuscles: r.secondaryMuscles,
      equipment: r.equipment,
      level: r.level,
    }));
}
