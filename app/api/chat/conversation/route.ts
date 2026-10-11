import { ConversationRole } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";

import { getOpenAI } from "@/lib/ai/openai";
import { extractSearchIntent } from "@/lib/ai/search-intent";
import { getAuthenticatedUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchListings } from "@/lib/search/semantic";
import { conciergeRequestSchema } from "@/lib/validation/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();
const writeEvent = (controller: ReadableStreamDefaultController<Uint8Array>, event: unknown): void =>
  controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

function assistantInstructions(listingContext: string): string {
  return `You are Dorisbrao's real-estate concierge. Answer the buyer's question using only the listing data below. Be helpful and concise; do not invent availability, schools, amenities, prices, or property features. You may mention that a requested preference needs confirmation when it is absent from the data. Use Markdown, but never HTML. Listing cards are rendered separately by the application.\n\n${listingContext}`;
}

export async function POST(request: NextRequest): Promise<Response> {
  let payload: unknown;
  try { payload = await request.json(); } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }
  const parsed = conciergeRequestSchema.safeParse(payload);
  if (!parsed.success) return Response.json({ error: "Invalid chat request.", issues: parsed.error.flatten() }, { status: 422 });

  const userId = await getAuthenticatedUserId(request);
  if (!userId) return Response.json({ error: "Authentication is required." }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return Response.json({ error: "Authentication is required." }, { status: 401 });

  try {
    const intent = await extractSearchIntent(parsed.data.message);
    const matches = await searchListings({
      query: parsed.data.message, limit: 5,
      region: intent.region ?? undefined, kind: intent.kind ?? undefined,
      minBedrooms: intent.minBedrooms ?? undefined, maxPriceCents: intent.maxPriceCents ?? undefined,
      currency: intent.currency ?? undefined,
    });
    const conversation = parsed.data.conversationId
      ? await prisma.conversation.findFirst({ where: { id: parsed.data.conversationId, userId } })
      : await prisma.conversation.create({ data: { userId } });
    if (!conversation) return Response.json({ error: "Conversation was not found." }, { status: 404 });

    await prisma.conversationMessage.create({
      data: { conversationId: conversation.id, role: ConversationRole.USER, content: parsed.data.message },
    });
    await prisma.conversationListing.createMany({
      data: matches.map((match, index) => ({
        conversationId: conversation.id, listingId: match.id, rank: index + 1, similarity: match.similarity,
      })),
      skipDuplicates: true,
    });

    const listingContext = matches.length
      ? matches.map((match) => `- ${match.title} | ${match.bedrooms} bed, ${match.bathrooms} bath | ${match.currency} ${Number(BigInt(match.priceCents)) / 100} | ${match.neighborhood}, ${match.city} | semantic similarity ${match.similarity}`).join("\n")
      : "No active listings matched the query.";
    const stream = await getOpenAI().responses.create({
      model: process.env.OPENAI_CONCIERGE_MODEL ?? "gpt-5.4-mini",
      input: parsed.data.message,
      instructions: assistantInstructions(listingContext),
      max_output_tokens: 500,
      store: false,
      stream: true,
    });

    let assistantText = "";
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        writeEvent(controller, { type: "meta", conversationId: conversation.id, listings: matches });
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
              assistantText += event.delta;
              writeEvent(controller, { type: "text-delta", delta: event.delta });
            }
          }
          await prisma.conversationMessage.create({
            data: { conversationId: conversation.id, role: ConversationRole.ASSISTANT, content: assistantText },
          });
          writeEvent(controller, { type: "done" });
        } catch (error) {
          console.error("concierge stream failed", error);
          writeEvent(controller, { type: "error", message: "The concierge could not finish its response." });
        } finally { controller.close(); }
      },
    });
    return new Response(body, { headers: { "Cache-Control": "no-store", "Content-Type": "application/x-ndjson; charset=utf-8", "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    console.error("concierge setup failed", error);
    return Response.json({ error: "Unable to start the concierge right now." }, { status: 503 });
  }
}
