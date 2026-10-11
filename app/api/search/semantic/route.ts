import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { extractSearchIntent } from "@/lib/ai/search-intent";
import { searchListings } from "@/lib/search/semantic";
import { semanticSearchInputSchema } from "@/lib/validation/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = semanticSearchInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search request.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const intent = await extractSearchIntent(parsed.data.query);
    const results = await searchListings({
      ...parsed.data,
      region: parsed.data.region ?? intent.region ?? undefined,
      kind: parsed.data.kind ?? intent.kind ?? undefined,
      minBedrooms: parsed.data.minBedrooms ?? intent.minBedrooms ?? undefined,
      maxPriceCents: parsed.data.maxPriceCents ?? intent.maxPriceCents ?? undefined,
      currency: parsed.data.currency ?? intent.currency ?? undefined,
    });
    return NextResponse.json({ query: parsed.data.query, results });
  } catch (error) {
    console.error("semantic search failed", error);
    return NextResponse.json({ error: "Unable to search listings right now." }, { status: 503 });
  }
}
