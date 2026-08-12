import { desc, eq } from "drizzle-orm";
import { getDb, workoutPlans, workouts, workoutExercises, profiles } from "@tfit/database";
import { createManualPlanSchema } from "@tfit/validation";
import type { WorkoutPlanSummary } from "@tfit/types";
import { errors, jsonError, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { reviewManualPlan } from "@/lib/workoutPlans";

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const rows = await db
    .select({ plan: workoutPlans, sharedBy: profiles })
    .from(workoutPlans)
    .leftJoin(profiles, eq(workoutPlans.sharedByUserId, profiles.userId))
    .where(eq(workoutPlans.userId, result.user.id))
    .orderBy(desc(workoutPlans.createdAt));

  const summaries: WorkoutPlanSummary[] = rows.map(({ plan, sharedBy }) => ({
    id: plan.id,
    splitName: plan.splitName,
    daysPerWeek: plan.daysPerWeek,
    status: plan.status,
    source: plan.source,
    sharedByHandle: sharedBy?.handle ?? null,
    createdAt: plan.createdAt.toISOString(),
  }));

  return jsonOk({ plans: summaries });
}

export async function POST(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const parsed = createManualPlanSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  const review = await reviewManualPlan(result.user.id, parsed.data);
  if (review === null) return errors.validation("Complete seu onboarding antes de criar um treino.");
  if (review.blocked.length > 0) {
    return jsonError("plan_invalid", review.blocked[0]!.message, 422);
  }

  const db = getDb();
  const planId = await db.transaction(async (tx) => {
    const [plan] = await tx
      .insert(workoutPlans)
      .values({
        userId: result.user.id,
        splitName: parsed.data.splitName,
        daysPerWeek: parsed.data.workouts.length,
        status: "archived",
        source: "manual",
        reasoning: null,
      })
      .returning({ id: workoutPlans.id });

    for (const workout of parsed.data.workouts) {
      const [createdWorkout] = await tx
        .insert(workouts)
        .values({ planId: plan!.id, name: workout.name, dayOfWeek: workout.dayOfWeek })
        .returning({ id: workouts.id });

      await tx.insert(workoutExercises).values(
        workout.exercises.map((exercise) => ({
          workoutId: createdWorkout!.id,
          exerciseId: exercise.exerciseId,
          order: exercise.order,
          sets: exercise.sets,
          repsMin: exercise.repsMin,
          repsMax: exercise.repsMax,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes,
        })),
      );
    }

    return plan!.id;
  });

  return jsonOk({ planId, warnings: review.warnings }, 201);
}
