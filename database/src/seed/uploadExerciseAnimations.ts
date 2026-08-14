import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { getDb } from "../client";
import { exerciseLibrary } from "../schema/exerciseLibrary";
import { exerciseAnimations } from "../schema/exerciseAnimations";

/**
 * One-off content-population script — NOT invoked by the app at runtime.
 * Run in plain Node via `npm run upload-animations -w database -- <folder>`,
 * so it hits Vercel Blob's `put()` directly with none of the 4MB/Metro
 * constraints that shape apps/backend's post-media upload route (that
 * ceiling only applies to uploads initiated from the Expo app itself).
 *
 * Expects <folder> to contain "character-base.fbx" (the shared rigged
 * skinned mesh, uploaded once) plus one "<exercise-library-slug>.fbx" per
 * animation clip (skeleton + keyframes, no skin — see the plan for exact
 * Mixamo export settings). Re-running is safe: animation rows upsert by
 * exerciseId, and re-uploading the same slug just replaces its Blob file.
 */
const CHARACTER_FILENAME = "character-base.fbx";

async function main() {
  const folder = process.argv[2];
  if (!folder) {
    console.error("Usage: npm run upload-animations -w database -- <folder>");
    process.exit(1);
  }

  const files = readdirSync(folder).filter((name) => name.toLowerCase().endsWith(".fbx"));
  if (files.length === 0) {
    console.error(`No .fbx files found in ${folder}`);
    process.exit(1);
  }

  const db = getDb();

  if (files.includes(CHARACTER_FILENAME)) {
    const buffer = readFileSync(join(folder, CHARACTER_FILENAME));
    const blob = await put(`exercise-animations/${CHARACTER_FILENAME}`, buffer, {
      access: "public",
      contentType: "application/octet-stream",
    });
    console.log(`Base character uploaded: ${blob.url}`);
    console.log(`→ Paste this into apps/mobile/src/lib/exercise3d.ts's CHARACTER_MODEL_URL constant.\n`);
  } else {
    console.log(`No ${CHARACTER_FILENAME} found in ${folder} — skipping base character upload.\n`);
  }

  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    if (file === CHARACTER_FILENAME) continue;
    const slug = file.replace(/\.fbx$/i, "");

    const exercise = await db.query.exerciseLibrary.findFirst({ where: eq(exerciseLibrary.slug, slug) });
    if (!exercise) {
      console.warn(`Skipping "${file}" — no exercise_library row with slug "${slug}".`);
      skipped++;
      continue;
    }

    const buffer = readFileSync(join(folder, file));
    const blob = await put(`exercise-animations/${slug}.fbx`, buffer, {
      access: "public",
      contentType: "application/octet-stream",
    });

    await db
      .insert(exerciseAnimations)
      .values({ exerciseId: exercise.id, animationUrl: blob.url, format: "fbx", sourceNotes: `Uploaded from ${file}` })
      .onConflictDoUpdate({
        target: exerciseAnimations.exerciseId,
        set: { animationUrl: blob.url, format: "fbx", sourceNotes: `Uploaded from ${file}`, updatedAt: new Date() },
      });

    console.log(`✓ ${slug} -> ${blob.url}`);
    uploaded++;
  }

  console.log(`\nDone: ${uploaded} uploaded, ${skipped} skipped (no matching exercise_library slug).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Upload failed:", error);
    process.exit(1);
  });
