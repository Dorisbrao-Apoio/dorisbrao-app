import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAccount } from "@/lib/auth";
import { toProperty } from "@/lib/listings";
import { listingInputSchema } from "@/lib/validation/property-api";

function slugify(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 150);
}

export async function GET() {
  try {
    const account = await getAuthenticatedAccount();
    const where = account?.role === "ADMIN"
      ? {}
      : account?.role === "AGENT"
        ? { OR: [{ status: "ACTIVE" as const }, { agentId: account.id }] }
        : { status: "ACTIVE" as const };
    const listings = await prisma.listing.findMany({ where, orderBy: [{ createdAt: "desc" }] });
    return NextResponse.json(listings.map(toProperty), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("listing lookup failed", error);
    return NextResponse.json({ error: "Unable to load listings." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const account = await getAuthenticatedAccount();
    if (!account || (account.role !== "AGENT" && account.role !== "ADMIN")) {
      return NextResponse.json({ error: "Agent access is required." }, { status: 403 });
    }

    const parsed = listingInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid listing details.", issues: parsed.error.flatten() }, { status: 422 });
    const input = parsed.data;
    const baseSlug = slugify(`${input.neighborhood}-${input.title}`) || "luanda-home";
    const slug = `${baseSlug}-${randomUUID().slice(0, 8)}`;
    const listing = await prisma.listing.create({
      data: {
        slug,
        title: input.title,
        description: input.description,
        kind: input.category,
        status: "DRAFT",
        currency: "USD",
        priceCents: BigInt(Math.round(input.price * 100)),
        bedrooms: input.beds,
        bathrooms: input.baths.toFixed(1),
        squareFeet: input.sqft || null,
        neighborhood: input.neighborhood,
        city: "Luanda",
        region: "Luanda",
        latitude: -8.839,
        longitude: 13.289,
        amenities: [],
        imageUrls: input.image ? [input.image] : [],
        agentId: account.role === "AGENT" ? account.id : null,
        rawMetadata: { yearBuilt: new Date().getFullYear(), hoaFee: 0, featured: false },
      },
    });
    return NextResponse.json(toProperty(listing), { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("listing creation failed", error);
    return NextResponse.json({ error: "Unable to save this listing." }, { status: 503 });
  }
}
