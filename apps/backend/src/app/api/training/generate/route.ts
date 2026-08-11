import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb, users, workoutPlans, workouts, workoutExercises } from "@tfit/database";
import { generateWorkoutPlan } from "@tfit/ai";
import { ACCOUNT_PROVISIONING_MESSAGE, errors, jsonError, jsonOk } from "@/lib/http";
import { loadOnboardingPayload } from "@/lib/onboardingPayload";
import { isRateLimited } from "@/lib/rateLimit";
import { buildPlanDetail } from "@/lib/workoutPlanDetail";

const MAX_GENERATIONS_PER_HOUR = 5;

export async function POST() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return errors.unauthorized();

  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return errors.notFound(ACCOUNT_PROVISIONING_MESSAGE);

  if (await isRateLimited(user.id, "fitnessAssessor", MAX_GENERATIONS_PER_HOUR)) {
    return jsonError(
      "rate_limited",
      "Você atingiu o limite de gerações de treino por hora. Tente novamente mais tarde.",
      429,
    );
  }

  const onboarding = await loadOnboardingPayload(user.id);
  if (!onboarding) {
    return errors.validation("Complete seu onboarding antes de gerar um treino.");
  }

  const result = await generateWorkoutPlan(onboarding, user.id);

  if (result.status === "failed") {
    return jsonError("generation_failed", result.reason, 422);
  }

  const planId = await db.transaction(async (tx) => {
    await tx
      .update(workoutPlans)
      .set({ status: "archived" })
      .where(eq(workoutPlans.userId, user.id));

    const [plan] = await tx
      .insert(workoutPlans)
      .values({
        userId: user.id,
        splitName: result.plan.splitName,
        daysPerWeek: result.plan.daysPerWeek,
        status: "active",
        reasoning: result.splitReasoning,
      })
      .returning({ id: workoutPlans.id });

    for (const workout of result.plan.workouts) {
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

  const detail = await buildPlanDetail(planId);
  return jsonOk({
    plan: detail,
    safety: result.safetyVerdict,
    review: result.reviewerVerdict,
  });
}
