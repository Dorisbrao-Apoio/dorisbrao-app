import { PrismaClient } from "@prisma/client";
import { seedProperties } from "../lib/data/properties.ts";

const prisma = new PrismaClient();

try {
  const result = await prisma.listing.createMany({
    skipDuplicates: true,
    data: seedProperties.map((property) => ({
      id: property.id,
      slug: property.slug,
      title: property.title,
      description: property.description,
      kind: property.category,
      status: property.status === "PUBLISHED" ? "ACTIVE" : "DRAFT",
      currency: "USD",
      priceCents: BigInt(Math.round(property.price * 100)),
      bedrooms: property.beds,
      bathrooms: property.baths.toFixed(1),
      squareFeet: property.sqft,
      neighborhood: property.neighborhood,
      city: property.city,
      region: property.city,
      latitude: property.latitude,
      longitude: property.longitude,
      amenities: property.amenities,
      imageUrls: property.images,
      rawMetadata: {
        yearBuilt: property.yearBuilt,
        hoaFee: property.hoaFee,
        featured: property.featured === true,
        demoAgentId: property.agentId,
      },
    })),
  });
  console.log(`Added ${result.count} default listing(s); existing records were left untouched.`);
} finally {
  await prisma.$disconnect();
}
