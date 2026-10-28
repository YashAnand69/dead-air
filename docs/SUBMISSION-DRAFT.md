# Dead Air: six records, two deductions, and a voice the archive almost lost

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26).*

## What I Built

An abandoned radio station has a story on file. Its own records give you a reason to doubt it.

**Dead Air: The Last Sign-off** is a short, original browser mystery set around a fictional station's final broadcast. Tune three channels, recover six records, and support two deductions with evidence. The tension comes from a disagreement between sources: which account deserves to become the official story?

For “Ghost in the Machine,” I chose a quiet haunting: a voice preserved in an archive, waiting for someone to read the evidence carefully. There are no jump scares. The player restores what the records support, while accepting that some things remain unknown.

The practical goal is modest and specific: give someone a complete, low-friction mystery they can play in a browser during a short break. No account, microphone, API key or installation is required. The full story can be read without sound. Optional local AI helps a player find source passages in their own words; a comparison desk lets them place two recovered records side by side. The final reasoning stays theirs.

## Demo

**[Play Dead Air on Vercel](https://dead-air-zeta.vercel.app/)** · **[Read the spoiler-free player guide](https://dead-air-zeta.vercel.app/#player-guide)**

[Watch the approximately 40-second scripted preview](https://dead-air-zeta.vercel.app/media/dead-air-preview.webm). This demonstrates the interface; it is not a human playtest. It stops before the ending.

Allow roughly 10–15 minutes for a first play; that is a suggested time allowance, not a measured player average.

To try it:

1. Select **Enter the archive**, then explore the three channels using the station buttons or frequency slider.
2. Open the available records. Revisit their transcripts in **Your evidence**.
3. Choose a conclusion and exactly two supporting records, then select **Check the evidence**.
4. Follow the records unlocked by your deduction. Hints are available if you get stuck; later hints reveal the solution.

A wrong answer preserves progress. The investigation saves in this browser when local storage is available, so you can leave and return on the same device and site. Reset asks for confirmation.

**Optional AI:** select **Enable on-device AI**, ask about the discovered records, then inspect the retrieved passages and open their full source records. First use downloads about 44 MB of model and runtime files. If that is inconvenient, the manual topic buttons let you finish the whole case without downloading the model.

Sound is optional. Receiver ambience is synthesized; transcript narration, where available, uses a local device voice. The interface also offers reduced motion and keyboard controls.

## Code

[Source code, setup instructions and license](https://github.com/YashAnand69/dead-air)

The application is MIT-licensed. Model, runtime and font notices are included separately. It is a static React/TypeScript application built with Vite and hosted on Vercel, with a GitHub Pages deployment as well.

## How I Built It

### A bounded role for an open model

Dead Air uses the open-weight **Xenova/all-MiniLM-L6-v2** embedding model through **Transformers.js** and **ONNX Runtime** in a browser worker. Pinned model and runtime files are served with the application.

The model searches 12 exact passages from the six authored records. Only records the player has already recovered enter the search corpus. Results show up to three excerpts from distinct source records, each linked to its full transcript. Authored search descriptions help index the passages, but only verbatim evidence is displayed.

The flow is:

**Question → local embedding → recovered-passage ranking → exact excerpts and source links → player interpretation.**

Story progression follows a separate path:

**Selected conclusion + two selected records → deterministic validation → next stage.**

That separation keeps retrieval from rewriting a clue or accepting an unsupported conclusion. Source permissions are checked before inference and again when results are displayed. Questions are processed in the browser rather than sent to an inference service.

### The test that changed the interaction

An earlier version automatically opened the best-matching topic. On a small diagnostic set, it routed only **14 of 23 in-scope questions** to the expected topic; a simple keyword comparator managed **15 of 23**. That was a reason to change the interaction.

The revised design presents suggestions for confirmation. Expected-topic recall was **21/23 on the same in-scope queries**. Because those queries informed development, this is a diagnostic result, not independent validation or evidence of a general advantage over keyword search. Suggestions can still miss the player's intent, which is why manual topics remain available.

The October 29 upgrade gives retrieval a more concrete task: finding passages rather than routing to one of four topic buttons. A new 12-query authored diagnostic found an expected source among the first three results in 12/12 semantic queries and 10/12 keyword queries; the top result was an expected source in 9/12 and 6/12 respectively. The corpus is tiny and the questions are development diagnostics, so these results are not independent validation or a measurement of player benefit.

### What has been verified

- **22 automated tests** cover progression, retrieval permissions, invalid scores and the worker boundary.
- A browser check completed both deductions and reloaded the saved ending.
- Public Vercel checks covered mobile width, reduced motion, reset cancellation, actual model inference and exact source-passage retrieval, with no page errors.
- One fresh Vercel browser check loaded the model in **5.3 seconds**. An earlier GitHub Pages check took **43.6 seconds**. These are individual connection measurements, not a performance promise.

The build now emits only one copy of the runtime WASM, removing about 21.6 MB of deployment output. That is not a claim that each player transfers 21.6 MB less. In the guide, an explicit **Save game for offline play** action caches the app, fonts, model and runtime. Browser checks then disconnected the network, reloaded the game, restored progress and ran actual model search. Storage can still be cleared or evicted, and the first preparation needs internet.

### My contribution and the human decisions

I selected the radio-mystery direction and set the priorities for the experience: a complete story, a distinctive interface, practical play instructions and careful review. I requested successive UI and usability refinements, the in-app guide, and a Vercel deployment so someone could try the game directly. I brought in an external audit and requested staged improvements aimed at the weakest part of the project: useful AI and evidence comparison. I am also arranging a friend playtest to challenge the assumptions that automated checks cannot test.

AI agents assisted with research, implementation, writing and automated verification. Those contributions are part of the build process. My role has been to choose the direction, question the result, set the quality bar and decide what needs another pass. The friend trial is still pending; I am not claiming player feedback or measured enjoyment yet.

## Why Does Open Innovation Matter?

For this project, open tools make the question-to-topic interaction inspectable and self-hostable. Someone can examine the authored evidence, the matching policy and the model revision, then run or adapt the game without an inference-service account or per-question charges.

Local inference also keeps a player's questions out of an external AI service. Hosting the model with the application avoids relying on a live model provider to keep this particular interaction available.

There is a tradeoff: a small mystery still asks for a substantial first model download. A closed API might reduce that download, but would introduce a remote inference dependency. Here, local inference is optional, and the authored topic route keeps the game accessible when the download is a poor fit. Offline play requires successful preparation on that browser, and remains dependent on its stored files being retained.

## What Comes Next

The next useful evidence is a first-time player's experience: where they hesitate, whether the records make sense, and whether AI suggestions help. A friend trial is planned before the final revision of this entry.

Dead Air currently contains one English-language case. Replay value is limited once you know the solution, and device narration varies by browser. Its purpose is a small, finished investigation—not an endless generator of mysteries.

If you try it, tell me **where you first became unsure what to do**. That is the feedback most likely to make the next version better.
