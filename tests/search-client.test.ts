import { afterEach, describe, expect, it, vi } from "vitest";
import { SemanticClient } from "../src/ai/client";
import { buildEvidencePassages } from "../src/game/passages";

class FakeWorker {
  static instances: FakeWorker[] = [];
  sent: Array<Record<string, unknown>> = [];
  onmessage?: (event: { data: unknown }) => void;
  onerror?: (event: { message: string }) => void;
  terminated = false;
  constructor() {
    FakeWorker.instances.push(this);
  }
  postMessage(data: Record<string, unknown>) {
    this.sent.push(data);
    queueMicrotask(() =>
      this.onmessage?.({
        data:
          data.type === "load"
            ? { id: data.id, ready: true }
            : {
                id: data.id,
                ranked: [
                  { id: "power-monitor", score: 0.8 },
                  { id: "independent-receipt", score: 0.99 },
                ],
              },
      }),
    );
  }
  terminate() {
    this.terminated = true;
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
  FakeWorker.instances = [];
});

describe("evidence search worker boundary", () => {
  it("sends only supplied discovered passages and rejects inaccessible worker results", async () => {
    vi.stubGlobal("Worker", FakeWorker);
    const client = new SemanticClient();
    await client.load(() => {});
    const hits = await client.search(
      "When did power fail?",
      buildEvidencePassages(["C1"]),
    );
    const sent = FakeWorker.instances[0].sent[1];
    expect(sent.type).toBe("search");
    expect(JSON.stringify(sent)).not.toContain("West Reach");
    expect(sent.passages as unknown[]).toHaveLength(2);
    expect(hits.map((hit) => hit.id)).toEqual(["power-monitor"]);
    client.cancel();
    expect(FakeWorker.instances[0].terminated).toBe(true);
    await expect(
      client.search("When?", buildEvidencePassages(["C1"])),
    ).rejects.toThrow("not ready");
  });
});
