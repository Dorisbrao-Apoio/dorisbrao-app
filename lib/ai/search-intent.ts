export type SearchIntent = {
  region?: string;
  kind?: "RENT" | "SALE";
  minBedrooms?: number;
  maxPriceCents?: number;
  currency?: string;
};

export const extractSearchIntent = async (text: string): Promise<SearchIntent> => {
  // TODO: Implement actual intent extraction using NLP or LLM
  // For now, return empty intent - all filters will come from explicit query params
  return {};
};

