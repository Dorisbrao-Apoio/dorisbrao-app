import type { Listing, Prisma } from "@prisma/client";
import type { Property } from "@/lib/data/types";

type ListingWithMeta = Pick<Listing,
  "id" | "slug" | "title" | "description" | "rawMetadata" | "kind" | "status" |
  "priceCents" | "bedrooms" | "bathrooms" | "squareFeet" | "neighborhood" | "city" |
  "latitude" | "longitude" | "amenities" | "imageUrls" | "agentId" | "createdAt"
>;

function metadata(value: Prisma.JsonValue): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}
export function toProperty(listing: ListingWithMeta): Property {
  const extra = metadata(listing.rawMetadata);
  return {
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    price: Number(listing.priceCents) / 100,
    location: `${listing.neighborhood}, ${listing.city}`,
    neighborhood: listing.neighborhood,
    city: listing.city,
    beds: listing.bedrooms,
    baths: Number(listing.bathrooms),
    sqft: listing.squareFeet ?? 0,
    images: listing.imageUrls.length ? listing.imageUrls : ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85"],
    agentId: typeof extra.demoAgentId === "string" ? extra.demoAgentId : listing.agentId ?? "agent-1",
    category: listing.kind,
    status: listing.status === "ACTIVE" ? "PUBLISHED" : "DRAFT",
    description: listing.description,
    amenities: listing.amenities,
    yearBuilt: typeof extra.yearBuilt === "number" ? extra.yearBuilt : new Date(listing.createdAt).getFullYear(),
    hoaFee: typeof extra.hoaFee === "number" ? extra.hoaFee : 0,
    featured: extra.featured === true,
    latitude: Number(listing.latitude),
    longitude: Number(listing.longitude),
  };
}
