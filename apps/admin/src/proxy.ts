import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Establishes the Clerk auth context for every request — same reasoning as
 * apps/backend/src/proxy.ts. Authorization (the admin-email allowlist) is
 * decided per-page in src/lib/adminAuth.ts, not here.
 */
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
