import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAccount } from "@/lib/auth";
import { toProperty } from "@/lib/listings";
import { listingUpdateSchema } from "@/lib/validation/property-api";

type RouteContext = { params: { listingId: string } };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const listing = await prisma.listing.findFirst({
      where: { OR: [{ id: params.listingId }, { slug: params.listingId }], status: "ACTIVE" },
    });
    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    return NextResponse.json(toProperty(listing), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("listing lookup failed", error);
    return NextResponse.json({ error: "Unable to load this listing." }, { status: 503 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const account = await getAuthenticatedAccount();
    if (!account || (account.role !== "AGENT" && account.role !== "ADMIN")) {
      return NextResponse.json({ error: "Agent access is required." }, { status: 403 });
    }
    const listing = await prisma.listing.findUnique({ where: { id: params.listingId } });
    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    if (account.role !== "ADMIN" && listing.agentId !== account.id) {
      return NextResponse.json({ error: "You can only update listings assigned to your account." }, { status: 403 });
    }

    const parsed = listingUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid listing details.", issues: parsed.error.flatten() }, { status: 422 });
    const input = parsed.data;
    const updated = await prisma.listing.update({
      where: { id: listing.id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.category !== undefined ? { kind: input.category } : {}),
        ...(input.status !== undefined ? { status: input.status === "PUBLISHED" ? "ACTIVE" : "DRAFT" } : {}),
        ...(input.price !== undefined ? { priceCents: BigInt(Math.round(input.price * 100)) } : {}),
        ...(input.beds !== undefined ? { bedrooms: input.beds } : {}),
        ...(input.baths !== undefined ? { bathrooms: input.baths.toFixed(1) } : {}),
        ...(input.sqft !== undefined ? { squareFeet: input.sqft || null } : {}),
        ...(input.neighborhood !== undefined ? { neighborhood: input.neighborhood } : {}),
        ...(input.image !== undefined ? { imageUrls: input.image ? [input.image] : [] } : {}),
      },
    });
    return NextResponse.json(toProperty(updated), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("listing update failed", error);
    return NextResponse.json({ error: "Unable to update this listing." }, { status: 503 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const account = await getAuthenticatedAccount();
    if (!account || (account.role !== "AGENT" && account.role !== "ADMIN")) {
      return NextResponse.json({ error: "Agent access is required." }, { status: 403 });
    }
    const listing = await prisma.listing.findUnique({ where: { id: params.listingId } });
    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    if (account.role !== "ADMIN" && listing.agentId !== account.id) {
      return NextResponse.json({ error: "You can only delete listings assigned to your account." }, { status: 403 });
    }
    await prisma.listing.delete({ where: { id: listing.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("listing deletion failed", error);
    return NextResponse.json({ error: "Unable to delete this listing." }, { status: 503 });
  }
}
