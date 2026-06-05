import { parsePgVector } from "@/lib/matching/embeddings/cosine";
import {
  getEmbeddingProviderFromEnv,
  listingContentHash,
  listingEmbedText,
  type EmbeddingProvider,
} from "@/lib/matching/embeddings/provider";
import { createAdminClient } from "@/lib/supabase/server";
import type { MatchBusiness, MatchEmbeddingMap, MatchListing } from "@/lib/matching/types";

export async function fetchListingEmbeddings(
  listingIds: string[],
): Promise<MatchEmbeddingMap> {
  const map: MatchEmbeddingMap = new Map();
  if (listingIds.length === 0) return map;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("listing_embeddings")
    .select("listing_id, embedding")
    .in("listing_id", listingIds);

  if (error) throw error;

  for (const row of data ?? []) {
    const vector = parsePgVector(row.embedding);
    if (vector) map.set(row.listing_id, vector);
  }

  return map;
}

export async function ensureListingEmbeddings(
  businesses: MatchBusiness[],
  listings: MatchListing[],
  provider?: EmbeddingProvider | null,
): Promise<MatchEmbeddingMap> {
  const embedProvider = provider ?? getEmbeddingProviderFromEnv();
  const listingIds = listings.map((l) => l.id);
  const businessMap = new Map(businesses.map((b) => [b.id, b]));

  if (!embedProvider) {
    return fetchListingEmbeddings(listingIds);
  }

  const supabase = createAdminClient();
  const { data: stored, error: fetchError } = await supabase
    .from("listing_embeddings")
    .select("listing_id, embedding, content_hash")
    .in("listing_id", listingIds);

  if (fetchError) throw fetchError;

  const storedByListing = new Map(
    (stored ?? []).map((row) => [row.listing_id, row]),
  );

  const result: MatchEmbeddingMap = new Map();
  const toEmbed: { listing: MatchListing; text: string; hash: string }[] = [];

  for (const listing of listings) {
    const business = businessMap.get(listing.businessId);
    const hash = listingContentHash(listing, business);
    const row = storedByListing.get(listing.id);

    if (row?.content_hash === hash) {
      const vector = parsePgVector(row.embedding);
      if (vector) {
        result.set(listing.id, vector);
        continue;
      }
    }

    toEmbed.push({
      listing,
      text: listingEmbedText(listing, business),
      hash,
    });
  }

  if (toEmbed.length === 0) return result;

  const BATCH = 64;
  for (let i = 0; i < toEmbed.length; i += BATCH) {
    const batch = toEmbed.slice(i, i + BATCH);
    const vectors = await embedProvider.embed(batch.map((b) => b.text));

    const rows = batch.map((item, idx) => ({
      listing_id: item.listing.id,
      embedding: vectors[idx],
      model: embedProvider.model,
      content_hash: item.hash,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("listing_embeddings").upsert(rows, {
      onConflict: "listing_id",
    });

    if (error) throw error;

    for (let j = 0; j < batch.length; j++) {
      result.set(batch[j].listing.id, vectors[j]);
    }
  }

  return result;
}
