import { eq } from "drizzle-orm";
import { getDb, workoutPlans } from "@tfit/database";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { buildPlanDetail } from "@/lib/workoutPlanDetail";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const db = getDb();
  const plan = await db.query.workoutPlans.findFirst({ where: eq(workoutPlans.id, id) });
  if (!plan || plan.userId !== result.user.id) return errors.notFound("Plano não encontrado.");

  const detail = await buildPlanDetail(id);
  return jsonOk({ plan: detail });
}
