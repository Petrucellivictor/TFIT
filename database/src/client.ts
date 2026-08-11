import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | null = null;

/**
 * Lazily initialized so `next build` doesn't crash when DATABASE_URL isn't
 * set yet (e.g. before the Neon Marketplace integration is provisioned).
 * Do NOT wrap this in a Proxy — it breaks libraries that introspect the
 * client object. See docs/ARCHITECTURE.md / vercel-storage skill notes.
 */
export function getDb(): Db {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzle(sql, { schema });
  }
  return _db;
}
