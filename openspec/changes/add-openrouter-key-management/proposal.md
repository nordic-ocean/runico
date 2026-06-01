## Why

Runico's "draft cards from anything" feature is currently mocked — it shows a pre-baked `DRAFT_QUEUE` instead of calling a real model. To wire in real AI generation (next change), the app first needs a way for each user to supply and store their **own** OpenRouter API key. Because the prototype runs entirely in the browser, the key must never be hardcoded or shared; it belongs to the user and stays on their device.

## What Changes

- Add an **OpenRouter API key** field to the Settings screen (`SettingsScreen`, `app.jsx:2142`), with masked display, save, and clear actions.
- Persist the key through a **pluggable credential store** abstraction (default backend: the existing `sessionStorage`-based `usePersistentState`), so a later change can swap in an OS keychain without touching callers.
- Add a lightweight **key validation** action that calls OpenRouter's models/auth endpoint to confirm the key works, surfacing a clear status (untested / valid / invalid).
- Expose a read-only **key-status indicator** so the rest of the app can tell whether generation is available, without ever reading the raw key into UI components.
- The key is **never logged**, never sent anywhere except OpenRouter, and is cleared from storage on "Clear key".

## Capabilities

### New Capabilities
- `openrouter-credentials`: entering, masking, persisting, validating, and clearing a user-supplied OpenRouter API key through a swappable storage backend, plus a derived availability status other features can read.

### Modified Capabilities
<!-- None — openspec/specs/ is empty; this is the first change. -->

## Impact

- **Code**: `prototype/app.jsx` — new Settings field + handlers; a small credential-store module/helper; reuse of `usePersistentState`.
- **Storage**: new `sessionStorage` key under the `runico:v1:` prefix (e.g. `runico:v1:openrouterKey`).
- **External**: one optional network call to OpenRouter for key validation; no new build dependencies.
- **Downstream**: unblocks `add-ai-card-generation`; the store abstraction is the seam `add-electron-desktop-wrapper` later replaces with the OS keychain.
