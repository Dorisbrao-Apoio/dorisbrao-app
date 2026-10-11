import { z } from "zod";

export const descriptionRequestSchema = z.object({
  title: z.string().trim().min(5).max(180),
  kind: z.enum(["RENT", "SALE"]),
  region: z.string().trim().min(2).max(120),
  neighborhood: z.string().trim().min(2).max(120),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  squareFeet: z.number().int().min(100).max(200_000).optional(),
  amenities: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  tone: z.enum(["luxury", "warm", "modern", "professional"]),
  facts: z.array(z.string().trim().min(1).max(240)).max(20).default([]),
});

export const descriptionResponseSchema = z.object({
  metaTitle: z.string().min(15).max(60),
  metaDescription: z.string().min(70).max(160),
  description: z.string().min(300).max(1_800),
});
