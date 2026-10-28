# Release evidence

## Current public release — October 28–29, 2026

The complete game is deployed at https://dead-air-zeta.vercel.app/. GitHub Pages remains an alternate. The Week 4 write-up is published at https://dev.to/yashanand69/dead-air-six-records-two-deductions-and-a-voice-the-archive-almost-lost-3mnl.

The six authored records, two deductions, ending, local save/recovery/reset and progressively explicit hints are implemented. All evidence can be read without sound. Receiver ambience is original synthesis; optional transcript reading uses a local device voice when the browser provides one. The in-app player guide explains the purpose, play loop, controls, AI download and saved progress.

## Verification before the upgrade

- TypeScript/Vite production builds and 16 engine/policy tests passed.
- Chrome automation completed the story and verified saved-ending reload.
- A 390px mobile viewport had no horizontal overflow; reduced motion and reset Escape behavior passed.
- Actual public browser model inference and topic confirmation passed without page errors.
- A Vercel browser check measured model readiness at **5,305 ms**. An earlier Pages check measured **43,574 ms**. Each is one connection measurement; neither is a universal benchmark or a controlled hosting comparison.
- The full dependency audit reported zero known vulnerabilities after the dependency updates at that time; repeat the audit when dependencies change.

The local automated walkthrough video contains spoilers. It is not a human trial. Browser screenshots and JSON files are artifacts of automated verification rather than user feedback.

## Why the matching interaction changed

The first design automatically opened a best-matching topic. On a 32-query diagnostic, it routed 14 of 23 in-scope queries to the expected topic; the keyword comparator routed 15. Eight of nine labeled out-of-scope questions abstained. Some query labels are debatable. Those results do not establish an advantage over keyword search or broad model accuracy.

The revised released interaction asks the player to confirm related-topic suggestions before showing an authored response. Expected-topic recall was 21/23 on the same in-scope queries after development changes. This is a reused diagnostic set, not new independent validation. All facts, legal unlocks and deductions stay authored and deterministic.

Historical evaluation files remain in `eval/`. New evidence-retrieval work needs fresh queries and an equivalent baseline; it must not inherit the old topic metrics as its own score.

## Delivery and integrity

The pinned quantized MiniLM model and ONNX runtime are served from the same origin. Initial AI use transfers about 44 MB uncompressed. Chunked source assets are reconstructed by `predev` and `prebuild`, with SHA-256 verification before serving.

The October 29 build cleanup removes an emitted WASM file only when its bytes match the explicitly configured public runtime. The configured runtime stays intact. This reduces deployment output by roughly 21.6 MB; it is not a claim of equivalent browser-transfer savings.

The build also emits `offline-assets.json` with paths and a content-derived version. A manifest alone does not prove offline support. Complete preparation, offline reload, inference and update behavior are the release gates for any offline claim.

## October 29 upgrade gate

Passage retrieval and comparison work is being integrated according to UPGRADE-IMPLEMENTATION-PLAN.md. New features remain unverified until the final browser results are recorded. The CI workflow now reconstructs assets once through prebuild and runs a built-site story check before Pages deployment.

## Limits and next evidence

One authored English-language case, limited replay value, and no genuine first-player trial yet. Source inspection reveals the mystery. Device narration varies, and no blanket screen-reader or educational-effectiveness certification is claimed. Friend feedback, permission to quote it, and actual .tech registration remain separate external steps.

## October 29 evidence-search upgrade

Twenty-two unit tests pass. The complete story and ending reload still pass. New browser coverage checks the two-source comparison, allowed-record passage search, mobile width, explicit offline preparation, offline reload with saved progress and actual offline model inference. Results are in upgrade-browser-result.json. The first offline check exposed a Vary-header cache mismatch; static-package matching was corrected and the full flow rerun. Independent review also corrected manual/search presentation races and preserved already complete offline packages on retry.

The build contains one runtime WASM; removal saves about 21.6 MB of deployment output. This does not establish equivalent per-player network savings.

The current AI interaction retrieves exact excerpts over 12 passages; manual authored topics remain available. eval/evidence-search-results.json contains a small authored 12-query diagnostic: expected source recall@3 is 12/12 semantic and 10/12 keyword. The questions were created for development, so this does not establish broad accuracy or measured player benefit. Historical topic-routing diagnostics remain unchanged.

A short scripted preview demonstrates the interface without solving the ending. It is an automated demonstration, not a genuine playtest or human reaction. Friend feedback and .tech registration remain pending.

On the same new diagnostic, top-one expected-source retrieval is 9/12 semantic versus 6/12 keyword. Top-three recall with so few candidate sources is permissive; neither score establishes real player usefulness.
