import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getOpenAI } from "@/lib/ai/openai";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { descriptionRequestSchema, descriptionResponseSchema } from "@/lib/validation/listing";

export const runtime = "nodejs";

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["metaTitle", "metaDescription", "description"],
  properties: {
    metaTitle: { type: "string" },
    metaDescription: { type: "string" },
    description: { type: "string" },
  },
} as const;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || (user.role !== "AGENT" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Agent access is required." }, { status: 403 });
  }

  let json: unknown;
  try { json = await request.json(); } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = descriptionRequestSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid property metadata.", issues: parsed.error.flatten() }, { status: 422 });

  try {
    const metadata = parsed.data;
    const response = await getOpenAI().responses.create({
      model: process.env.OPENAI_CONCIERGE_MODEL ?? "gpt-5.4-mini",
      store: false,
      instructions: "You write accurate, fair-housing-compliant real-estate marketing copy. Use only supplied facts. Do not make claims about protected classes, safety, school quality, investment returns, transit time, or walkability. Avoid superlatives that cannot be substantiated. Return exactly the requested JSON.",
      input: JSON.stringify(metadata),
      text: { format: { type: "json_schema", name: "listing_description", strict: true, schema: responseSchema } },
    });
    const output = descriptionResponseSchema.safeParse(JSON.parse(response.output_text));
    if (!output.success) throw new Error("The model returned an invalid description payload.");
    return NextResponse.json(output.data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("description generation failed", error);
    return NextResponse.json({ error: "Unable to generate a description right now." }, { status: 503 });
  }
}
