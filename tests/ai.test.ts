import { describe, it, expect } from "vitest";
import { chooseMatch, cosine } from "../src/ai/policy";
describe("semantic topic suggestions", () => {
  it("requires confirmation even for a strong score", () => {
    expect(chooseMatch([{ id: "a", score: 0.99 }], ["a"]).kind).toBe("clarify");
  });
  it("filters forbidden IDs and nonfinite scores", () => {
    expect(
      chooseMatch(
        [
          { id: "hidden", score: 1 },
          { id: "a", score: NaN },
        ],
        ["a"],
      ).kind,
    ).toBe("none");
  });
  it("deduplicates and limits suggestions", () => {
    expect(
      chooseMatch(
        [
          { id: "a", score: 0.8 },
          { id: "a", score: 0.9 },
          { id: "b", score: 0.7 },
          { id: "c", score: 0.6 },
        ],
        ["a", "b", "c"],
      ).topicIds,
    ).toEqual(["a", "b"]);
  });
  it("abstains for weak matches", () => {
    expect(chooseMatch([{ id: "a", score: 0.1 }], ["a"]).kind).toBe("none");
  });
  it("compares vectors without trusting mismatched dimensions", () => {
    expect(cosine([1, 0], [1, 0])).toBe(1);
    expect(cosine([1], [1, 0])).toBe(-1);
  });
});
