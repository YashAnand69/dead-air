import type { Match, Topic } from '../contracts';

// Initial development thresholds. Evaluation results must be reported before
// treating these as calibrated; cosine similarity is not a probability.
export const MATCH_POLICY = { minimum: 0.30, margin: 0.06 } as const;
export interface RankedTopic { id: string; score: number }

export function chooseMatch(ranked: RankedTopic[], allowedIds: string[], policy = MATCH_POLICY): Match {
  const allowed = new Set(allowedIds);
  const unique = new Map<string, number>();
  for (const item of ranked) {
    if (allowed.has(item.id) && Number.isFinite(item.score)) {
      unique.set(item.id, Math.max(unique.get(item.id) ?? -Infinity, item.score));
    }
  }
  const candidates = [...unique].map(([id, score]) => ({ id, score })).sort((a, b) => b.score - a.score);
  if (!candidates.length || candidates[0].score < policy.minimum) return { kind: 'none', topicIds: [], scores: [] };
  // Similarity is not confidence. The player confirms a suggested topic
  // before any authored response is shown; never auto-answer a query.
  const selected = candidates.filter(x => x.score >= policy.minimum).slice(0, 2);
  return { kind: 'clarify', topicIds: selected.map(x => x.id), scores: selected.map(x => x.score) };
}

export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length || !a.length) return -1;
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; aa += a[i] ** 2; bb += b[i] ** 2; }
  return aa && bb ? dot / Math.sqrt(aa * bb) : -1;
}

const stopwords = new Set(['a','an','the','is','was','were','are','of','to','and','in','on','it','that','this','i','you','what','how','did','does','do','can','could']);
function words(value: string): Set<string> { return new Set(value.toLowerCase().match(/[a-z0-9]+/g)?.filter(x => !stopwords.has(x)) ?? []); }
/** Evaluation comparator only. Never called as a silent inference fallback. */
export function keywordBaseline(query: string, topics: Topic[]): string | null {
  const q = words(query);
  let best: string | null = null, score = 0;
  for (const topic of topics) {
    const candidate = words([topic.label, ...topic.examples].join(' '));
    const overlap = [...q].filter(word => candidate.has(word)).length;
    if (overlap > score) { score = overlap; best = topic.id; }
  }
  return best;
}
