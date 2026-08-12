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

export const professionalServiceInputSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  priceLabel: z.string().trim().max(60).optional(),
});

export type ProfessionalServiceInput = z.infer<typeof professionalServiceInputSchema>;

export const professionalServiceUpdateSchema = professionalServiceInputSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type ProfessionalServiceUpdateInput = z.infer<typeof professionalServiceUpdateSchema>;

export const reorderProfessionalServicesSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1).max(20),
});

export type ReorderProfessionalServicesInput = z.infer<typeof reorderProfessionalServicesSchema>;
