import { describe, it, expect } from "vitest";
import {
  initialState,
  discover,
  solveA,
  solveB,
  restoreState,
  availableTopics,
} from "../src/game/engine";
describe("archive progression", () => {
  it("cannot discover locked evidence", () => {
    expect(discover(initialState(), "C5")).toEqual(initialState());
  });
  it("requires evidence, finishes, and restores", () => {
    let s = initialState();
    expect(solveA(s, "23:18:00", ["C2", "C3"]).ok).toBe(false);
    s = discover(discover(s, "C2"), "C3");
    expect(solveA(s, "23:14:00", ["C2", "C3"]).ok).toBe(false);
    s = solveA(s, "23:18:00", ["C2", "C3"]).state;
    s = discover(discover(s, "C4"), "C5");
    expect(availableTopics(s).length).toBe(4);
    s = solveB(s, "confirmed", ["C4", "C5"]).state;
    expect(s.finished).toBe(true);
    expect(restoreState(JSON.stringify(s))).toEqual(s);
  });
  it("recovers corrupt saves without inventing progress", () => {
    expect(restoreState("{oops")).toEqual(initialState());
    expect(
      restoreState(
        JSON.stringify({
          ...initialState(),
          finished: true,
          discovered: ["C6"],
        }),
      ),
    ).toEqual(initialState());
  });
});
it("rejects selecting every record as evidence", () => {
  let s = discover(discover(initialState(), "C2"), "C3");
  expect(solveA(s, "23:18:00", ["C1", "C2", "C3"]).ok).toBe(false);
});
it("does not unlock receipt by forged saved deduction alone", () => {
  const s = restoreState(
    JSON.stringify({
      version: 1,
      discovered: ["C1", "C5"],
      deductionA: true,
      finished: true,
      hintLevel: 100,
    }),
  );
  expect(s.deductionA).toBe(false);
  expect(s.finished).toBe(false);
  expect(s.discovered).toEqual(["C1"]);
});
it("never exposes unavailable topic text", () => {
  expect(availableTopics(initialState()).map((t) => t.id)).toEqual(["archive"]);
});

import { requestHint, availableClues } from "../src/game/engine";
it("resets the hint tier when advancing, even without UI assistance", () => {
  let s = discover(discover(initialState(), "C2"), "C3");
  s = requestHint(requestHint(s).state).state;
  expect(s.hintLevel).toBe(2);
  s = solveA(s, "23:18:00", ["C2", "C3"]).state;
  expect(s.hintLevel).toBe(0);
  expect(requestHint(s).text).toContain("channel 3");
});
it("rejects duplicated evidence as well as unrelated extras", () => {
  const s = discover(discover(initialState(), "C2"), "C3");
  expect(solveA(s, "23:18:00", ["C2", "C3", "C3"]).ok).toBe(false);
});
it("keeps repeated successful actions idempotent", () => {
  let s = discover(discover(initialState(), "C2"), "C3");
  expect(discover(s, "C2")).toBe(s);
  s = solveA(s, "23:18:00", ["C2", "C3"]).state;
  s = requestHint(s).state;
  expect(solveA(s, "23:18:00", ["C2", "C3"]).state).toBe(s);
  s = discover(discover(s, "C4"), "C5");
  s = solveB(s, "confirmed", ["C4", "C5"]).state;
  expect(solveB(s, "confirmed", ["C4", "C5"]).state).toBe(s);
  expect(requestHint(s).state).toBe(s);
});
it("does not carry a later-stage hint into recovered earlier progress", () => {
  const s = restoreState(
    JSON.stringify({ ...initialState(), deductionA: true, hintLevel: 3 }),
  );
  expect(s.hintLevel).toBe(0);
  expect(requestHint(s).text).toContain("Explore");
});
it("reveals final recording only after a supported receipt conclusion", () => {
  let s = discover(discover(initialState(), "C2"), "C3");
  s = solveA(s, "23:18:00", ["C2", "C3"]).state;
  s = discover(discover(s, "C4"), "C5");
  expect(solveB(s, "survived", ["C4", "C5"]).ok).toBe(false);
  expect(availableClues(s, 1).map((c) => c.id)).toEqual(["C1"]);
  s = solveB(s, "confirmed", ["C4", "C5"]).state;
  expect(availableClues(s, 1).map((c) => c.id)).toEqual(["C1", "C6"]);
});
