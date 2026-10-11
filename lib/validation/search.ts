import { z } from "zod";

export const semanticSearchInputSchema = z.object({
  query: z.string().trim().min(1).max(500),
  region: z.string().trim().min(1).max(120).optional(),
  kind: z.enum(["RENT", "SALE"]).optional(),
  minBedrooms: z.number().int().min(0).optional(),
  maxPriceCents: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
  currency: z.string().trim().min(3).max(3).optional().default("USD"),
});

export const conciergeRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  conversationId: z.string().min(1).max(30).optional(),
});

// ListingMatch type matches the schema used in ConciergeChat component
export const listingSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  neighborhood: z.string(),
  city: z.string(),
  region: z.string(),
  kind: z.enum(["RENT", "SALE"]),
  currency: z.string(),
  priceCents: z.string(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  squareFeet: z.number().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  imageUrl: z.string().nullable(),
  similarity: z.number(),
});

export type ListingMatch = z.infer<typeof listingSchema>;

