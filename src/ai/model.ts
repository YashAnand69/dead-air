export const MODEL_ID = 'Xenova/all-MiniLM-L6-v2';
// Hugging Face model API verified October 27, 2026; Apache-2.0 conversion.
export const MODEL_REVISION = '751bff37182d3f1213fa05d7196b954e230abad9';
export const MAX_QUERY_LENGTH = 240;
export type WorkerRequest = { id: number; kind: 'load' } | { id: number; kind: 'match'; query: string; topics: Array<{ id: string; label: string; examples: string[] }> };
