## Context

Runico is a static browser prototype (`prototype/index.html` + `app.jsx`) deployed to GitHub Pages. After `add-openrouter-key-management` and `add-ai-card-generation`, the key lives in `sessionStorage` behind a `credentialStore` seam, and OpenRouter requests are made from a single generation/validation function in the renderer — both subject to browser limits (key visible in devtools; CORS on provider calls). Electron resolves both: `safeStorage` + OS keychain for the key, and main-process networking with no CORS. The existing seams (`credentialStore`, the request function) are exactly the injection points this change targets, so feature code stays put.

## Goals / Non-Goals

**Goals:**
- Run the existing renderer in an Electron window with no UI fork.
- Store the key in the OS keychain via `safeStorage`; keep the raw key in the main process only.
- Move OpenRouter validation + generation requests to the main process over IPC, removing CORS.
- Persist all user data to a single user-owned save document (`data.json` + `media/` bundle) with load, auto-save, and export/import; satisfy `library-model`'s durable-persistence requirement.
- Keep the web/GitHub Pages build fully functional as the default lightweight target, with a durable web-store fallback + the same export/import.
- Provide a dev-run command and a packaging command.

**Non-Goals:**
- Code signing, notarization, and public installer distribution (deferred — cost, Apple/Windows certs).
- Auto-update infrastructure.
- Rewriting to a different shell (Tauri) — Electron chosen to reuse JS and the existing code directly.
- Changing any Runico feature behavior or UI.

## Decisions

- **Electron with a thin main + preload, renderer = existing prototype.** `main.js` creates the window and loads the prototype; `preload.js` exposes a minimal, typed IPC surface via `contextBridge`. *Alternative:* Tauri — rejected for this user (Rust toolchain); Electron reuses the all-JS code with least friction.
- **`contextIsolation: true`, `nodeIntegration: false`.** The renderer gets only the whitelisted IPC channels (`saveKey`, `clearKey`, `keyStatus`, `generate`, `validate`, plus save-document channels `loadData`, `saveData`, `saveMedia`, `loadMedia`, `exportBundle`, `importBundle`) — never Node, the filesystem, or the raw key. *Alternative:* expose Node/`fs` to the renderer — rejected as insecure and unnecessary.
- **Keychain via `safeStorage.encryptString`, persisted as ciphertext.** Store the encrypted blob in `app.getPath('userData')`; decrypt in-memory in the main process only when making a request. *Alternative:* a third-party keytar dependency — rejected; built-in `safeStorage` covers all three platforms.
- **Renderer credential adapter picks backend by environment.** If the Electron preload API is present, the `credentialStore` adapter routes to IPC; otherwise it uses the existing `sessionStorage` backend. This honors the contract from `add-openrouter-key-management` with zero changes to Settings/generation callers.
- **Relocate the request function to the main process.** The renderer calls `ipc.generate(payload)` / `ipc.validate()`; the main process attaches the key and calls OpenRouter. The renderer never sees the key and never hits CORS. *Alternative:* keep requests in renderer with the key passed in — rejected; defeats the keychain protection and keeps CORS.
- **Single save document: `data.json` (text) + `media/` (images by hash).** All user state persists to one user-owned document under `app.getPath('userData')`; images are written as binary files referenced by hash, never base64-embedded. *Alternative considered:* base64 images inside one JSON — rejected; ~33% size tax and whole-file rewrites on every auto-save make it bloat and stutter at scale (hundreds of cards with figures). *Alternative:* SQLite — deferred; JSON+media is simpler for v1 and the state is already serializable JSON in the prototype.
- **Auto-save writes text incrementally and atomically.** Only `data.json` is rewritten on a text change (media untouched); writes go to a temp file then rename so an interrupted save never corrupts the good document. *Alternative:* rewrite everything each save — rejected; slow and corruption-prone.
- **Export/import is a zipped bundle of the document.** One portable file (data + media) for backup/move, mirroring how apps like Anki package a collection. The user owns and can sync the file themselves.
- **Storage adapter selects backend by runtime.** The same `usePersistentState` seam writes through the save-document layer: main-process `fs` in Electron, durable web storage (localStorage/IndexedDB) + manual export/import in the browser. This replaces `sessionStorage` while keeping feature code unchanged. *Alternative:* keep `sessionStorage` in the browser — rejected; data would vanish on tab close, violating durable persistence.

## Risks / Trade-offs

- **`safeStorage` availability varies (e.g. Linux needs a keyring/libsecret)** → Detect `safeStorage.isEncryptionAvailable()`; if false, warn the user and refuse to persist rather than storing plaintext.
- **Renderer–main contract drift** → Keep the IPC surface tiny and centralized in `preload.js`; mirror the `getKey/setKey/clearKey` + `generate/validate` shape already used.
- **Distribution friction (unsigned app warnings)** → Explicitly deferred; dev-run and local builds are the deliverable. Document signing as future work.
- **Larger artifact (~150 MB)** → Accepted; the web build stays the lightweight default for casual users.
- **Two code paths (web vs desktop) for storage/requests** → Single adapter with environment detection keeps the divergence to one file each.

## Migration Plan

Additive and parallel to the web build. Add Electron files + `package.json` scripts; the renderer gains an environment check that selects the keychain/IPC + save-file backend when running in Electron and the durable web-store backend otherwise. On first run with no save document, the app seeds an empty/default library and writes a fresh document. Rollback = stop building the Electron target; the browser build is unaffected because the adapter falls back to durable web storage. Distribution (signing/notarization/installers) is a separate future change.

## Open Questions

- Packager choice (electron-builder vs electron-forge) — pick at implementation based on simplest cross-platform dev-run.
- Export bundle format detail (plain `.zip` vs a named `.runico` extension wrapping the same zip) — cosmetic; decide at implementation.
