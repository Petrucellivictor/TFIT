import { desc, eq } from "drizzle-orm";
import { getDb, smartGoals, exerciseLibrary } from "@tfit/database";
import { createGoalInputSchema } from "@tfit/validation";
import type { Goal } from "@tfit/types";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const rows = await db
    .select({ goal: smartGoals, exerciseName: exerciseLibrary.name })
    .from(smartGoals)
    .leftJoin(exerciseLibrary, eq(smartGoals.exerciseId, exerciseLibrary.id))
    .where(eq(smartGoals.userId, result.user.id))
    .orderBy(desc(smartGoals.createdAt));

  const goals: Goal[] = rows.map(({ goal, exerciseName }) => ({
    id: goal.id,
    title: goal.title,
    goalType: goal.goalType,
    targetValue: goal.targetValue ? Number(goal.targetValue) : null,
    exerciseId: goal.exerciseId,
    exerciseName: exerciseName ?? null,
    targetDate: goal.targetDate,
    status: goal.status,
    createdAt: goal.createdAt.toISOString(),
    achievedAt: goal.achievedAt?.toISOString() ?? null,
  }));

  return jsonOk({ goals });
}

export async function POST(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const parsed = createGoalInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  if (parsed.data.goalType === "exercise_pr" && !parsed.data.exerciseId) {
    return errors.validation("Selecione um exercício para uma meta de recorde pessoal.");
  }

  const db = getDb();
  const [goal] = await db
    .insert(smartGoals)
    .values({
      userId: result.user.id,
      title: parsed.data.title,
      goalType: parsed.data.goalType,
      targetValue: parsed.data.targetValue?.toString(),
      exerciseId: parsed.data.exerciseId,
      targetDate: parsed.data.targetDate,
    })
    .returning();

  return jsonOk({ goal }, 201);
}
