import { hashListingContent } from "@/lib/matching/embeddings/hash";
import type { MatchBusiness, MatchListing } from "@/lib/matching/types";

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

export type EmbeddingProvider = {
  model: string;
  dimensions: number;
  embed(texts: string[]): Promise<number[][]>;
};

/**
 * Intent-prefixed text improves embedding directionality:
 * an OFFER of design is not the same vector as a NEED for design.
 */
export function listingEmbedText(
  listing: MatchListing,
  business?: MatchBusiness,
): string {
  const intent =
    listing.listingType === "offer"
      ? "OFFER: This business provides"
      : "NEED: This business wants to receive";

  const parts = [
    intent,
    listing.category,
    listing.notes,
    business?.description,
    business?.vertical ? `vertical: ${business.vertical}` : null,
    business?.metro ? `metro: ${business.metro}` : null,
    `unit: ${listing.unit}`,
    `quantity: ${listing.quantity}`,
  ].filter(Boolean);

  return parts.join(" | ");
}

export function listingContentHash(
  listing: MatchListing,
  business?: MatchBusiness,
): string {
  return hashListingContent(listingEmbedText(listing, business));
}

export function createOpenAIEmbeddingProvider(apiKey: string): EmbeddingProvider {
  return {
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    async embed(texts: string[]): Promise<number[][]> {
      if (texts.length === 0) return [];

      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: texts,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`OpenAI embeddings failed (${response.status}): ${body}`);
      }

      const json = (await response.json()) as {
        data: { embedding: number[]; index: number }[];
      };

      const sorted = [...json.data].sort((a, b) => a.index - b.index);
      return sorted.map((row) => row.embedding);
    },
  };
}

export function getEmbeddingProviderFromEnv(): EmbeddingProvider | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return createOpenAIEmbeddingProvider(apiKey);
}
