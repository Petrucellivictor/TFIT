import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { copyPlanForUser, userOwnsPlan } from "@/lib/workoutPlans";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  if (!(await userOwnsPlan(result.user.id, id))) return errors.notFound("Plano não encontrado.");

  const copy = await copyPlanForUser({ sourcePlanId: id, ownerUserId: result.user.id, source: "copied" });
  if (!copy) return errors.notFound("Plano não encontrado.");

  return jsonOk({ planId: copy.id }, 201);
}
