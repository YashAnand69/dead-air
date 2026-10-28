export type ClueId = "C1" | "C2" | "C3" | "C4" | "C5" | "C6";
export interface Clue {
  id: ClueId;
  title: string;
  source: string;
  time: string;
  channel: number;
  transcript: string;
}
export interface GameState {
  version: 1;
  discovered: ClueId[];
  deductionA: boolean;
  finished: boolean;
  hintLevel: number;
}
export interface Topic {
  id: string;
  label: string;
  examples: string[];
  response: string;
  clues: ClueId[];
}
export interface Match {
  kind: "clarify" | "none";
  topicIds: string[];
  scores: number[];
}

export interface EvidencePassage {
  id: string;
  clueId: ClueId;
  excerpt: string;
  searchPhrases: string[];
}
export interface EvidenceHit {
  id: string;
  clueId: ClueId;
  excerpt: string;
  score: number;
}
