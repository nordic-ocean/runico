## Context

Runico is a single-file React prototype (`prototype/app.jsx`, ~2700 lines) loaded via CDN, with all state mirrored to `sessionStorage` through `usePersistentState(key, initial)` under the `runico:v1:` prefix. Settings already live in `SettingsScreen` (`app.jsx:2142`), which today manages `language` and `theme`. There is no backend. The eventual goal is real AI card generation through OpenRouter, which requires a per-user API key. A separate later change will repackage the app in Electron and move key storage to the OS keychain — so the storage mechanism must be replaceable from day one.

## Goals / Non-Goals

**Goals:**
- Let each user supply, persist, validate, and clear their own OpenRouter key.
- Keep the key out of source control, logs, and shared infrastructure.
- Introduce a single seam (a credential store) so the backing store can later become the OS keychain with no caller changes.
- Expose only a derived availability status to the rest of the app, never the raw key.

**Non-Goals:**
- Making any card-generation request (that is `add-ai-card-generation`).
- OS keychain / `safeStorage` integration (that is `add-electron-desktop-wrapper`).
- Multi-key or multi-provider management — exactly one OpenRouter key.
- Server-side key storage or a proxy.

## Decisions

- **Credential store as a thin module, not direct `sessionStorage` calls.** Provide `credentialStore` with `getKey()`, `setKey(value)`, `clearKey()`, backed by `usePersistentState('openrouterKey', '')`. *Alternative considered:* call `sessionStorage` directly in Settings — rejected because the Electron change would then have to rewrite every call site. The store is the seam.
- **Store raw key in `sessionStorage`, mask only in the UI.** Masking is presentational; the raw value must be retrievable to make API calls. `sessionStorage` (not `localStorage`) matches the prototype's existing "resets when the tab closes" model and limits exposure window. *Alternative:* obfuscate at rest — rejected as false security in a browser; real at-rest protection is the keychain change.
- **Validation via a cheap OpenRouter call.** Hit an auth/models endpoint (e.g. `GET /api/v1/key` or `/api/v1/models` with the key) and map 2xx→valid, 401/403→invalid, network error→untested. *Alternative:* a tiny chat completion — rejected as it spends credit and is slower.
- **Availability status is derived, not stored separately.** Compute `none | present | valid | invalid` from "is a key saved?" plus the last validation result, so it cannot drift from the actual key.

## Risks / Trade-offs

- **Key readable in browser devtools / `sessionStorage`** → Accepted for the prototype; documented as the reason the Electron + keychain change exists. The store seam makes that upgrade cheap.
- **Validation endpoint shape may change** → Isolate the endpoint URL/parsing in one function so a change is one-line.
- **Accidental key logging during development** → Centralize all key access in the store; never pass the raw key to render paths or log statements; add a code-review note.
- **CORS on the validation call from the browser** → If OpenRouter blocks the browser-origin request, treat it as "untested" gracefully rather than erroring; full request reliability is solved by the main-process proxy in the Electron change.

## Migration Plan

Additive only — no existing data or behavior changes. New `sessionStorage` key `runico:v1:openrouterKey` appears once a user saves a key. Rollback = remove the Settings field and the store module; no migration needed since absence of the key simply means generation is unavailable.
