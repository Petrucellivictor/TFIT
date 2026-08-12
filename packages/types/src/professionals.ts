import type { UUID, ISODateTime } from "./common";

export interface ProfessionalContact {
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  email: string | null;
}

export interface ProfessionalListing {
  userId: UUID;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  specialty: string;
  bio: string;
  city: string | null;
  contact: ProfessionalContact;
}

export interface MyProfessionalProfile {
  specialty: string;
  bio: string;
  city: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactInstagram: string | null;
  contactEmail: string | null;
  isActive: boolean;
  updatedAt: ISODateTime;
}
