## Why

Runico runs in the browser, where a user's OpenRouter key can only sit in `sessionStorage` and requests are subject to CORS. Packaging Runico as an Electron desktop app makes "the user's key stays on their machine" the natural design: the key is stored in the OS keychain via Electron's `safeStorage`, and OpenRouter requests run from the Node main process, which has no CORS restrictions. The existing `prototype/` web code is reused as the renderer with minimal change.

## What Changes

- Add an **Electron shell** that loads the existing `prototype/` app as its renderer, plus an app window, menu, and lifecycle handling.
- Add a **secure key-storage backend** implementing the credential-store contract from `add-openrouter-key-management`, backed by Electron `safeStorage` + the OS keychain (Keychain / Credential Manager / libsecret) instead of `sessionStorage`.
- Route OpenRouter requests (validation from `add-openrouter-key-management`, generation from `add-ai-card-generation`) through the **main process** via IPC, eliminating browser CORS and keeping the raw key in the main process.
- Add a **local save file**: persist all user data (library, cards, history, settings) to a single user-owned save document — `data.json` plus a `media/` image bundle — with load-on-launch, auto-save, and export/import, replacing the prototype's `sessionStorage` scaffolding. Images are stored as referenced media files, never base64-embedded in the JSON.
- Add **build/packaging** config to produce a runnable desktop app (dev run first; installers/signing tracked but deferred).
- Web (GitHub Pages) build keeps working unchanged — Electron is an additional target, not a replacement — and gains a durable web-store fallback + the same export/import.

## Capabilities

### New Capabilities
- `desktop-shell`: an Electron application that hosts the existing Runico renderer, manages the window/menu/lifecycle, and provides the dev-run and packaging entry points.
- `desktop-secure-storage`: an OS-keychain-backed implementation of the credential store (via `safeStorage`) plus a main-process request path so the raw key never lives in the renderer or hits CORS.
- `local-save-file`: persisting all user data to a single user-owned save document (`data.json` + a `media/` bundle) with load, auto-save, export/import, and corruption-resilient writes; plus a durable browser fallback.

### Modified Capabilities
<!-- None — the credential-store contract and the generation request function are consumed via their existing seams; this change supplies new backends behind them rather than respecifying their requirements. `library-model`'s durable-persistence requirement (in implement-prototype-features) is satisfied by `local-save-file`, not respecified here. -->

## Impact

- **Code**: new Electron `main` and `preload` scripts; `package.json` with Electron + builder deps and run/build scripts; a renderer-side credential-store adapter that calls IPC when running in Electron and falls back to durable web storage in the browser; a save-document layer (main-process `fs` for the desktop file/bundle, web-store + export/import for the browser) replacing `usePersistentState`'s `sessionStorage` writes.
- **Depends on**: `add-openrouter-key-management` (store seam) and `add-ai-card-generation` (the request function to relocate); satisfies `library-model`'s durable-persistence requirement from `implement-prototype-features`.
- **Dependencies (new)**: `electron`, an Electron builder/packager; uses built-in `safeStorage`.
- **Platforms**: macOS, Windows, Linux. Code signing/notarization is required for friction-free distribution and is **deferred** (cost + certs).
- **Repo**: app size grows (~150 MB bundled Chromium per build); the web prototype remains the lightweight default.
