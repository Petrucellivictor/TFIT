import { and, eq, ilike, or } from "drizzle-orm";
import { getDb, professionalProfiles, profiles } from "@tfit/database";
import type { ProfessionalListing } from "@tfit/types";
import { jsonOk } from "@/lib/http";
import { requireUser } from "@/lib/requireUser";

/**
 * A contact directory, not a marketplace — no payment/booking flow, no
 * verification claim (see docs/SECURITY.md and professional_profiles'
 * schema comment). Public within the app (any signed-in user can browse).
 */
export async function GET(req: Request) {
  const result = await requireUser();
  if ("errorResponse" in result) return result.errorResponse;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();

  const db = getDb();
  const conditions = [eq(professionalProfiles.isActive, true)];
  if (search) {
    conditions.push(
      or(ilike(professionalProfiles.specialty, `%${search}%`), ilike(profiles.displayName, `%${search}%`))!,
    );
  }

  const rows = await db
    .select({ professional: professionalProfiles, profile: profiles })
    .from(professionalProfiles)
    .innerJoin(profiles, eq(professionalProfiles.userId, profiles.userId))
    .where(and(...conditions));

  const listings: ProfessionalListing[] = rows.map(({ professional, profile }) => ({
    userId: professional.userId,
    displayName: profile.displayName,
    handle: profile.handle,
    avatarUrl: profile.avatarUrl,
    specialty: professional.specialty,
    bio: professional.bio,
    city: professional.city,
    contact: {
      phone: professional.contactPhone,
      whatsapp: professional.contactWhatsapp,
      instagram: professional.contactInstagram,
      email: professional.contactEmail,
    },
  }));

  return jsonOk({ professionals: listings });
}
