import { and, eq } from "drizzle-orm";
import { getDb } from "../client";
import { exerciseLibrary } from "../schema/exerciseLibrary";
import { achievements } from "../schema/achievements";
import { challenges } from "../schema/challenges";
import { EXERCISE_SEED } from "./exercises";
import { ACHIEVEMENT_SEED } from "./achievements";
import { buildChallengeSeed } from "./challenges";

async function main() {
  const db = getDb();

  for (const exercise of EXERCISE_SEED) {
    await db.insert(exerciseLibrary).values(exercise).onConflictDoNothing({ target: exerciseLibrary.slug });
  }
  console.log(`Seeded ${EXERCISE_SEED.length} exercises (skipping ones that already exist by slug).`);

  for (const achievement of ACHIEVEMENT_SEED) {
    await db.insert(achievements).values(achievement).onConflictDoNothing({ target: achievements.slug });
  }
  console.log(`Seeded ${ACHIEVEMENT_SEED.length} achievements (skipping ones that already exist by slug).`);

  const challengeSeed = buildChallengeSeed(new Date());
  let insertedChallenges = 0;
  for (const challenge of challengeSeed) {
    const existing = await db.query.challenges.findFirst({
      where: and(eq(challenges.title, challenge.title), eq(challenges.startDate, challenge.startDate)),
    });
    if (!existing) {
      await db.insert(challenges).values(challenge);
      insertedChallenges++;
    }
  }
  console.log(`Seeded ${insertedChallenges} of ${challengeSeed.length} challenges (skipping ones already active for this period).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
