import type { Clue, Topic } from "../contracts";
export const clues: Clue[] = [
  {
    id: "C1",
    title: "A silence in the record",
    source: "Archive desk · reference clock",
    time: "23:18:10",
    channel: 1,
    transcript:
      "Archive 17 / North Quay / 1987. The last manual warning is stamped 23:14:00 on the studio clock. The archive records no confirmed receipt. A separate, synchronized power monitor records mains interruption at 23:18:10. These records may not share a clock. Somewhere beneath the static: “You have the time wrong.”",
  },
  {
    id: "C2",
    title: "Four minutes missing",
    source: "Engineer’s maintenance note",
    time: "22:50:00",
    channel: 2,
    transcript:
      "Studio clock S-2 is exactly four minutes slow relative to reference time. The manual transmitter event logger uses S-2. No adjustment was made before shutdown. This offset applies to the final transmitter event; the power monitor uses reference time.",
  },
  {
    id: "C3",
    title: "The manual carrier",
    source: "Transmitter event log · S-2 clock",
    time: "23:14:00",
    channel: 2,
    transcript:
      "23:14:00 S-2. Operator Mara Vale. Manual carrier active; warning already in progress. Warning identifier NQ-17. This is the final logged checkpoint, not the beginning of the spoken message. The displayed timestamp comes from studio clock S-2, not the power monitor.",
  },
  {
    id: "C4",
    title: "Still at the microphone",
    source: "Recovered control-room recording",
    time: "Final transmission",
    channel: 2,
    transcript:
      "“North Quay, warning NQ-17. This is Mara, live at the manual carrier. Playback is disconnected. I am holding the switch until you acknowledge. Please confirm NQ-17.” The recording establishes a live warning, not whether anybody received it.",
  },
  {
    id: "C5",
    title: "Someone was listening",
    source: "West Reach · synchronized receipt",
    time: "23:18:02",
    channel: 3,
    transcript:
      "23:18:02 reference time. West Reach acknowledges North Quay warning NQ-17. Identifier and message received in full. Receiver clock synchronized independently. This confirms receipt of that warning; it does not establish what happened afterward.",
  },
  {
    id: "C6",
    title: "The last sign-off",
    source: "Restored archive · Mara Vale",
    time: "Record corrected",
    channel: 1,
    transcript:
      "“If you find this later, keep the small things. The light above the desk. Someone answering through the rain. Not every silence means nobody heard. North Quay signing off.” You restored the timing and the receipt. The rest of Mara’s story remains unknown.",
  },
];
export const topics: Topic[] = [
  {
    id: "archive",
    label: "What the archive claims",
    clues: ["C1"],
    examples: [
      "What is wrong with the record?",
      "When did the power fail?",
      "What does the archive report?",
      "What happened to Mara after the broadcast?",
      "Did Mara survive?",
      "Is her fate known?",
      "Did she abandon the station?",
    ],
    response:
      "The archive lists an unconfirmed warning and a studio timestamp. The independent power monitor gives 23:18:10. It does not establish whether Mara left or what happened to her.",
  },
  {
    id: "clock",
    label: "Comparing the clocks",
    clues: ["C2", "C3"],
    examples: [
      "Could those times mean the same moment?",
      "Is the clock slow?",
      "How do I compare the timestamps?",
      "How much was the studio clock behind reference time?",
      "What offset applies to S-2?",
    ],
    response:
      "The maintenance note says S-2 ran four minutes slow. The transmitter uses S-2; the power monitor uses reference time. Compare them only after applying that offset.",
  },
  {
    id: "live",
    label: "Live or recorded?",
    clues: ["C4"],
    examples: [
      "Was that a recording?",
      "Was Mara really sending the warning?",
      "Was the carrier live?",
      "Was it a prerecorded tape or a live transmission?",
      "Was the message being broadcast in real time?",
      "Was the operator holding the switch?",
      "Was playback disconnected?",
    ],
    response:
      "The control-room recording identifies a live manual carrier and disconnected playback. That establishes transmission, but not receipt.",
  },
  {
    id: "receipt",
    label: "Was the warning received?",
    clues: ["C4", "C5"],
    examples: [
      "Did anyone hear her?",
      "Was the message received?",
      "Did the warning arrive before power failed?",
      "Was it not acknowledged?",
      "Did West Reach confirm NQ-17?",
      "Is there an independent acknowledgment?",
    ],
    response:
      "West Reach records receipt of NQ-17 at 23:18:02 reference time. Compare the warning identifier and the independent power record. This says nothing about events after receipt.",
  },
];
