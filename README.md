# Dead Air — The Last Sign-off

An original short browser mystery about a radio broadcast and a mistaken archive. Recover six records, compare independent clocks and correct the account using evidence.

Play: https://yashanand69.github.io/dead-air/

## Play and run

The game requires no account or API key. Use the radio station buttons or keyboard-operable tuner, inspect records, and support each deduction with two pieces of evidence. Hints are optional. Progress is saved locally; Reset clears it.

Node 20.18+ (CI uses Node 22):

```sh
npm ci
npm run dev
npm test
npm run build
```

The local address is http://127.0.0.1:8894/. For a repository subpath, build with `DEPLOY_BASE=/dead-air/ npm run build`.

## Open model and honest boundaries

A pinned quantized MiniLM model runs through Transformers.js/ONNX Runtime in a browser worker. Questions remain on the device. Model and runtime files are shipped with the site, rather than fetched from an inference service. First AI use transfers roughly 44 MB uncompressed; public network speed varies.

The model suggests related available topics; the player confirms a topic before an authored response opens. It does not generate evidence, grade accusations, or know hidden clues. Early direct-answer routing performed poorly in testing, so automatic answers were removed. This is semantic search, not an autonomous ghost. Manual topics remain available and explicitly labeled.

Static source includes the solution. The permission checks prevent accidental spoilers through normal UI interactions, not deliberate inspection of source files. No account, private uploads, microphone capture or tracking is required.

## Access and audio

All evidence is readable without audio. Keyboard controls, captions/transcripts, reduced motion, restart and save recovery are supported. Receiver ambience is original synthesis. Optional transcript reading uses an English local device voice if available; voice quality and availability vary. No recorded actor performance is claimed. Offline reload is not promised.

## Verification

`npm test`: engine and semantic-policy tests. `node tests/browser-smoke.cjs`: complete manual game and saved-ending reload in installed Chrome, with the dev server running. `node eval/browser-eval.cjs` and `node eval/heldout.cjs`: historical routing evaluations (see limitations in docs/RELEASE.md). No real-user trial is claimed. The friend trial guide is in docs/PLAYTEST.md.

## Credits

Created with AI assistance under Yash Anand's direction. Original fictional characters and story. MIT for original source; third-party fonts, model and runtime retain their own licenses. See public/licenses/ATTRIBUTION.md and accompanying notices. Do not present device narration as a human recording or the automated checks as user feedback.
