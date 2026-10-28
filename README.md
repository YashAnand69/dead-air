# Dead Air — The Last Sign-off

An original browser mystery about a disputed final radio broadcast. Tune three channels, recover six records, compare their sources and decide what the evidence proves.

**[Play Dead Air](https://dead-air-zeta.vercel.app/)** · **[Player guide](https://dead-air-zeta.vercel.app/#player-guide)** · **[Week 4 build story](https://dev.to/yashanand69/dead-air-six-records-two-deductions-and-a-voice-the-archive-almost-lost-3mnl)**

For Hacktoberfest Week 4, “Ghost in the Machine,” the haunting is a voice preserved in an archive. The investigation asks you to restore what can be established while accepting what remains unknown.

## Playing

No account, microphone or API key is required. Use the station buttons or frequency slider, open the available records and support each deduction with two records. Hints become progressively more explicit. Progress saves in this browser on this device; reset asks for confirmation.

Every record is readable without sound. Optional receiver ambience is synthesized, and transcript reading uses a local English device voice when available. Keyboard controls and reduced-motion preferences are supported. A first-player trial is pending, so play duration and enjoyment have not been measured with users.

The primary deployment is Vercel. [GitHub Pages](https://yashanand69.github.io/dead-air/) is an alternate; saved progress does not sync between the two addresses.

## The open model

A pinned, quantized [MiniLM embedding model](https://huggingface.co/Xenova/all-MiniLM-L6-v2) runs through Transformers.js and ONNX Runtime in a browser worker. Player questions are processed on the device. Model and runtime files ship with the application; first model use transfers approximately 44 MB uncompressed, with loading time dependent on the connection.

The model now retrieves up to three exact passages from records the player has recovered, with direct links to the original sources. A comparison desk places two recovered transcripts side by side. Neither feature selects a deduction for the player. Manual topics and browsing remain available without a model download.

The evidence corpus currently contains 12 passages from six authored records. A 12-query development diagnostic found the expected source in the top three results for 12/12 semantic queries and 10/12 keyword queries. Top-one source retrieval was 9/12 semantic and 6/12 keyword. These are small authored diagnostics with a tiny corpus; top-three retrieval is particularly permissive and neither metric establishes player benefit or broad accuracy.

Earlier automatic routing did not beat the keyword comparator on a small diagnostic. That result changed the interaction; it was not discarded. [Release evidence](docs/RELEASE.md) documents the measurements and limits.

## Run locally

Use Node 20.18+; CI runs Node 22.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:8894/`.

```sh
npm test
npm run build
```

Model source assets are stored as chunks for reproducible delivery. `predev` and `prebuild` reconstruct them and verify their SHA-256 hashes. For a repository subpath:

```sh
DEPLOY_BASE=/dead-air/ npm run build
```

The build removes a byte-identical unused runtime copy. In the player guide, “Save game for offline play” explicitly downloads the versioned app, fonts, model and runtime package. After preparation, offline reload, saved progress and real model search passed a browser check. A first visit needs internet; browser storage can be cleared or evicted. No model prefetch occurs just by entering the archive.

## Verification and contributions

- `npm test`: 22 engine, policy, passage-permission and worker-boundary regression tests.
- `GAME_URL=http://127.0.0.1:8896/ npm run test:upgrade`: comparison, real retrieval, mobile and offline-preparation/reload/inference checks against a running production preview.
- `GAME_URL=http://127.0.0.1:8894/ node tests/browser-smoke.cjs`: complete story and saved-ending reload, with the site running and Chrome installed.
- `node tests/release-check.cjs`: mobile, reduced-motion, reset and live model checks; uses `GAME_URL` when supplied.
- `eval/`: retained routing diagnostics, with the interpretation in [RELEASE.md](docs/RELEASE.md).
- [PLAYTEST.md](docs/PLAYTEST.md): the spoiler-free friend trial protocol.

CI builds the Pages variant and runs the story regression in Chrome before deployment. Local browser checks are automated checks, not evidence of real-player enjoyment. The static source contains the mystery's solution; normal-play visibility checks are not anti-cheat security.

## Credits and license

Created with AI assistance under Yash Anand's direction. Yash selected the creative direction and requested the usability, quality, guide and deployment refinements; agents assisted with implementation, research and verification. The story and characters are fictional.

Original source is MIT-licensed. Fonts, model and runtime retain their respective licenses; see [attribution](public/licenses/ATTRIBUTION.md). Narration is a device voice rather than an actor recording. The project has one English-language case, and broad screen-reader certification and first-player validation remain outstanding.
