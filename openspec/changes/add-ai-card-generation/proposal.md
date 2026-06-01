## Why

Runico's "Add cards from anything" flow currently displays a hardcoded `DRAFT_QUEUE` of mock cards. We replace the mock with real generation built around a single **generation contract** (one canonical prompt + one expected output format + one parser) that can be fed two ways: (1) the app calls OpenRouter directly with the user's key, or (2) the user runs the same prompt in **their own AI chat** (free or paid ChatGPT/Claude/Gemini) and pastes the result back. Both paths feed the identical parse → draft → review pipeline, so a user with no API key and no credit can still generate cards using a subscription they already have.

## What Changes

- Define one **generation contract**: a canonical card-generation prompt and a strict expected output format (a JSON array of `{ kind, q, a, regions? }`) plus one parser — reused by every input path.
- **Automatic transport (API):** replace the mock `DRAFT_QUEUE` source with a real OpenRouter call that sends the source material + prompt and parses the response. Default model **`google/gemini-3-flash-preview`**, fallback **`deepseek/deepseek-v4-flash`**, chosen in Settings.
- **Manual transport (bring-your-own-chat):** let the user **copy the ready-made prompt** (with their source embedded), run it in their own AI chat, and **paste the response** into the app. The paste runs through the **same parser** as the API path. No API key required.
- The add flow lets the user choose between "Generate with my key" and "Use my own AI" (copy prompt / paste result).
- Parse the response into Runico's existing card shapes (`qa`, `cloze`, `rev`, `occlusion`), tolerant of chat-wrapped output (markdown, code fences, surrounding prose).
- Add loading, empty, and error states; generated cards enter the **same draft-review queue** (`approveDrafts`) — nothing added without explicit approval.

## Capabilities

### New Capabilities
- `ai-card-generation`: the shared generation contract (prompt + output format + parser) and the automatic OpenRouter transport — request construction, structured-output parsing, and failure handling.
- `manual-card-generation`: the bring-your-own-chat transport — exposing the copyable prompt and accepting a pasted response, parsed via the same contract, with no API key required.
- `generation-model-selection`: choosing which OpenRouter model the automatic transport uses (default + fallback), surfaced in Settings.

### Modified Capabilities
<!-- None — the draft-review/approve flow is existing prototype code with no prior spec; it is consumed unchanged, not respecified here. -->

## Impact

- **Code**: `prototype/app.jsx` — the "add" screen/flow (transport choice, copy-prompt + paste-response UI), a generation module split into a shared contract/parser plus an API-transport function, Settings model picker; reuses `approveDrafts` and the draft-review screens.
- **Depends on**: `add-openrouter-key-management` (key + availability status + credential store) — required only for the automatic transport; the manual transport is keyless.
- **External**: OpenRouter chat-completions endpoint for the automatic transport; the manual transport reaches no external service from the app.
- **Storage**: optional `runico:v1:genModel` for the selected model; generated drafts use existing draft-queue state.
- **Downstream**: `add-electron-desktop-wrapper` later routes the automatic transport's requests through the Electron main process to avoid browser CORS; the manual transport already sidesteps CORS entirely.
