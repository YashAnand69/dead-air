# Game and narrative audit — October 28, 2026

Scope: authored story, deterministic progression, evidence validation, save recovery, and hint behavior. This is code/content review and automated verification, not a human playtest.

## Fixed

- Hint progress now resets in the engine when deduction A is first completed. Previously this relied on the UI; an alternate caller could carry a solution-revealing hint tier into the next puzzle.
- Evidence submissions must contain exactly the two required distinct IDs. A duplicated ID appended to a valid pair no longer passes.
- Repeated discoveries and successful deductions are idempotent. Rechecking the first deduction cannot reset the next stage's hint progress.
- If invalid saved flags force recovery to an earlier stage, later-stage hint progress is discarded. Completed saves have no active hint progress.
- Requesting a hint after completion gives a completion message without changing state.
- The archive response no longer implies that Mara is known to have left; the records do not establish that.
- The maintenance artifact states the clock offset without directly instructing the player to add four minutes. The calculation remains a deduction; explicit arithmetic is reserved for the last requested hint.
- The transmitter event is now clearly a checkpoint in an already active warning, not the start of the spoken message. This avoids implying that the full warning and acknowledgment occurred in two seconds.

## Canon review

S-2 reads 23:14:00 while running four minutes slow. Thus the final active-transmission checkpoint is 23:18:00 reference time. The independently clocked receipt for the matching NQ-17 identifier is 23:18:02, and the separate power monitor records interruption at 23:18:10. The conclusion is limited to correct timing and confirmed receipt. No survival, motive, real-world emergency advice, or subsequent consequences are asserted.

The sign-off is an emotional reward, not hidden evidence required to solve the case. Captions contain every required factual cue. Both deductions preserve progress on an incorrect submission. No exact typed question is required.

## Verification

`npm test -- tests/game.test.ts`: 11 tests passed. Coverage includes complete progression and restore, locked evidence, incorrect timestamps, unsupported survival conclusion, exact evidence pairs, repeated actions, final-record gating, malformed saves, invalid saved flags, topic visibility and hint transitions.

## Remaining release checks outside this audit

- A fresh player must test whether the deductions are clear and satisfying. The short linear story may be completed faster than the proposed 8–12 minutes; do not assert measured duration yet.
- Browser AI needs real loading and held-out routing evidence; successful manual topics do not establish this.
- The integrated interface needs a complete keyboard/muted/reduced-motion pass after final UI changes.
- Public deployed asset paths, model loads, fresh/cached sessions and restart recovery need verification.
- Narration must match the final transcripts, including the in-progress checkpoint wording. A voice claiming the warning begins at 23:18:00 would reintroduce the timing problem.
- A single authored case has limited replay value. Do not promise endless or procedurally generated mysteries.
