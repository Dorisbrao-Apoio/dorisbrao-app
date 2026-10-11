import { getOpenAI } from "@/lib/ai/openai";

export const EMBEDDING_MODEL = "text-embedding-3-small" as const;
export const EMBEDDING_DIMENSIONS = 1536;

export async function createEmbedding(input: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input,
    dimensions: EMBEDDING_DIMENSIONS,
    encoding_format: "float",
  });
  const embedding = response.data[0]?.embedding;
  if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error("Embedding provider returned an unexpected vector dimension.");
  }
  return embedding;
}
