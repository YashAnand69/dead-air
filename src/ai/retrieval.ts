import type { EvidenceHit, EvidencePassage } from "../contracts";
import type { RankedTopic } from "./policy";

// A retrieval cutoff, not a factual-confidence estimate. Keep weak matches out;
// the interface still asks players to inspect each exact source passage.
export const EVIDENCE_MINIMUM_SIMILARITY = 0.3;

/** Worker scores never grant access to evidence absent from this request. */
export function selectEvidenceHits(
  ranked: readonly RankedTopic[],
  passages: readonly EvidencePassage[],
  minimum = EVIDENCE_MINIMUM_SIMILARITY,
): EvidenceHit[] {
  const allowed = new Map(passages.map((passage) => [passage.id, passage]));
  const scores = new Map<string, number>();
  for (const item of ranked) {
    if (
      !allowed.has(item.id) ||
      !Number.isFinite(item.score) ||
      item.score < minimum ||
      item.score > 1
    )
      continue;
    scores.set(item.id, Math.max(scores.get(item.id) ?? -Infinity, item.score));
  }
  // Return one best passage per source record so the short list supports
  // comparison rather than being filled by near-duplicate excerpts.
  const seenRecords = new Set<string>();
  const hits: EvidenceHit[] = [];
  for (const [id, score] of [...scores].sort((a, b) => b[1] - a[1])) {
    const passage = allowed.get(id)!;
    if (seenRecords.has(passage.clueId)) continue;
    seenRecords.add(passage.clueId);
    hits.push({ id, clueId: passage.clueId, excerpt: passage.excerpt, score });
    if (hits.length === 3) break;
  }
  return hits;
}

const stopwords = new Set([
  "a",
  "an",
  "the",
  "is",
  "was",
  "were",
  "are",
  "of",
  "to",
  "and",
  "in",
  "on",
  "it",
  "that",
  "this",
  "i",
  "you",
  "what",
  "how",
  "did",
  "does",
  "do",
  "can",
  "could",
]);
const tokens = (value: string) =>
  new Set(
    value
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((word) => !stopwords.has(word)) ?? [],
  );

/** Evaluation-only lexical comparator; not a silent runtime fallback. */
export function keywordEvidenceSearch(
  query: string,
  passages: EvidencePassage[],
): EvidenceHit[] {
  const queryTokens = tokens(query);
  const ranked = passages.map((passage) => {
    const candidate = tokens(
      [passage.excerpt, ...passage.searchPhrases].join(" "),
    );
    const overlap = [...queryTokens].filter((word) =>
      candidate.has(word),
    ).length;
    return {
      id: passage.id,
      score: queryTokens.size ? overlap / queryTokens.size : 0,
    };
  });
  return selectEvidenceHits(ranked, passages, Number.EPSILON);
}
