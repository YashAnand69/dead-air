# Current status — October 28, 2026

The complete game is playable locally, with a refined responsive interface. See RELEASE.md for measured results and limitations. Earlier prototype notes are superseded by this file.

## Complete

- Six authored records, two evidence-based deductions, ending, hints, save/resume and reset.
- Fixed duplicate evidence, cross-stage hint leakage, invalid-save recovery and unsupported story wording.
- Radio tuning feedback, restrained scroll/evidence animation, progress, reduced-motion controls and keyboard navigation.
- Original synthesized ambience, optional local-device transcript narration, and full text access without audio.
- Same-origin pinned model/runtime files and local fonts with notices.
- Actual browser inference confirmed in development and production-subpath builds. Local production model loading measured 679ms on this machine; this is not public internet performance.
- Sixteen regression tests and full manual browser journey pass. Mobile and production AI suggestion-confirmation checks pass without page errors.

## AI limits are explicit

Direct automatic topic answers were unreliable in diagnostic tests. The game now suggests up to two available topics and requires the player to choose before opening authored evidence. On the retained 23-query in-scope diagnostic set, expected-topic suggestion recall was 21/23 after revising the interaction. This is a development diagnostic, not a new independent held-out result or proof of broad accuracy. Facts, unlocks and final deductions never depend on the model.

## External completion work

Public GitHub Pages upload/verification is in progress. A genuine friend trial has not happened; docs/PLAYTEST.md contains the guide. No DEV submission has been published. Offline reload and universal speech/screen-reader support are not claimed. The implementation can be played, but contest readiness must not be confused with verified user enjoyment or guaranteed winning prospects.
