import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { conciergeRequestSchema, semanticSearchInputSchema } from "../lib/validation/search.ts";
import { descriptionRequestSchema, descriptionResponseSchema } from "../lib/validation/listing.ts";

describe("search and concierge request validation", () => {
  it("trims a search query and supplies its default currency", () => {
    assert.deepEqual(semanticSearchInputSchema.parse({ query: "  2 bedroom in Luanda  " }), {
      query: "2 bedroom in Luanda",
      currency: "USD",
    });
  });

  it("rejects empty or oversized queries and unsafe price values", () => {
    assert.equal(semanticSearchInputSchema.safeParse({ query: " " }).success, false);
    assert.equal(semanticSearchInputSchema.safeParse({ query: "x".repeat(501) }).success, false);
    assert.equal(
      semanticSearchInputSchema.safeParse({ query: "home", maxPriceCents: Number.MAX_SAFE_INTEGER + 1 }).success,
      false,
    );
  });

  it("bounds chat messages and conversation identifiers", () => {
    assert.equal(conciergeRequestSchema.safeParse({ message: "  Find a home  " }).success, true);
    assert.equal(conciergeRequestSchema.safeParse({ message: "x".repeat(1001) }).success, false);
    assert.equal(conciergeRequestSchema.safeParse({ message: "hello", conversationId: "x".repeat(31) }).success, false);
  });
});

describe("listing description validation", () => {
  const validRequest = {
    title: "Bright apartment in Luanda",
    kind: "RENT",
    region: "Luanda",
    neighborhood: "Ingombota",
    bedrooms: 2,
    bathrooms: 1.5,
    tone: "professional",
  };

  it("accepts valid listing details and applies empty-list defaults", () => {
    assert.deepEqual(descriptionRequestSchema.parse(validRequest).amenities, []);
    assert.deepEqual(descriptionRequestSchema.parse(validRequest).facts, []);
  });

  it("rejects unsupported kinds and out-of-range listing values", () => {
    assert.equal(descriptionRequestSchema.safeParse({ ...validRequest, kind: "LEASE" }).success, false);
    assert.equal(descriptionRequestSchema.safeParse({ ...validRequest, bedrooms: 21 }).success, false);
    assert.equal(descriptionRequestSchema.safeParse({ ...validRequest, squareFeet: 99 }).success, false);
  });

  it("enforces generated metadata length limits", () => {
    assert.equal(descriptionResponseSchema.safeParse({
      metaTitle: "A concise property title",
      metaDescription: "Short description that is long enough to meet the minimum SEO summary length requirements.",
      description: "d".repeat(300),
    }).success, true);
    assert.equal(descriptionResponseSchema.safeParse({
      metaTitle: "Too short",
      metaDescription: "Too short",
      description: "Too short",
    }).success, false);
  });
});
