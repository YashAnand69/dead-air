# Dead Air upgrade implementation plan

October 29, 2026. Execute in stages; preserve the existing story, saved games and published-entry identity.

## Stage 1: baseline and clean boundaries
Record the current build/test behavior. Preserve working changes. Agree contracts for evidence retrieval and comparison UI before parallel edits. Do not fabricate a development history, player feedback, benchmark superiority or partner eligibility.

## Stage 2: biggest weakness — evidence retrieval
Replace four-topic-only AI interaction with retrieval over exact passages from discovered records. Index explanatory search phrases separately from displayed verbatim evidence. Return at most three source-linked passages with an explicit “related evidence, not an answer” label; never generate facts or grade the player. Exclude locked and undiscovered records before sending any search corpus to the worker. Preserve manual topics, deterministic deductions and cancellation.
Gate: permissions/duplicates/invalid-score tests, new query evaluation with a comparable keyword baseline, actual browser model execution. Retain weak results honestly.

## Stage 3: comparison and story usability
Add an accessible two-record comparison board with source, clock basis and exact transcripts. Let players compare evidence without auto-selecting a solution. Add an archive correction interaction only if it improves clarity without changing the legal progression or inventing Mara's fate. Preserve current six-record case for this release; do not add filler to meet a count.
Gate: mobile/keyboard check, no locked-record leakage, reset and saved-ending regression, text-only completion.

## Stage 4: delivery and project presentation
Remove demonstrably unused duplicate WASM output with a narrowly scoped build step. Add accessible download progress, favicon/social metadata, clear primary demo link, up-to-date status docs and readable maintained source. Add browser-flow checks to CI if feasible. Implement explicitly requested offline preparation only with complete app/worker/model caching and a tested reload; otherwise record it as deferred, not complete.
Gate: tests, TypeScript/build, built-asset check, browser network inspection and actual inference. Do not equate deployment size savings with network savings.

## Stage 5: final review and release
Independent review of full diff and failure paths. Verify full game plus new search/comparison, fresh/reloaded storage, mobile and reduced motion. Deploy tested upgrades to the existing site, preserve one public entry, and revise its claims only to reflect verified behavior. Real friend trial, registrar checkout and permission to quote feedback remain external requirements. .tech eligibility is added only after a live verified domain exists.

## Subagent ownership
- Evidence-search agent: retrieval contracts/data/client/worker/policy and meaningful retrieval tests/evaluation.
- Comparison-UI agent: standalone accessible comparison/search-results components and their dedicated stylesheet; parent integrates App.
- Release-hygiene agent: README/status/stage docs, metadata/favicon/social asset, duplicate-runtime build handling and CI changes; no App or AI edits.
- Parent: integration, download UI/offline feasibility, critical review, browser verification and release.

## Cut line
Prioritize useful retrieval and comparison over a new generative model, new sponsor services or decorative expansion. An incompatible/untested model, invented user evidence, automatic background model download or unverifiable offline claim does not ship.
