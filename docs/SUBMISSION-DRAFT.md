# Dead Air: the ghost can suggest a record, but it cannot rewrite the past

Draft only. Reapply the current Week 4 submission template and tag before publishing. No entry agreement or publication is implied.

An old radio archive says a warning was never confirmed. A voice says the time is wrong. In Dead Air, you tune three channels, recover six fictional records, and decide what the evidence actually establishes.

## Play

Public URL pending deployment verification. Source: https://github.com/YashAnand69/dead-air

The game includes two deductions, a complete ending, saved progress, manual topic exploration, reduced motion and a fully readable route without sound. Receiver ambience is original synthesis. Optional narration is a local device voice, not a recorded actor.

## Why an open model

A pinned MiniLM embedding model runs through Transformers.js and ONNX Runtime inside a browser worker. It suggests relevant available topics for questions written in the player's own words. There is no inference API key or per-question service. The model and runtime ship with the site, and questions remain on the device.

The model does not write clues, unlock hidden records or grade the solution. Players choose a suggested topic before reading its authored response. Final deductions use explicitly selected evidence and deterministic rules.

## The failure that changed the interaction

The first version auto-opened the best matching topic. That was unreliable: on a small 32-query diagnostic set, only 14 of 23 in-scope questions routed directly to the expected topic, compared with 15 for a simple keyword comparator. We kept the results instead of calling it intelligent conversation.

The revised interface offers related-topic suggestions for confirmation. Its expected-topic recall was 21/23 on the same in-scope diagnostic queries. That is a development check after an interaction change, not a fresh independent evaluation or a claim of broad accuracy. Some questions still produce unhelpful suggestions. All authored topics remain available manually.

## Craft and verification

The clock discrepancy, independent receiver acknowledgment and final correction were authored as one coherent fictional case. A review caught an important timing ambiguity: the final transmitter entry is a checkpoint during an ongoing warning, not the start of a message somehow delivered in two seconds.

Sixteen automated regression tests cover progression and suggestion permissions. Browser checks exercised the complete manual story, saved-ending reload, mobile width, reduced-motion mode, reset behavior and real on-device inference in the production subpath. Public-internet loading measurements must be added after verification; local loading numbers cannot stand in for them.

## Human role and assistance

Yash selected the radio mystery direction, set the quality and usability priorities, and arranged access to a potential friend tester. AI agents assisted with research, implementation and automated checks. No friend feedback or original human voice performance has yet been collected, and none is claimed here.

## Limits and next work

One case, English-only, limited replay value. Device narration varies. There is no offline-reload guarantee or blanket accessibility certification. A genuine first-player trial remains necessary before making claims about puzzle clarity or enjoyment. The source intentionally contains the solution; ordinary-play spoiler checks are not anti-cheat security.

## Before publishing

Verify public demo and source links, add a real demo video, report actual friend feedback if obtained, apply current challenge template/tag, check meaningful partner eligibility, and obtain the separate Week 4 entry confirmation. Do not claim a partner category merely because an unrelated library is present.
