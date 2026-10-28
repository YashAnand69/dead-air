import type { ClueId, EvidencePassage } from "../contracts";
import { clues } from "./content";

// Displayed excerpts are always verbatim evidence. Search phrases describe a
// passage for retrieval; they are never presented as additional archive facts.
const definitions: Array<Omit<EvidencePassage, "id"> & { key: string }> = [
  {
    key: "archive-claim",
    clueId: "C1",
    excerpt:
      "The last manual warning is stamped 23:14:00 on the studio clock. The archive records no confirmed receipt.",
    searchPhrases: [
      "What does the official archive say about the final warning?",
      "Was the warning acknowledged according to the archive?",
    ],
  },
  {
    key: "power-monitor",
    clueId: "C1",
    excerpt:
      "A separate, synchronized power monitor records mains interruption at 23:18:10. These records may not share a clock.",
    searchPhrases: [
      "When did the electricity fail?",
      "Which timestamp uses an independent reference clock?",
      "Do the records share a time source?",
    ],
  },
  {
    key: "clock-offset",
    clueId: "C2",
    excerpt:
      "Studio clock S-2 is exactly four minutes slow relative to reference time. The manual transmitter event logger uses S-2.",
    searchPhrases: [
      "Which clock is behind the reference time?",
      "What clock stamps the transmitter log?",
      "How far apart are the studio and reference clocks?",
    ],
  },
  {
    key: "clock-scope",
    clueId: "C2",
    excerpt:
      "No adjustment was made before shutdown. This offset applies to the final transmitter event; the power monitor uses reference time.",
    searchPhrases: [
      "Was the slow clock fixed before the last event?",
      "Should the power failure time also be corrected?",
      "Which timestamps does the clock offset affect?",
    ],
  },
  {
    key: "warning-checkpoint",
    clueId: "C3",
    excerpt:
      "23:14:00 S-2. Operator Mara Vale. Manual carrier active; warning already in progress. Warning identifier NQ-17.",
    searchPhrases: [
      "What was happening at the logged studio time?",
      "Who was operating the transmitter?",
      "Which warning identifier was being transmitted?",
    ],
  },
  {
    key: "checkpoint-meaning",
    clueId: "C3",
    excerpt:
      "This is the final logged checkpoint, not the beginning of the spoken message. The displayed timestamp comes from studio clock S-2, not the power monitor.",
    searchPhrases: [
      "Did the message begin at the final timestamp?",
      "Is this the start of the warning or a checkpoint?",
      "What clock was used for the last log entry?",
    ],
  },
  {
    key: "live-carrier",
    clueId: "C4",
    excerpt:
      "“North Quay, warning NQ-17. This is Mara, live at the manual carrier. Playback is disconnected. I am holding the switch until you acknowledge. Please confirm NQ-17.”",
    searchPhrases: [
      "Could this be an old tape replaying?",
      "Was the operator speaking live?",
      "What shows that playback was disconnected?",
      "Was she waiting for an acknowledgment?",
    ],
  },
  {
    key: "transmission-limit",
    clueId: "C4",
    excerpt:
      "The recording establishes a live warning, not whether anybody received it.",
    searchPhrases: [
      "Does a live broadcast prove somebody heard it?",
      "What can the control-room recording actually establish?",
      "What evidence is still needed after confirming transmission?",
    ],
  },
  {
    key: "independent-receipt",
    clueId: "C5",
    excerpt:
      "23:18:02 reference time. West Reach acknowledges North Quay warning NQ-17. Identifier and message received in full. Receiver clock synchronized independently.",
    searchPhrases: [
      "Who heard the warning?",
      "What time was the message received?",
      "Where is the independent acknowledgment?",
      "How can I match the receiver message to the transmitter?",
    ],
  },
  {
    key: "receipt-limit",
    clueId: "C5",
    excerpt:
      "This confirms receipt of that warning; it does not establish what happened afterward.",
    searchPhrases: [
      "Does acknowledgment prove Mara survived?",
      "Can the receipt tell us what happened after the broadcast?",
      "What does the receiver record leave unknown?",
    ],
  },
  {
    key: "final-signoff",
    clueId: "C6",
    excerpt:
      "“If you find this later, keep the small things. The light above the desk. Someone answering through the rain. Not every silence means nobody heard. North Quay signing off.”",
    searchPhrases: [
      "What did Mara ask us to remember?",
      "What was the last sign-off?",
      "Why does the ending mention silence?",
    ],
  },
  {
    key: "ending-limit",
    clueId: "C6",
    excerpt:
      "You restored the timing and the receipt. The rest of Mara’s story remains unknown.",
    searchPhrases: [
      "What did the investigation prove?",
      "Do we know the operator’s fate?",
      "What remains uncertain at the end?",
    ],
  },
];

/** Build the inference corpus only from records the player has discovered. */
export function buildEvidencePassages(
  discovered: readonly ClueId[],
): EvidencePassage[] {
  const allowed = new Set(discovered);
  return definitions.flatMap(({ key, clueId, excerpt, searchPhrases }) => {
    const clue = clues.find((record) => record.id === clueId);
    if (!allowed.has(clueId) || !clue?.transcript.includes(excerpt)) return [];
    return [{ id: key, clueId, excerpt, searchPhrases: [...searchPhrases] }];
  });
}
