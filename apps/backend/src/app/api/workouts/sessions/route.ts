import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { getDb, users, workouts, workoutPlans, workoutSessions } from "@tfit/database";
import { ACCOUNT_PROVISIONING_MESSAGE, errors, jsonOk } from "@/lib/http";
import { buildPlanDetail } from "@/lib/workoutPlanDetail";

const startSessionSchema = z.object({ workoutId: z.string().uuid() });

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return errors.unauthorized();

  const parsed = startSessionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation("workoutId inválido.");

  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
  if (!user) return errors.notFound(ACCOUNT_PROVISIONING_MESSAGE);

  // A workout only belongs to the user via its plan — verify ownership through that join.
  const workout = await db.query.workouts.findFirst({ where: eq(workouts.id, parsed.data.workoutId) });
  if (!workout) return errors.notFound("Treino não encontrado.");
  const plan = await db.query.workoutPlans.findFirst({
    where: and(eq(workoutPlans.id, workout.planId), eq(workoutPlans.userId, user.id)),
  });
  if (!plan) return errors.notFound("Treino não encontrado.");

  const [session] = await db
    .insert(workoutSessions)
    .values({ userId: user.id, workoutId: workout.id })
    .returning();

  const planDetail = await buildPlanDetail(plan.id);
  const workoutDetail = planDetail?.workouts.find((w) => w.id === workout.id) ?? null;

  return jsonOk({ session, workout: workoutDetail }, 201);
}
