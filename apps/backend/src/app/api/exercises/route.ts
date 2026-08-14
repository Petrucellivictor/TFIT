import { and, eq, ilike, sql } from "drizzle-orm";
import { getDb, exerciseLibrary, exerciseAnimations, muscleGroupEnum } from "@tfit/database";
import { jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

const VALID_MUSCLES = new Set<string>(muscleGroupEnum.enumValues);

/** Powers the manual workout builder's exercise picker (master spec's "criar seus próprios treinos"). */
export async function GET(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();
  const muscle = searchParams.get("muscle");

  const db = getDb();
  const conditions = [];
  if (search) conditions.push(ilike(exerciseLibrary.name, `%${search}%`));
  if (muscle && VALID_MUSCLES.has(muscle)) {
    conditions.push(eq(exerciseLibrary.primaryMuscle, muscle as (typeof muscleGroupEnum.enumValues)[number]));
  }

  const rows = await db
    .select({
      id: exerciseLibrary.id,
      slug: exerciseLibrary.slug,
      name: exerciseLibrary.name,
      primaryMuscle: exerciseLibrary.primaryMuscle,
      equipment: exerciseLibrary.equipment,
      level: exerciseLibrary.level,
      hasAnimation: sql<boolean>`exists (select 1 from ${exerciseAnimations} where ${exerciseAnimations.exerciseId} = ${exerciseLibrary.id})`,
    })
    .from(exerciseLibrary)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(exerciseLibrary.name);

  return jsonOk({ exercises: rows });
}
