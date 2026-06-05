/**
 * Cosine similarity for equal-length embedding vectors (0–1 when non-negative).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  const sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, (sim + 1) / 2));
}

export function parsePgVector(value: unknown): number[] | null {
  if (Array.isArray(value)) {
    return value.map((n) => Number(n));
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed.startsWith("[")) return null;
    const inner = trimmed.slice(1, -1);
    if (!inner) return [];
    return inner.split(",").map((s) => Number.parseFloat(s.trim()));
  }
  return null;
}
