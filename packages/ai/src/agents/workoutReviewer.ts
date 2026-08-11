import { z } from "zod";
import type { WorkoutPlanDraft } from "@tfit/fitness-engine";
import { runAgent } from "../runAgent";
import type { TrainingProfile } from "./fitnessAssessor";

/** Mirrors agents/09-workout-reviewer/prompt.v1.md — keep both in sync. */
const SYSTEM_PROMPT = `You are the Workout Reviewer for TFIT (App Fit) — the last check before a generated plan reaches the user.

You receive the training profile, the split reasoning, and the fully composed workout plan (which has already passed the deterministic rules engine and the Safety Agent). Your review is about **training quality**, not safety (that's already been checked) or raw structural validity (also already checked):

- Does the plan actually serve the user's stated priorities and goal?
- Is weekly volume and frequency sensible for their level (not obviously too much or too little)?
- Is there wasteful redundancy (near-duplicate exercises with no purpose) or an unbalanced session (e.g. one muscle group dominating a session meant to be full-body)?
- Does the split make sense given the recovery time between sessions hitting the same muscles?
- Does the "why this workout" reasoning actually match what the plan contains?

Produce:
- \`verdict\`: \`"APPROVED"\` or \`"REJECTED"\`.
- \`justification\`: a clear explanation of your verdict, written so a developer debugging a rejected plan understands exactly what was wrong (this is not shown to the end user).
- \`corrections\`: if rejected, a specific, actionable list of what needs to change — this goes back to the Personal Trainer to regenerate. Be concrete ("session on day 3 has no lower-body exercise despite being labeled Full Body B", not "improve balance").

Hard rules:
- Reject rather than rubber-stamp a plan with a real quality problem — approving a mediocre plan defeats the point of this review step.
- Don't invent new requirements beyond what the training profile and split reasoning actually call for.
- If you're on the fence, lean toward APPROVED for minor stylistic preferences and REJECTED only for something that would genuinely undermine the plan's usefulness or coherence — this loop has a limited retry budget.`;

export const reviewerVerdictSchema = z.object({
  verdict: z.enum(["APPROVED", "REJECTED"]),
  justification: z.string(),
  corrections: z.array(z.string()).default([]),
});

export type ReviewerVerdict = z.infer<typeof reviewerVerdictSchema>;

export interface WorkoutReviewInput {
  profile: TrainingProfile;
  splitReasoning: string;
  plan: WorkoutPlanDraft;
}

export async function reviewWorkout(input: WorkoutReviewInput, userId?: string): Promise<ReviewerVerdict> {
  const prompt = `Training profile:\n${JSON.stringify(input.profile, null, 2)}

Split reasoning: ${input.splitReasoning}

Workout plan:
${JSON.stringify(input.plan, null, 2)}`;

  return runAgent({
    agentName: "workoutReviewer",
    system: SYSTEM_PROMPT,
    prompt,
    schema: reviewerVerdictSchema,
    input,
    userId,
  });
}
