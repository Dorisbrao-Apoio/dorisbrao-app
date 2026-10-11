import { Prisma } from "@prisma/client";

import { createEmbedding, EMBEDDING_MODEL } from "@/lib/ai/embeddings";
import { prisma } from "@/lib/prisma";

function vectorLiteral(vector: number[]): string { return `[${vector.join(",")}]`; }

export async function embedListing(listingId: string): Promise<void> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { title: true, description: true, neighborhood: true, city: true, region: true, amenities: true },
  });
  if (!listing) throw new Error(`Listing ${listingId} does not exist.`);

  const document = [
    `Title: ${listing.title}`,
    `Description: ${listing.description}`,
    `Neighborhood: ${listing.neighborhood}`,
    `City: ${listing.city}`,
    `Region: ${listing.region}`,
    `Amenities: ${listing.amenities.join(", ") || "None listed"}`,
  ].join("\n");
  const embedding = await createEmbedding(document);
  await prisma.$executeRaw(Prisma.sql`
    UPDATE "listings"
    SET "embedding" = ${vectorLiteral(embedding)}::vector,
        "embeddingModel" = ${EMBEDDING_MODEL},
        "embeddedAt" = NOW()
    WHERE "id" = ${listingId};
  `);
}
