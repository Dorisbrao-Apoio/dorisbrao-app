import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAccount } from "@/lib/auth";
import { inquiryInputSchema } from "@/lib/validation/property-api";

export async function GET() {
  try {
    const account = await getAuthenticatedAccount();
    if (!account || (account.role !== "AGENT" && account.role !== "ADMIN")) {
      return NextResponse.json({ error: "Agent access is required." }, { status: 403 });
    }
    const inquiries = await prisma.$queryRaw<Array<{
      id: string; listingId: string | null; propertyTitle: string; name: string;
      email: string; phone: string | null; message: string; type: "TOUR" | "MESSAGE";
      createdAt: Date;
    }>>(Prisma.sql`
      SELECT i."id", i."listingId", i."propertyTitle", i."name", i."email",
             i."phone", i."message", i."type", i."createdAt"
      FROM "property_inquiries" i
      LEFT JOIN "listings" l ON l."id" = i."listingId"
      ${account.role === "ADMIN" ? Prisma.empty : Prisma.sql`WHERE l."agentId" = ${account.id}`}
      ORDER BY i."createdAt" DESC
    `);
    return NextResponse.json(inquiries.map((inquiry) => ({
      id: inquiry.id,
      propertyId: inquiry.listingId ?? "",
      propertyTitle: inquiry.propertyTitle,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone ?? "",
      message: inquiry.message,
      type: inquiry.type,
      createdAt: inquiry.createdAt.toISOString(),
    })), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("inquiry lookup failed", error);
    return NextResponse.json({ error: "Unable to load inquiries." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = inquiryInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid inquiry details.", issues: parsed.error.flatten() }, { status: 422 });
    const input = parsed.data;
    const listing = await prisma.listing.findFirst({
      where: { OR: [{ id: input.propertyId }, { slug: input.propertyId }], status: "ACTIVE" },
      select: { id: true, title: true },
    });
    if (!listing) return NextResponse.json({ error: "This listing is no longer available." }, { status: 404 });

    const id = randomBytes(15).toString("base64url");
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "property_inquiries"
        ("id", "listingId", "propertyTitle", "name", "email", "phone", "message", "type")
      VALUES (${id}, ${listing.id}, ${listing.title}, ${input.name}, ${input.email.toLowerCase()},
        ${input.phone || null}, ${input.message}, ${input.type}::"InquiryType")
    `);
    return NextResponse.json({ id, ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("inquiry submission failed", error);
    return NextResponse.json({ error: "Unable to save your request. Please try again." }, { status: 503 });
  }
}
