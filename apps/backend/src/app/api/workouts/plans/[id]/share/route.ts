import { eq } from "drizzle-orm";
import { getDb, profiles } from "@tfit/database";
import { sharePlanInputSchema } from "@tfit/validation";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";
import { copyPlanForUser, userOwnsPlan } from "@/lib/workoutPlans";

/**
 * Instant-copy sharing: there's no friends/notifications system yet
 * (Phase 5), so "sending" a workout to someone means looking them up by
 * exact @handle and copying the plan straight into their library
 * (archived, not activated — they choose when to use it).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const parsed = sharePlanInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation("Informe um nome de usuário válido.");

  if (!(await userOwnsPlan(result.user.id, id))) return errors.notFound("Plano não encontrado.");

  const db = getDb();
  const recipient = await db.query.profiles.findFirst({ where: eq(profiles.handle, parsed.data.handle) });
  if (!recipient) return errors.notFound("Não encontramos esse usuário.");
  if (recipient.userId === result.user.id) return errors.validation("Você não pode enviar um treino para si mesmo.");

  const copy = await copyPlanForUser({
    sourcePlanId: id,
    ownerUserId: recipient.userId,
    source: "shared",
    sharedByUserId: result.user.id,
  });
  if (!copy) return errors.notFound("Plano não encontrado.");

  return jsonOk({ sentTo: recipient.handle }, 201);
}
