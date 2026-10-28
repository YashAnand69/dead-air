import type { GameState, ClueId } from '../contracts';
import { clues, topics } from './content';

export const initialState = (): GameState => ({
  version: 1,
  discovered: ['C1'],
  deductionA: false,
  finished: false,
  hintLevel: 0,
});

const has = (state: GameState, ids: ClueId[]) => ids.every(id => state.discovered.includes(id));
const matchesEvidence = (submitted: ClueId[], required: ClueId[]) =>
  submitted.length === required.length && new Set(submitted).size === required.length &&
  required.every(id => submitted.includes(id));

export const availableClues = (state: GameState, channel: number) => clues.filter(clue =>
  clue.channel === channel &&
  (!['C4', 'C5'].includes(clue.id) || state.deductionA) &&
  (clue.id !== 'C6' || state.finished),
);

export function discover(state: GameState, id: ClueId): GameState {
  const clue = clues.find(clue => clue.id === id);
  if (!clue || state.discovered.includes(id) ||
      !availableClues(state, clue.channel).some(candidate => candidate.id === id)) return state;
  return { ...state, discovered: [...state.discovered, id] };
}

export function solveA(state: GameState, time: string, ids: ClueId[]) {
  const ok = time === '23:18:00' && has(state, ['C2', 'C3']) && matchesEvidence(ids, ['C2', 'C3']);
  return {
    state: ok && !state.deductionA ? { ...state, deductionA: true, hintLevel: 0 } : state,
    ok,
    message: ok ? 'Clock corrected. The final-minute recordings are now available.' :
      'Check which clock stamped the event, and which record establishes its offset.',
  };
}

export function solveB(state: GameState, claim: string, ids: ClueId[]) {
  const ok = state.deductionA && claim === 'confirmed' && has(state, ['C4', 'C5']) &&
    matchesEvidence(ids, ['C4', 'C5']);
  return {
    state: ok && !state.finished ? {
      ...state,
      finished: true,
      hintLevel: 0,
      discovered: [...new Set<ClueId>([...state.discovered, 'C6'])],
    } : state,
    ok,
    message: ok ? 'The archive has been corrected.' :
      'A live transmission alone does not establish receipt. Compare independent records.',
  };
}

export const availableTopics = (state: GameState) => topics.filter(topic => has(state, topic.clues));

export function restoreState(raw: string | null): GameState {
  try {
    const saved = JSON.parse(raw || 'null');
    if (saved?.version !== 1 || !Array.isArray(saved.discovered) ||
        typeof saved.deductionA !== 'boolean' || typeof saved.finished !== 'boolean') return initialState();
    // Rebuild legal progression instead of trusting persisted unlock flags or clue IDs.
    let state = initialState();
    for (const id of ['C2', 'C3'] as ClueId[]) {
      if (saved.discovered.includes(id)) state = discover(state, id);
    }
    if (saved.deductionA && has(state, ['C2', 'C3'])) state.deductionA = true;
    for (const id of ['C4', 'C5'] as ClueId[]) {
      if (saved.discovered.includes(id)) state = discover(state, id);
    }
    if (saved.finished && state.deductionA && has(state, ['C4', 'C5'])) {
      state = solveB(state, 'confirmed', ['C4', 'C5']).state;
    }
    // If invalid flags forced us back to a previous stage, its hints must start over too.
    if (!state.finished && saved.deductionA === state.deductionA && Number.isInteger(saved.hintLevel)) {
      state.hintLevel = Math.max(0, Math.min(3, saved.hintLevel));
    }
    return state;
  } catch {
    return initialState();
  }
}

export function requestHint(state: GameState) {
  if (state.finished) return { state, text: 'The archive is corrected. You can revisit each record or start a new investigation.' };
  const hints = state.deductionA ? [
    'Find the independent receiver on channel 3.',
    'Match the warning identifier in the live recording and the receipt.',
    'Select confirmed receipt, supported by C4 and C5.',
  ] : [
    'Explore channel 2 for two records using the same clock.',
    'A slow clock displays an earlier time than reference time.',
    'Add four minutes: 23:18:00. Select C2 and C3.',
  ];
  const level = Number.isInteger(state.hintLevel) ? Math.max(0, Math.min(state.hintLevel, 2)) : 0;
  return { state: { ...state, hintLevel: Math.min(3, level + 1) }, text: hints[level] };
}
