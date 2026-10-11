import { Prisma } from "@prisma/client";
import { createEmbedding } from "@/lib/ai/embeddings";
import { prisma } from "@/lib/prisma";

function vectorLiteral(vector: number[]): string {
  return `[${vector.join(",")}]`;
}

export async function searchListings(options: {
  query: string;
  limit?: number;
  region?: string;
  kind?: "RENT" | "SALE";
  minBedrooms?: number;
  maxPriceCents?: number;
  currency?: string;
}): Promise<Array<{
  id: string;
  slug: string;
  title: string;
  neighborhood: string;
  city: string;
  region: string;
  kind: "RENT" | "SALE";
  currency: string;
  priceCents: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number | null;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
  similarity: number;
}>> {
  // Create embedding from the query
  const queryEmbedding = await createEmbedding(options.query);
  
  // Build the base query
  let query = Prisma.sql`
    SELECT 
      l."id",
      l."slug",
      l."title",
      l."neighborhood",
      l."city",
      l."region",
      l."kind",
      l."currency",
      l."priceCents",
      l."bedrooms",
      l."bathrooms",
      l."squareFeet",
      l."latitude",
      l."longitude",
      1 - (l.embedding <=> ${vectorLiteral(queryEmbedding)}::vector) AS similarity
    FROM "listings" l
    WHERE l."status" = 'ACTIVE'
      AND l."embedding" IS NOT NULL
  `;
  
  // Add filters
  if (options.region) {
    query = Prisma.sql`${query} AND l."region" = ${options.region}`;
  }
  
  if (options.kind) {
    query = Prisma.sql`${query} AND l."kind" = ${options.kind}`;
  }
  
  if (options.minBedrooms !== undefined) {
    query = Prisma.sql`${query} AND l."bedrooms" >= ${options.minBedrooms}`;
  }
  
  if (options.maxPriceCents !== undefined) {
    query = Prisma.sql`${query} AND l."priceCents" <= ${options.maxPriceCents}`;
  }
  
  if (options.currency) {
    query = Prisma.sql`${query} AND l."currency" = ${options.currency}`;
  }
  
  // Order by similarity (ascending distance = descending similarity) and limit
  query = Prisma.sql`${query} ORDER BY l.embedding <=> ${vectorLiteral(queryEmbedding)}::vector ASC`;
  
  if (options.limit !== undefined) {
    query = Prisma.sql`${query} LIMIT ${options.limit}`;
  } else {
    query = Prisma.sql`${query} LIMIT 10`; // default limit
  }
  
  // Execute the query and map results to match the expected shape
  const results = await prisma.$queryRaw<Array<{
    id: string;
    slug: string;
    title: string;
    neighborhood: string;
    city: string;
    region: string;
    kind: string;
    currency: string;
    priceCents: bigint; // Note: coming from DB as BigInt
    bedrooms: number;
    bathrooms: number;
    squareFeet: number | null;
    latitude: Prisma.Decimal | number;
    longitude: Prisma.Decimal | number;
    similarity: number;
  }>>(query);
  
  // Map to the expected format
  return results.map(listing => ({
    id: listing.id,
    slug: listing.slug,
    title: listing.title,
    neighborhood: listing.neighborhood,
    city: listing.city,
    region: listing.region,
    kind: listing.kind as "RENT" | "SALE",
    currency: listing.currency,
    priceCents: listing.priceCents.toString(), // Convert BigInt to string
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    squareFeet: listing.squareFeet ?? null,
    latitude: Number(listing.latitude),
    longitude: Number(listing.longitude),
    imageUrl: null, // Not available in current model
    similarity: listing.similarity,
  }));
}

