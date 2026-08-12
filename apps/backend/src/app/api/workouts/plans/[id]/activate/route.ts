import { eq } from "drizzle-orm";
import { getDb, workoutPlans } from "@tfit/database";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { userOwnsPlan } from "@/lib/workoutPlans";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  if (!(await userOwnsPlan(result.user.id, id))) return errors.notFound("Plano não encontrado.");

  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.update(workoutPlans).set({ status: "archived" }).where(eq(workoutPlans.userId, result.user.id));
    await tx.update(workoutPlans).set({ status: "active" }).where(eq(workoutPlans.id, id));
  });

  return jsonOk({ activated: true });
}
