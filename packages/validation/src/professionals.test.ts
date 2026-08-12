import { describe, expect, it } from "vitest";
import {
  professionalProfileInputSchema,
  professionalServiceInputSchema,
  professionalServiceUpdateSchema,
  reorderProfessionalServicesSchema,
} from "./professionals";

describe("professionalProfileInputSchema", () => {
  const base = { specialty: "Musculação", bio: "Especialista em hipertrofia." };

  it("accepts a profile with at least one contact method", () => {
    expect(professionalProfileInputSchema.safeParse({ ...base, contactWhatsapp: "11999999999" }).success).toBe(true);
  });

  it("rejects a profile with no contact method at all", () => {
    expect(professionalProfileInputSchema.safeParse(base).success).toBe(false);
  });

  it("rejects an empty specialty or bio", () => {
    expect(professionalProfileInputSchema.safeParse({ ...base, specialty: "", contactPhone: "123" }).success).toBe(false);
    expect(professionalProfileInputSchema.safeParse({ ...base, bio: "", contactPhone: "123" }).success).toBe(false);
  });

  it("rejects a malformed contactEmail", () => {
    expect(professionalProfileInputSchema.safeParse({ ...base, contactEmail: "not-an-email" }).success).toBe(false);
  });

  it("accepts a valid contactEmail alone as sufficient contact", () => {
    expect(professionalProfileInputSchema.safeParse({ ...base, contactEmail: "trainer@example.com" }).success).toBe(true);
  });
});

describe("professionalServiceInputSchema", () => {
  it("accepts a title-only item (description and priceLabel optional)", () => {
    expect(professionalServiceInputSchema.safeParse({ title: "Avaliação física" }).success).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(professionalServiceInputSchema.safeParse({ title: "" }).success).toBe(false);
  });

  it("rejects a priceLabel over 60 characters", () => {
    expect(professionalServiceInputSchema.safeParse({ title: "x", priceLabel: "a".repeat(61) }).success).toBe(false);
  });

  it("rejects a description over 500 characters", () => {
    expect(professionalServiceInputSchema.safeParse({ title: "x", description: "a".repeat(501) }).success).toBe(false);
  });
});

describe("professionalServiceUpdateSchema", () => {
  it("accepts an empty object (a fully partial update)", () => {
    expect(professionalServiceUpdateSchema.safeParse({}).success).toBe(true);
  });

  it("accepts toggling only isActive", () => {
    expect(professionalServiceUpdateSchema.safeParse({ isActive: false }).success).toBe(true);
  });

  it("still enforces field-level limits when a field is present", () => {
    expect(professionalServiceUpdateSchema.safeParse({ title: "" }).success).toBe(false);
  });
});

describe("reorderProfessionalServicesSchema", () => {
  it("accepts a list of valid UUIDs", () => {
    expect(
      reorderProfessionalServicesSchema.safeParse({
        orderedIds: ["00000000-0000-0000-0000-000000000000", "11111111-1111-1111-1111-111111111111"],
      }).success,
    ).toBe(true);
  });

  it("rejects an empty list", () => {
    expect(reorderProfessionalServicesSchema.safeParse({ orderedIds: [] }).success).toBe(false);
  });

  it("rejects more than 20 ids", () => {
    const orderedIds = Array.from({ length: 21 }, (_, i) => `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`);
    expect(reorderProfessionalServicesSchema.safeParse({ orderedIds }).success).toBe(false);
  });

  it("rejects a non-UUID entry", () => {
    expect(reorderProfessionalServicesSchema.safeParse({ orderedIds: ["not-a-uuid"] }).success).toBe(false);
  });
});
