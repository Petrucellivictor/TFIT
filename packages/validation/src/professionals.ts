import { z } from "zod";

export const professionalProfileInputSchema = z
  .object({
    specialty: z.string().trim().min(1).max(120),
    bio: z.string().trim().min(1).max(1000),
    city: z.string().trim().max(120).optional(),
    contactPhone: z.string().trim().max(30).optional(),
    contactWhatsapp: z.string().trim().max(30).optional(),
    contactInstagram: z.string().trim().max(60).optional(),
    contactEmail: z.string().trim().email().max(255).optional(),
  })
  .refine(
    (data) => Boolean(data.contactPhone || data.contactWhatsapp || data.contactInstagram || data.contactEmail),
    { message: "Informe pelo menos uma forma de contato.", path: ["contactPhone"] },
  );

export type ProfessionalProfileInput = z.infer<typeof professionalProfileInputSchema>;
