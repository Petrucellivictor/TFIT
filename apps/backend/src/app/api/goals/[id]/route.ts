import { and, eq } from "drizzle-orm";
import { getDb, smartGoals } from "@tfit/database";
import { updateGoalInputSchema } from "@tfit/validation";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { awardXp } from "@/lib/gamification";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const parsed = updateGoalInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation("Status inválido.");

  const db = getDb();
  const existing = await db.query.smartGoals.findFirst({
    where: and(eq(smartGoals.id, id), eq(smartGoals.userId, result.user.id)),
  });
  if (!existing) return errors.notFound("Meta não encontrada.");

  const [goal] = await db
    .update(smartGoals)
    .set({
      status: parsed.data.status,
      achievedAt: parsed.data.status === "achieved" ? new Date() : existing.achievedAt,
    })
    .where(eq(smartGoals.id, id))
    .returning();

  let xpAwarded = 0;
  if (parsed.data.status === "achieved" && existing.status !== "achieved") {
    xpAwarded = (await awardXp(result.user.id, "goal_achieved", id)).amount;
  }

  return jsonOk({ goal, gamification: { xpAwarded } });
}
