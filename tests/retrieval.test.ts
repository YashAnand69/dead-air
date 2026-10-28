import { describe, expect, it } from "vitest";
import { buildEvidencePassages } from "../src/game/passages";
import { clues } from "../src/game/content";
import { selectEvidenceHits } from "../src/ai/retrieval";
import type { ClueId } from "../src/contracts";

const allIds = clues.map((clue) => clue.id);

describe("source-grounded evidence retrieval", () => {
  it("never indexes undiscovered records and handles duplicate/unknown save IDs", () => {
    const passages = buildEvidencePassages(["C1", "C1", "C99" as ClueId]);
    expect(passages).toHaveLength(2);
    expect(passages.every((passage) => passage.clueId === "C1")).toBe(true);
    expect(new Set(passages.map((passage) => passage.id)).size).toBe(2);
    expect(buildEvidencePassages([])).toEqual([]);
  });

  it("returns exact excerpts, with no generated additions or invalid references", () => {
    const passages = buildEvidencePassages(allIds);
    expect(passages).toHaveLength(12);
    for (const passage of passages) {
      expect(
        clues.find((clue) => clue.id === passage.clueId)?.transcript,
      ).toContain(passage.excerpt);
      expect(passage.searchPhrases.length).toBeGreaterThan(0);
    }
  });

  it("does not grant source access through ranked worker IDs", () => {
    const initial = buildEvidencePassages(["C1"]);
    expect(
      selectEvidenceHits([{ id: "independent-receipt", score: 0.99 }], initial),
    ).toEqual([]);
  });

  it("rejects invalid or weak scores and deduplicates repeated IDs", () => {
    const passages = buildEvidencePassages(["C1", "C2"]);
    expect(
      selectEvidenceHits(
        [
          { id: "archive-claim", score: NaN },
          { id: "clock-offset", score: Infinity },
          { id: "clock-scope", score: 1.1 },
          { id: "power-monitor", score: 0.29 },
        ],
        passages,
      ),
    ).toEqual([]);
    const hits = selectEvidenceHits(
      [
        { id: "archive-claim", score: 0.4 },
        { id: "archive-claim", score: 0.7 },
        { id: "clock-offset", score: 0.6 },
      ],
      passages,
    );
    expect(hits.map((hit) => hit.id)).toEqual([
      "archive-claim",
      "clock-offset",
    ]);
    expect(hits[0].score).toBe(0.7);
    expect(hits[0].excerpt).toBe(passages[0].excerpt);
  });

  it("caps results at three different records, keeping each best passage", () => {
    const passages = buildEvidencePassages(allIds);
    const hits = selectEvidenceHits(
      passages.map((passage, index) => ({
        id: passage.id,
        score: 0.95 - index * 0.01,
      })),
      passages,
    );
    expect(hits).toHaveLength(3);
    expect(new Set(hits.map((hit) => hit.clueId)).size).toBe(3);
    expect(hits.map((hit) => hit.id)).toEqual([
      "archive-claim",
      "clock-offset",
      "warning-checkpoint",
    ]);
  });
});
