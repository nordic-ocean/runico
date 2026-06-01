## Context

The add-cards flow in `prototype/app.jsx` currently seeds drafts from a static `DRAFT_QUEUE` and routes them through a working review/approve pipeline (`approveDrafts`, the draft-review screens, and `pendingDrafts` counters on scopes). Card shapes already exist: `qa`, `cloze`, `rev`, and `occlusion` (with `regions`). `add-openrouter-key-management` provides a credential store, a raw-key accessor for requests, and an availability status. This change swaps the mock source for a real OpenRouter call while leaving the entire review/approve experience untouched.

## Goals / Non-Goals

**Goals:**
- Produce real draft cards from user text (and images, model permitting) via a shared generation contract.
- Support two transports over that one contract: automatic (OpenRouter API) and manual (bring-your-own-chat copy/paste), with the manual path keyless.
- Reuse the existing draft queue and approval UI verbatim for both transports.
- Keep model choice to a single swappable field; default Gemini Flash, fallback DeepSeek.
- Fail safe: clear messages for missing key, rate limits, bad/unparseable responses, network errors.

**Non-Goals:**
- Changing the review/approve UI or card data model.
- Key storage/validation (owned by `add-openrouter-key-management`).
- A backend proxy for requests (owned by `add-electron-desktop-wrapper`).
- Streaming responses or chat-style multi-turn refinement.

## Decisions

- **Separate the generation *contract* from the *transport*.** The contract = one canonical prompt + one output format (`{kind,q,a,regions?}` JSON array) + one parser. Transports = (a) automatic OpenRouter API call, (b) manual bring-your-own-chat copy/paste. Both transports feed the same parser → drafts → review pipeline. *Alternative:* two independent generation paths — rejected; it would duplicate the prompt/parser and let the two drift, breaking the "same input feeds the system" requirement.
- **Manual transport is keyless and CORS-free by construction.** Copy the prompt (source embedded; image instructed to be attached in the user's chat), user runs it in ChatGPT/Claude/Gemini, pastes the answer back; the app only parses. This lets users on free/paid chat subscriptions generate cards with no API key or credit, and it never makes an external request from the app. *Alternative:* require everyone to get an OpenRouter key — rejected; excludes users who just want to use the chat they already pay for.
- **Single generation module: prompt → (request | paste) → parse.** One module exposes the prompt builder and the parser; the API transport adds request/send. Isolating it keeps the Electron change (route the API transport through the main process) to one call site and leaves the manual transport untouched.
- **Ask the model for strict JSON, parse defensively.** Request a JSON array of `{kind, q, a, regions?}`. Parse tolerant of extra prose/code fences; drop entries that don't validate rather than failing the batch. *Alternative:* trust raw text — rejected; flashcard quality and mapping need structure.
- **Map to existing kinds only.** Accept `qa`, `cloze`, `rev`, `occlusion`; coerce unknown kinds to `qa`. `occlusion` requires `regions` and an image, else downgrade to `qa`/skip.
- **Model as a persisted setting with a constant default.** `genModel` defaults to `google/gemini-3-flash-preview`; Settings offers a small curated list incl. `deepseek/deepseek-v4-flash`. Only the request's `model` field varies.
- **Gate on availability status, not raw key presence in the UI.** The add flow checks the status from the credentials capability; it reads the raw key only at request time through the store.

## Risks / Trade-offs

- **Model returns non-JSON / prose** → Defensive parse + "no cards could be generated" fallback; never crash the flow.
- **Browser CORS blocks the chat-completions call** → Known limitation of the browser prototype; surfaced as a network error with retry. Definitively resolved by the main-process proxy in `add-electron-desktop-wrapper`; keep the request in one function so re-routing is trivial.
- **Cost surprise from large inputs** → Cap/trim source length before sending and note approximate intent in the UI; Flash-tier pricing keeps this cheap.
- **Vision used on a text-only model** → Capability check warns the user before sending (see `generation-model-selection`).
- **Rate limits on busy free/Flash tiers** → Explicit rate-limit messaging; no auto-retry storms.

## Migration Plan

Additive. The mock `DRAFT_QUEUE` is replaced as the *source* of the add flow but the queue/review machinery stays; can keep `DRAFT_QUEUE` behind a "demo" path if a no-key fallback demo is desired. Rollback = point the add flow back at `DRAFT_QUEUE`. New optional storage key `runico:v1:genModel`.

## Open Questions

- Should a no-key user still see the mock `DRAFT_QUEUE` as a demo, or just a "add your key" prompt? (Leaning: demo fallback for the live GitHub Pages prototype.)
- Curated model list contents beyond the default + DeepSeek fallback — finalize from the live OpenRouter vision-capable list at implementation time.
