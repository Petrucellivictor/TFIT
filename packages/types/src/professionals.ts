import type { UUID, ISODateTime } from "./common";

export interface ProfessionalContact {
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  email: string | null;
}

export interface ProfessionalServiceItem {
  id: UUID;
  title: string;
  description: string | null;
  priceLabel: string | null;
  order: number;
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
  services: ProfessionalServiceItem[];
}

export interface MyProfessionalServiceItem extends ProfessionalServiceItem {
  isActive: boolean;
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
