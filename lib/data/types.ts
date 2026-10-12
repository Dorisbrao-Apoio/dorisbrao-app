export type PropertyCategory = "SALE" | "RENT";
export type PropertyStatus = "PUBLISHED" | "DRAFT";

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  title: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  price: number;
  location: string;
  neighborhood: string;
  city: string;
  beds: number;
  baths: number;
  sqft: number;
  images: string[];
  agentId: string;
  category: PropertyCategory;
  status: PropertyStatus;
  description: string;
  amenities: string[];
  yearBuilt: number;
  hoaFee: number;
  featured?: boolean;
  latitude: number;
  longitude: number;
}

export type AccountRole = "CLIENT" | "AGENT" | "ADMIN";

export interface AccountSession {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
}

export interface PropertyLead {
  id: string;
  propertyId: string;
  propertyTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  type: "TOUR" | "MESSAGE";
  createdAt: string;
}
