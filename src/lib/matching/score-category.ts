import {
  RELATED_GROUP_PAIRS,
  SYNONYM_GROUPS,
} from "@/lib/matching/config";
import { normalizeText, tokenSet } from "@/lib/matching/normalize";

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }

  const union = new Set([...a, ...b]).size;
  return intersection / union;
}

function bigramSimilarity(a: string, b: string): number {
  const grams = (text: string) => {
    const norm = normalizeText(text).replace(/\s/g, "");
    const set = new Set<string>();
    for (let i = 0; i < norm.length - 1; i++) {
      set.add(norm.slice(i, i + 2));
    }
    return set;
  };

  const aGrams = grams(a);
  const bGrams = grams(b);
  if (aGrams.size === 0 || bGrams.size === 0) return 0;

  let intersection = 0;
  for (const g of aGrams) {
    if (bGrams.has(g)) intersection += 1;
  }
  return intersection / new Set([...aGrams, ...bGrams]).size;
}

function synonymGroupForToken(token: string): string | null {
  for (const group of SYNONYM_GROUPS) {
    if (group.includes(token)) return group[0];
  }
  return null;
}

function sharesSynonymGroup(a: Set<string>, b: Set<string>): boolean {
  for (const group of SYNONYM_GROUPS) {
    const groupSet = new Set(group);
    const aHit = [...a].some((token) => groupSet.has(token));
    const bHit = [...b].some((token) => groupSet.has(token));
    if (aHit && bHit) return true;
  }
  return false;
}

function relatedGroupScore(a: Set<string>, b: Set<string>): number {
  let best = 0;
  for (const tokenA of a) {
    const groupA = synonymGroupForToken(tokenA);
    if (!groupA) continue;
    for (const tokenB of b) {
      const groupB = synonymGroupForToken(tokenB);
      if (!groupB || groupA === groupB) continue;
      for (const [left, right, score] of RELATED_GROUP_PAIRS) {
        if (
          (groupA === left && groupB === right) ||
          (groupA === right && groupB === left)
        ) {
          best = Math.max(best, score);
        }
      }
    }
  }
  return best;
}

function substringBoost(offerCategory: string, needCategory: string): number {
  const offerNorm = normalizeText(offerCategory);
  const needNorm = normalizeText(needCategory);

  if (offerNorm === needNorm) return 1;
  if (offerNorm.includes(needNorm) || needNorm.includes(offerNorm)) return 0.88;
  return 0;
}

export function scoreCategoryMatch(
  offerCategory: string,
  needCategory: string,
): number {
  const offerTokens = tokenSet(offerCategory);
  const needTokens = tokenSet(needCategory);

  const substring = substringBoost(offerCategory, needCategory);
  const jaccard = jaccardSimilarity(offerTokens, needTokens);
  const bigram = bigramSimilarity(offerCategory, needCategory);
  const synonym = sharesSynonymGroup(offerTokens, needTokens) ? 0.9 : 0;
  const related = relatedGroupScore(offerTokens, needTokens);

  return Math.max(substring, jaccard, bigram * 0.95, synonym, related);
}

export function combineBidirectionalCategoryScore(
  forward: number,
  reverse: number,
): number {
  if (forward <= 0 || reverse <= 0) return 0;
  return Math.sqrt(forward * reverse);
}

export function combineCycleCategoryScore(edgeScores: number[]): number {
  if (edgeScores.length === 0) return 0;
  const positive = edgeScores.filter((s) => s > 0);
  if (positive.length !== edgeScores.length) return 0;
  return Math.min(...positive);
}
