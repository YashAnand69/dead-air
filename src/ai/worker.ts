import { pipeline, env } from "@huggingface/transformers";
import { cosine } from "./policy";

// Same-origin pinned files avoid CDN availability and cross-origin worker issues.
// Vite injects its deployment base path, including a Pages repository subpath.
const base = new URL(import.meta.env.BASE_URL, self.location.origin);
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = new URL("models/", base).href;
env.backends.onnx.wasm!.wasmPaths = new URL("runtime/onnx-1.22.0/", base).href;
env.backends.onnx.wasm!.numThreads = 1;

type Candidate = { id: string; label: string; examples: string[] };
type Embedder = (
  text: string | string[],
  options: { pooling: "mean"; normalize: boolean },
) => Promise<{ tolist(): number[][] }>;
let model: Embedder | undefined;
const embeddings = new Map<string, number[][]>();

self.onmessage = async ({ data }) => {
  try {
    if (data.type === "load") {
      const createPipeline = pipeline as unknown as (
        task: string,
        model: string,
        options: Record<string, unknown>,
      ) => Promise<Embedder>;
      model = await createPipeline("feature-extraction", "minilm-751bff3", {
        dtype: "q8",
        device: "wasm",
        local_files_only: true,
        progress_callback: (progress: {
          status: string;
          file?: string;
          progress: number;
        }) => {
          if (progress.status === "progress")
            self.postMessage({
              id: data.id,
              progress: `Loading ${progress.file}: ${Math.round(progress.progress)}%`,
            });
        },
      });
      self.postMessage({ id: data.id, ready: true });
      return;
    }
    if (!model) throw new Error("Model not loaded.");
    if (data.type !== "match" && data.type !== "search")
      throw new Error("Unknown model request.");
    const topics = (
      data.type === "search" ? data.passages : data.topics
    ) as Candidate[];
    // Cache each topic's individual examples. Averaging concatenated examples
    // diluted short queries and repeated expensive work on every question.
    const ranked = [];
    const query = (
      await model(data.query, { pooling: "mean", normalize: true })
    ).tolist()[0] as number[];
    for (const topic of topics) {
      const key = JSON.stringify([
        data.type,
        topic.id,
        topic.label,
        topic.examples,
      ]);
      let vectors = embeddings.get(key);
      if (!vectors) {
        vectors = (
          await model(topic.examples, { pooling: "mean", normalize: true })
        ).tolist() as number[][];
        embeddings.set(key, vectors);
      }
      ranked.push({
        id: topic.id,
        score: Math.max(...vectors.map((vector) => cosine(query, vector))),
      });
    }
    self.postMessage({ id: data.id, ranked });
  } catch (error) {
    self.postMessage({
      id: data.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
