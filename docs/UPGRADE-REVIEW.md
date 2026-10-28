# October 29 staged upgrade review

## Stage gates

1. Baseline preserved: the six-record case, two deductions, hints and saved-game format remain compatible. Changes were made in the existing project and entry.
2. Retrieval: 12 exact passages, discovered-record corpus filtering, source validation, max-three distinct records and malformed-score tests. Twenty-two unit tests pass. New authored diagnostic: top-one expected source 9/12 semantic vs 6/12 keyword; top-three 12/12 vs 10/12. Tiny-corpus diagnostic, not independent usefulness evidence.
3. Comparison: two recovered transcripts, original source/timestamp, exact accessible labels; no auto-selected answer. Browser checks cover locked-record exclusion and mobile width.
4. Delivery: unused duplicate WASM removed; explicit opt-in cache package. Actual offline reload, save restoration and model inference passed at root and /dead-air/ subpath. Review found and corrected Vary-header cache matching, same-version retry data loss, cross-scope cache cleanup, manual/search display races and stale results after query edits.
5. Public release: https://dead-air-zeta.vercel.app passed the new integrated browser checks and full story with saved-ending reload. The existing DEV entry was updated with a 40-second scripted preview and current claims. Preview is automated, not human feedback. Production dependency audit reports zero known vulnerabilities.

## External/pending

The friend playtest and .tech registration are pending. No player quote, measured completion-time average, independent accuracy score, extra sponsor qualification or prize probability is claimed. A generative ghost, forced holiday imagery, silent model prefetch and filler records were deliberately excluded because they do not resolve the demonstrated weaknesses safely.

## Evidence

- upgrade-browser-result.json: latest public integrated checks
- browser-release-result.json: model/mobile/manual-topic checks
- eval/evidence-search-results.json: authored retrieval diagnostic
- GitHub source commit b32169a367785f6a2c21fc8aaec1a3941caccace
- Vercel deployment dead-7647ut1ri-yash-56e6.vercel.app
