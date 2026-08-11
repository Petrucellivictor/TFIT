import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Establishes the Clerk auth context for every request. Authorization itself
 * is NOT decided here — `createRouteMatcher` + `auth.protect()` path-matching
 * is deprecated by Clerk in favor of resource-based checks (see
 * https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher).
 * Each route handler calls `auth()` itself and returns 401 if unauthenticated
 * — see docs/SECURITY.md and src/lib/http.ts `errors.unauthorized()`.
 */
export default clerkMiddleware();

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
