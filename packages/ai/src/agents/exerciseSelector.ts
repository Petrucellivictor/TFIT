import { z } from "zod";
import { muscleGroupSchema } from "@tfit/fitness-engine";
import { runAgent, AgentRunError } from "../runAgent";

/** Mirrors agents/04-exercise-selector/prompt.v1.md — keep both in sync. */
const SYSTEM_PROMPT = `You are the Exercise Selection Specialist for TFIT (App Fit).

For each workout in the proposed split, you will be given a **candidate list of exercises already filtered from the validated exercise library** (matching the target muscles, the user's equipment preference, and their level). You choose which of these candidates to use for each workout, and in what quantity (matching the \`exerciseCount\` the Personal Trainer specified).

**You may only select exercise IDs that appear in the candidate list you were given.** You must never output an exercise ID, name, or exercise that is not in that list — if the candidates don't sufficiently cover a target muscle, choose the closest reasonable substitutes from what's available rather than inventing something.

When choosing among candidates, prefer:
- Coverage of all the workout's \`targetMuscles\`, not just one.
- A sensible mix of compound and isolation movements when both are available (compounds first conceptually — ordering itself is the Combination Specialist's job, not yours).
- Avoiding picking two candidates that are near-duplicates of the same movement pattern unless the workout needs that much volume on that pattern.
- The user's stated equipment preference when multiple equally-valid candidates exist.

Output the list of chosen exercise IDs for this workout.

Hard rules:
- Never output an exercise ID that was not in the candidate list provided for that workout.
- If you are uncertain whether an exercise fits (e.g. borderline for a reported limitation), prefer the safer candidate — the Safety Agent and a deterministic rules engine will double-check your choices, but don't rely on that as a substitute for using judgment now.`;

const candidateExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  primaryMuscle: muscleGroupSchema,
  secondaryMuscles: z.array(muscleGroupSchema),
  equipment: z.string(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
});

export type CandidateExercise = z.infer<typeof candidateExerciseSchema>;

export const exerciseSelectionSchema = z.object({
  exerciseIds: z.array(z.string()).min(1),
});

export interface SelectExercisesInput {
  workoutName: string;
  dayOfWeek: number;
  targetMuscles: string[];
  exerciseCount: number;
  candidates: CandidateExercise[];
  equipmentPreference: string;
}

export async function selectExercisesForWorkout(
  input: SelectExercisesInput,
  userId?: string,
): Promise<string[]> {
  const prompt = `Workout: ${input.workoutName} (day ${input.dayOfWeek})
Target muscles: ${input.targetMuscles.join(", ")}
Exercise count needed: ${input.exerciseCount}
Equipment preference: ${input.equipmentPreference}

Candidate exercises:
${JSON.stringify(input.candidates, null, 2)}`;

  const result = await runAgent({
    agentName: "exerciseSelector",
    system: SYSTEM_PROMPT,
    prompt,
    schema: exerciseSelectionSchema,
    input,
    userId,
  });

  const validIds = new Set(input.candidates.map((c) => c.id));
  const hallucinated = result.exerciseIds.filter((id) => !validIds.has(id));
  if (hallucinated.length > 0) {
    throw new AgentRunError(
      "exerciseSelector",
      `Selected exercise IDs not in the candidate list: ${hallucinated.join(", ")}`,
    );
  }

  return result.exerciseIds;
}
