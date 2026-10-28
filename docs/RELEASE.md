# Release candidate — October 28, 2026

## Implemented and verified locally

- Complete six-record case and two deterministic deductions, ending, local save/recovery/reset.
- Responsive radio interface, progress indicator, scroll reveals, restrained tuning and evidence motion, reduced-motion preference, keyboard controls and native reset dialog.
- Original receiver ambience and optional local-device transcript reader; no audio needed to solve.
- Same-origin pinned MiniLM model and runtime; actual fresh-browser model load measured at 937ms on this machine over localhost, followed by a real evidence response. This is not an internet cold-load benchmark.
- Production TypeScript/Vite build, 16 engine/policy tests, complete Chrome manual journey and ending reload passed. A 390px viewport had no horizontal overflow.
- Production dependency audit reports zero vulnerabilities after overriding the unused Node image dependency sharp to 0.35.5. Browser inference was checked with the installed dependency set.

## Model evaluation changed the product

The initial model design auto-opened a topic. A 32-query held-out diagnostic returned 14 direct correct routes out of 23 in-scope queries; the simple keyword comparator returned 15. Eight of nine labeled out-of-scope queries abstained. Some labels are inherently debatable (for example asking whether paperwork confirms receipt before specifying an archive record). These small results do not establish a semantic advantage or a 90% accuracy claim.

Consequently, the released interaction asks the player to confirm suggested related topics; it does not treat a similarity score as a factual answer. Locked topics remain filtered and all facts remain authored. The historical result files are retained, not overwritten with a claim of success. Later threshold changes mean those direct-routing numbers are not a metric for the current suggestion policy. More independent query testing is still valuable.

## Limits

One authored case; English-only; no real friend trial yet; no broad screen-reader certification; no offline-reload guarantee. Device narration may not be available. Public cold-download performance must be measured separately. Source inspection reveals the mystery, as expected for an open-source static game. The game is not a proven educational intervention or a guaranteed contest winner.

The implementation is playable; contest submission remains separate. No DEV article or challenge entry was published during this release work. A real trial and careful submission writing are still required for honest competition evidence.

## Final local verification

Updated Vite, Vitest and Playwright, then reran tests, build and browser verification. The full npm audit (including development dependencies) reported zero known vulnerabilities. Production-subpath model loading measured 926ms over localhost; no public-network claim is inferred. A real automated full-playthrough video is saved locally as docs/dead-air-walkthrough.webm. It contains spoilers and is not a human trial.

Model/runtime source assets are chunked solely to accommodate upload constraints. `npm run dev` and `npm run build` reconstruct them with SHA-256 verification before serving. Runtime game requests still use ordinary model files.
