import { useId } from "react";
import type { Clue, ClueId } from "../contracts";
import "./evidence-workbench.css";

export interface EvidenceSearchHit {
  id: string;
  clueId: ClueId;
  excerpt: string;
  score: number;
}

export interface EvidenceSearchResultsProps {
  hits: EvidenceSearchHit[];
  records: Clue[];
  onOpen: (id: ClueId) => void;
}

/** Display only verbatim text from records the player has already recovered. */
export function EvidenceSearchResults({
  hits,
  records,
  onOpen,
}: EvidenceSearchResultsProps) {
  const headingId = useId();
  const seen = new Set<string>();
  const results = hits
    .flatMap((hit) => {
      const record = records.find((candidate) => candidate.id === hit.clueId);
      const key = `${hit.clueId}:${hit.excerpt}`;
      if (
        !record ||
        !hit.excerpt.trim() ||
        !Number.isFinite(hit.score) ||
        !record.transcript.includes(hit.excerpt) ||
        seen.has(key)
      )
        return [];
      seen.add(key);
      return [{ hit, record }];
    })
    .slice(0, 3);

  return (
    <section className="evidence-search-results" aria-labelledby={headingId}>
      <div className="search-results-heading">
        <h3 id={headingId}>Related passages</h3>
        <span>
          {results.length}{" "}
          {results.length === 1 ? "source excerpt" : "source excerpts"}
        </span>
      </div>
      <p className="search-results-note">
        Possible leads, not an answer. These are exact words from your recovered
        records; check the full source before drawing a conclusion.
      </p>
      {results.length ? (
        <ol className="search-results-list">
          {results.map(({ hit, record }) => (
            <li key={`${record.id}:${hit.id}`}>
              <div className="search-hit-source">
                <span>{record.id}</span>
                <h4>{record.title}</h4>
              </div>
              <blockquote>{hit.excerpt}</blockquote>
              <p className="search-hit-metadata">
                {record.source} · {record.time}
              </p>
              <button type="button" onClick={() => onOpen(record.id)}>
                Read full record {record.id} <span aria-hidden="true">↗</span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="search-results-empty">
          No related passage was found in your recovered records. Try a more
          specific question, compare records on the desk, or explore a manual
          topic.
        </p>
      )}
    </section>
  );
}

export default EvidenceSearchResults;
