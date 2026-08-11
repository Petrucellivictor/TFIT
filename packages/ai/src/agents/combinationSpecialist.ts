import { z } from "zod";
import { workoutDraftSchema } from "@tfit/fitness-engine";
import { runAgent } from "../runAgent";

/** Mirrors agents/05-combination-specialist/prompt.v1.md — keep both in sync. */
const SYSTEM_PROMPT = `You are the Workout Combination Specialist for TFIT (App Fit).

You receive the exercises selected for each workout (already chosen from the validated library) and turn them into a fully specified session: **order, sets, rep range, and rest** for each exercise.

For each workout, you are given: the chosen exercise IDs with their names/primary muscle/level, the user's experience level, and their target session duration in minutes.

Produce, for each exercise in each workout:
- \`order\`: sequencing within the session. Put larger compound/multi-joint movements before smaller isolation movements, and put movements targeting the same primary muscle as anything earlier in the session with enough separation to manage fatigue.
- \`sets\`: 2-5 for most exercises, scaled to level (beginners: fewer sets, more consistency; advanced: more volume tolerance).
- \`repsMin\` / \`repsMax\`: a sensible range for the goal implied by the exercise and split (strength-oriented: lower reps/heavier; hypertrophy-oriented: moderate reps; endurance/conditioning: higher reps).
- \`restSeconds\`: appropriate to the rep range and exercise demand (heavier/compound: longer rest; lighter/isolation: shorter).

Across the whole workout, the total estimated time (roughly: sets × (reps × ~3 seconds + rest)) should land close to the user's target session duration — adjust set counts or rest before you'd need to cut an exercise entirely.

Hard rules:
- Balance volume across the session — don't let one exercise dominate while others get a token single set, unless there's a clear reason (e.g. a primary compound lift getting more sets than an accessory).
- Never exceed roughly 25 total weekly sets for a single muscle group when you account for how this workout combines with the muscle emphasis of the other workouts in the same split (you'll be told the full week's exercise list, not just one day, for exactly this reason) — a deterministic safety check will also catch this, but aim to get it right.
- Keep prescriptions within realistic bounds: 1-6 sets per exercise, 1-30 reps, 15-300 seconds rest. A downstream rules engine hard-rejects anything outside this — there's no reason to propose it.`;

export const combinationPlanSchema = z.object({
  workouts: z.array(workoutDraftSchema).min(1),
});

export type CombinationPlan = z.infer<typeof combinationPlanSchema>;

export interface CombineWorkoutsInput {
  experienceLevel: string;
  minutesPerSession: number;
  workouts: {
    name: string;
    dayOfWeek: number;
    exercises: { id: string; name: string; primaryMuscle: string; level: string }[];
  }[];
}

export async function combineWorkouts(input: CombineWorkoutsInput, userId?: string): Promise<CombinationPlan> {
  const prompt = `Experience level: ${input.experienceLevel}
Target minutes per session: ${input.minutesPerSession}

Workouts (full week, for weekly-volume awareness):
${JSON.stringify(input.workouts, null, 2)}`;

  return runAgent({
    agentName: "combinationSpecialist",
    system: SYSTEM_PROMPT,
    prompt,
    schema: combinationPlanSchema,
    input,
    userId,
  });
}
