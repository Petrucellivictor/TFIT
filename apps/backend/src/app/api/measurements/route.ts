import { desc, eq } from "drizzle-orm";
import { getDb, measurements } from "@tfit/database";
import { measurementInputSchema } from "@tfit/validation";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

function toDbNumeric(value: number | undefined) {
  return value === undefined ? undefined : value.toString();
}

export async function GET() {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const db = getDb();
  const rows = await db
    .select()
    .from(measurements)
    .where(eq(measurements.userId, result.user.id))
    .orderBy(desc(measurements.recordedAt))
    .limit(50);

  return jsonOk({ measurements: rows });
}

export async function POST(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const parsed = measurementInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return errors.validation(parsed.error.issues[0]?.message ?? "Dados inválidos.");

  if (Object.keys(parsed.data).length === 0) {
    return errors.validation("Informe pelo menos uma medida.");
  }

  const db = getDb();
  const [measurement] = await db
    .insert(measurements)
    .values({
      userId: result.user.id,
      waistCm: toDbNumeric(parsed.data.waistCm),
      chestCm: toDbNumeric(parsed.data.chestCm),
      hipCm: toDbNumeric(parsed.data.hipCm),
      armCm: toDbNumeric(parsed.data.armCm),
      thighCm: toDbNumeric(parsed.data.thighCm),
      calfCm: toDbNumeric(parsed.data.calfCm),
      shoulderCm: toDbNumeric(parsed.data.shoulderCm),
    })
    .returning();

  return jsonOk({ measurement }, 201);
}
