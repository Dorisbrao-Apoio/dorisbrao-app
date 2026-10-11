import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/ai/openai";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const GenSchema = z.object({
  sqFt: z.number().int().positive().max(200_000),
  beds: z.number().int().min(0).max(20),
  baths: z.number().min(0).max(20),
  region: z.string().trim().min(1).max(120),
  tone: z.enum(["professional","luxury","family","modern"]).default("professional"),
  amenities: z.string().trim().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || (user.role !== "AGENT" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Agent access is required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = GenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid property details.", issues: parsed.error.flatten() }, { status: 422 });
    }
    const p = parsed.data;
    const prompt = `Write an SEO-optimized, engaging property description (${p.tone} tone). ${p.beds} bed / ${p.baths} bath, ${p.sqFt} sqft, in ${p.region}. ${p.amenities ? "Amenities: "+p.amenities+"." : ""} Include neighborhood highlights, lifestyle hooks, and a closing call-to-action for buyers/renters.`;
    const chat = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: "You are a luxury real estate copywriter for Dorisbrao (Angola). Write in English with local context." }, { role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });
    return NextResponse.json({ description: chat.choices[0].message?.content ?? "" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("legacy description generation failed", error);
    return NextResponse.json({ error: "Unable to generate a description right now." }, { status: 503 });
  }
}
