import { asc, eq, inArray } from "drizzle-orm";
import { getDb, workoutPlans, workouts, workoutExercises, exerciseLibrary, profiles } from "@tfit/database";

export interface WorkoutPlanDetail {
  id: string;
  splitName: string;
  daysPerWeek: number;
  status: "active" | "archived";
  reasoning: string | null;
  source: "ai_generated" | "manual" | "copied" | "shared";
  sharedByHandle: string | null;
  createdAt: string;
  workouts: {
    id: string;
    name: string;
    dayOfWeek: number;
    exercises: {
      id: string;
      order: number;
      sets: number;
      repsMin: number;
      repsMax: number;
      restSeconds: number;
      notes: string | null;
      exercise: {
        id: string;
        slug: string;
        name: string;
        primaryMuscle: string;
        equipment: string;
        instructions: string;
      };
    }[];
  }[];
}

export async function getActiveWorkoutPlan(userId: string): Promise<WorkoutPlanDetail | null> {
  const db = getDb();
  const plan = await db.query.workoutPlans.findFirst({
    where: (p, { and, eq: eqOp }) => and(eqOp(p.userId, userId), eqOp(p.status, "active")),
    orderBy: (p, { desc }) => [desc(p.createdAt)],
  });
  if (!plan) return null;
  return buildPlanDetail(plan.id);
}

export async function buildPlanDetail(planId: string): Promise<WorkoutPlanDetail | null> {
  const db = getDb();

  const plan = await db.query.workoutPlans.findFirst({ where: eq(workoutPlans.id, planId) });
  if (!plan) return null;

  const sharedByProfile = plan.sharedByUserId
    ? await db.query.profiles.findFirst({ where: eq(profiles.userId, plan.sharedByUserId) })
    : null;

  const workoutRows = await db
    .select()
    .from(workouts)
    .where(eq(workouts.planId, planId))
    .orderBy(asc(workouts.dayOfWeek));

  const workoutIds = workoutRows.map((w) => w.id);
  const exerciseRows =
    workoutIds.length > 0
      ? await db
          .select()
          .from(workoutExercises)
          .where(inArray(workoutExercises.workoutId, workoutIds))
          .orderBy(asc(workoutExercises.order))
      : [];

  const exerciseLibraryIds = [...new Set(exerciseRows.map((e) => e.exerciseId))];
  const libraryRows =
    exerciseLibraryIds.length > 0
      ? await db.select().from(exerciseLibrary).where(inArray(exerciseLibrary.id, exerciseLibraryIds))
      : [];
  const libraryById = new Map(libraryRows.map((r) => [r.id, r]));

  return {
    id: plan.id,
    splitName: plan.splitName,
    daysPerWeek: plan.daysPerWeek,
    status: plan.status,
    reasoning: plan.reasoning,
    source: plan.source,
    sharedByHandle: sharedByProfile?.handle ?? null,
    createdAt: plan.createdAt.toISOString(),
    workouts: workoutRows.map((w) => ({
      id: w.id,
      name: w.name,
      dayOfWeek: w.dayOfWeek,
      exercises: exerciseRows
        .filter((e) => e.workoutId === w.id)
        .map((e) => {
          const meta = libraryById.get(e.exerciseId);
          return {
            id: e.id,
            order: e.order,
            sets: e.sets,
            repsMin: e.repsMin,
            repsMax: e.repsMax,
            restSeconds: e.restSeconds,
            notes: e.notes,
            exercise: meta
              ? {
                  id: meta.id,
                  slug: meta.slug,
                  name: meta.name,
                  primaryMuscle: meta.primaryMuscle,
                  equipment: meta.equipment,
                  instructions: meta.instructions,
                }
              : {
                  id: e.exerciseId,
                  slug: "",
                  name: "Exercício indisponível",
                  primaryMuscle: "",
                  equipment: "",
                  instructions: "",
                },
          };
        }),
    })),
  };
}
