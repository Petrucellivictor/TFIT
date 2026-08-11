import { getDb } from "../client";
import { exerciseLibrary } from "../schema/exerciseLibrary";
import { EXERCISE_SEED } from "./exercises";

async function main() {
  const db = getDb();

  for (const exercise of EXERCISE_SEED) {
    await db.insert(exerciseLibrary).values(exercise).onConflictDoNothing({ target: exerciseLibrary.slug });
  }

  console.log(`Seeded ${EXERCISE_SEED.length} exercises (skipping ones that already exist by slug).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
