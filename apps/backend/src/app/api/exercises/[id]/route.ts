import { eq } from "drizzle-orm";
import { getDb, exerciseLibrary, exerciseAnimations } from "@tfit/database";
import type { ExerciseDetail } from "@tfit/types";
import { errors, jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { id } = await params;
  const db = getDb();

  const exercise = await db.query.exerciseLibrary.findFirst({ where: eq(exerciseLibrary.id, id) });
  if (!exercise) return errors.notFound("Exercício não encontrado.");

  const animation = await db.query.exerciseAnimations.findFirst({ where: eq(exerciseAnimations.exerciseId, id) });

  const detail: ExerciseDetail = {
    id: exercise.id,
    slug: exercise.slug,
    name: exercise.name,
    description: exercise.description,
    primaryMuscle: exercise.primaryMuscle,
    secondaryMuscles: exercise.secondaryMuscles,
    equipment: exercise.equipment,
    level: exercise.level,
    instructions: exercise.instructions,
    commonMistakes: exercise.commonMistakes,
    contraindicationTags: exercise.contraindicationTags,
    animation: animation ? { url: animation.animationUrl, format: animation.format } : null,
  };

  return jsonOk({ exercise: detail });
}
