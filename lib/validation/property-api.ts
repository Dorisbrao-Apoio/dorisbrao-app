import { z } from "zod";

export const listingInputSchema = z.object({
  title: z.string().trim().min(5).max(180),
  neighborhood: z.string().trim().min(2).max(120),
  category: z.enum(["SALE", "RENT"]),
  price: z.number().positive().max(1_000_000_000),
  beds: z.number().int().min(0).max(20),
  baths: z.number().min(0).max(20),
  sqft: z.number().int().min(0).max(200_000),
  description: z.string().trim().min(20).max(10_000),
  image: z.union([z.string().url().max(2000), z.literal("")]).optional(),
  status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
});

export const listingUpdateSchema = listingInputSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  "Provide at least one listing field to update.",
);

export const inquiryInputSchema = z.object({
  propertyId: z.string().trim().min(1).max(30),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(40).optional().default(""),
  message: z.string().trim().min(2).max(2000),
  type: z.enum(["TOUR", "MESSAGE"]),
});
