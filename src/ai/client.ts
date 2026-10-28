import type { Topic, Match, EvidencePassage, EvidenceHit } from "../contracts";
import { chooseMatch } from "./policy";
import { MAX_QUERY_LENGTH } from "./model";
import { selectEvidenceHits } from "./retrieval";

type Reply = {
  id: number;
  progress?: string;
  error?: string;
  ranked?: Array<{ id: string; score: number }>;
  ready?: boolean;
};
type Pending = {
  resolve: (reply: Reply) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

/** One worker per instance. Cancel terminates fetch/inference, not only the reply. */
export class SemanticClient {
  private worker: Worker | null = null;
  private nextId = 0;
  private pending = new Map<number, Pending>();
  private ready = false;
  private matching = false;

  private call(payload: object, timeout: number): Promise<Reply> {
    if (!this.worker)
      return Promise.reject(new Error("Enable the on-device model first."));
    const worker = this.worker;
    return new Promise((resolve, reject) => {
      const id = ++this.nextId;
      const timer = setTimeout(
        () =>
          this.stop(
            new Error("Model timed out. Retry or continue with manual topics."),
          ),
        timeout,
      );
      this.pending.set(id, { resolve, reject, timer });
      worker.postMessage({ ...payload, id });
    });
  }

  async load(progress: (message: string) => void): Promise<void> {
    this.cancel();
    progress(
      "Preparing on-device model (about 44 MB including runtime on first use)…",
    );
    const worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker = worker;
    worker.onmessage = ({ data }: MessageEvent<Reply>) => {
      if (this.worker !== worker) return;
      if (data.progress) {
        progress(data.progress);
        return;
      }
      const request = this.pending.get(data.id);
      if (!request) return;
      clearTimeout(request.timer);
      this.pending.delete(data.id);
      if (data.error) request.reject(new Error(data.error));
      else request.resolve(data);
    };
    worker.onerror = (event) =>
      this.stop(
        new Error(
          event.message ||
            "The model worker could not start. Retry or use manual topics.",
        ),
      );
    try {
      await this.call({ type: "load" }, 90000);
      if (this.worker !== worker)
        throw new Error("Model loading was cancelled.");
      this.ready = true;
      progress("On-device model ready · questions stay on this device");
    } catch (error) {
      if (this.worker === worker)
        this.stop(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  async match(query: string, topics: Topic[]): Promise<Match> {
    if (!this.ready) throw new Error("The on-device model is not ready.");
    if (this.matching) throw new Error("Please wait for the current question.");
    if (!query.trim() || !topics.length)
      return { kind: "none", topicIds: [], scores: [] };
    this.matching = true;
    try {
      const reply = await this.call(
        {
          type: "match",
          query: query.trim().slice(0, MAX_QUERY_LENGTH),
          topics: topics.map(({ id, label, examples }) => ({
            id,
            label,
            examples,
          })),
        },
        10000,
      );
      return chooseMatch(
        reply.ranked ?? [],
        topics.map((t) => t.id),
      );
    } finally {
      this.matching = false;
    }
  }

  async search(
    query: string,
    passages: EvidencePassage[],
  ): Promise<EvidenceHit[]> {
    if (!this.ready) throw new Error("The on-device model is not ready.");
    if (this.matching) throw new Error("Please wait for the current question.");
    if (!query.trim() || !passages.length) return [];
    this.matching = true;
    try {
      // Only the supplied, discovered corpus crosses the worker boundary.
      const reply = await this.call(
        {
          type: "search",
          query: query.trim().slice(0, MAX_QUERY_LENGTH),
          passages: passages.map(({ id, excerpt, searchPhrases }) => ({
            id,
            label: excerpt,
            examples: [excerpt, ...searchPhrases],
          })),
        },
        20000,
      );
      return selectEvidenceHits(reply.ranked ?? [], passages);
    } finally {
      this.matching = false;
    }
  }

  private stop(reason: Error) {
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
    this.matching = false;
    for (const request of this.pending.values()) {
      clearTimeout(request.timer);
      request.reject(reason);
    }
    this.pending.clear();
  }
  cancel() {
    this.stop(
      new Error("Model stopped. Retry or continue with manual topics."),
    );
  }
}
