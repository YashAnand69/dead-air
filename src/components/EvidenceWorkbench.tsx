import { useEffect, useId, useState } from "react";
import type { Clue, ClueId } from "../contracts";
import "./evidence-workbench.css";

export interface EvidenceWorkbenchProps {
  records: Clue[];
  onOpen: (id: ClueId) => void;
  resetKey?: number;
}

/** A reading aid: selections never submit evidence or determine a conclusion. */
export function EvidenceWorkbench({
  records,
  onOpen,
  resetKey = 0,
}: EvidenceWorkbenchProps) {
  const headingId = useId();
  const instructionsId = useId();
  const leftId = useId();
  const rightId = useId();
  const [left, setLeft] = useState<ClueId | "">("");
  const [right, setRight] = useState<ClueId | "">("");
  const recordIds = records.map((record) => record.id).join(",");

  useEffect(() => {
    setLeft("");
    setRight("");
  }, [resetKey]);

  useEffect(() => {
    const available = new Set(recordIds.split(","));
    setLeft((current) => (available.has(current) ? current : ""));
    setRight((current) => (available.has(current) ? current : ""));
  }, [recordIds]);

  const first = records.find((record) => record.id === left);
  const second = records.find((record) => record.id === right);

  return (
    <section
      className="evidence-workbench"
      id="comparison"
      aria-labelledby={headingId}
      aria-describedby={instructionsId}
    >
      <div className="workbench-heading">
        <div>
          <p className="eyebrow">THE COMPARISON DESK</p>
          <h2 id={headingId}>Lay the records side by side.</h2>
        </div>
        <span className="workbench-index" aria-hidden="true">
          ↔
        </span>
      </div>
      <p className="workbench-intro" id={instructionsId}>
        Choose two recovered records. Compare who recorded each detail, which
        clock it uses, and what the words actually establish. These selections
        are separate from the evidence you submit for a deduction.
      </p>
      {records.length < 2 ? (
        <p className="workbench-waiting">
          Recover another record on the receiver to begin comparing sources.
        </p>
      ) : (
        <>
          <div className="workbench-controls">
            <div className="workbench-control">
              <label htmlFor={leftId}>First record</label>
              <select
                id={leftId}
                value={first?.id ?? ""}
                onChange={(event) => setLeft(event.target.value as ClueId | "")}
              >
                <option value="">Choose a recovered record</option>
                {records.map((record) => (
                  <option
                    key={record.id}
                    value={record.id}
                    disabled={record.id === second?.id}
                  >
                    {record.id} · {record.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="workbench-control">
              <label htmlFor={rightId}>Second record</label>
              <select
                id={rightId}
                value={second?.id ?? ""}
                onChange={(event) =>
                  setRight(event.target.value as ClueId | "")
                }
              >
                <option value="">Choose a recovered record</option>
                {records.map((record) => (
                  <option
                    key={record.id}
                    value={record.id}
                    disabled={record.id === first?.id}
                  >
                    {record.id} · {record.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="workbench-records">
            <ComparisonRecord record={first} position="First" onOpen={onOpen} />
            <ComparisonRecord
              record={second}
              position="Second"
              onOpen={onOpen}
            />
          </div>
          <div className="workbench-prompts">
            <span>Read with three questions</span>
            <ul>
              <li>Are these independent sources?</li>
              <li>Do their times use the same clock?</li>
              <li>What remains unproven?</li>
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

function ComparisonRecord({
  record,
  position,
  onOpen,
}: {
  record?: Clue;
  position: "First" | "Second";
  onOpen: (id: ClueId) => void;
}) {
  if (!record) {
    return (
      <div className="comparison-sheet comparison-sheet-empty">
        <span className="comparison-position">{position} source</span>
        <p>Place a record here.</p>
        <span>Its original transcript will appear without interpretation.</span>
      </div>
    );
  }

  return (
    <article
      className="comparison-sheet"
      aria-label={`${position} source: ${record.title}`}
    >
      <span className="comparison-position">
        {record.id} · ORIGINAL TRANSCRIPT
      </span>
      <h3>{record.title}</h3>
      <dl>
        <div>
          <dt>Source</dt>
          <dd>{record.source}</dd>
        </div>
        <div>
          <dt>Time as recorded</dt>
          <dd>{record.time}</dd>
        </div>
      </dl>
      <blockquote>{record.transcript}</blockquote>
      <button type="button" onClick={() => onOpen(record.id)}>
        Open {record.id} on the receiver <span aria-hidden="true">↗</span>
      </button>
    </article>
  );
}

export default EvidenceWorkbench;
