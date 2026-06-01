## 1. Electron scaffold

- [ ] 1.1 Add `package.json` with `electron` and a builder/packager dev dependency, plus `dev` and `build` scripts
- [ ] 1.2 Create `main.js` that creates a `BrowserWindow` (`contextIsolation: true`, `nodeIntegration: false`) and loads the `prototype/` app
- [ ] 1.3 Add app lifecycle handling (quit-on-close per platform, basic application menu)
- [ ] 1.4 Verify `npm run dev` launches a window showing the existing Runico UI

## 2. IPC surface (preload)

- [ ] 2.1 Create `preload.js` exposing a minimal `contextBridge` API: `saveKey`, `clearKey`, `keyStatus`, `validate`, `generate`, plus save-document channels `loadData`, `saveData`, `saveMedia`, `loadMedia`, `exportBundle`, `importBundle`
- [ ] 2.2 Ensure no Node internals, no `fs`, and no raw key are ever exposed to the renderer

## 3. Keychain-backed storage (main)

- [ ] 3.1 Implement key persistence using `safeStorage.encryptString` / `decryptString`, storing ciphertext under `app.getPath('userData')`
- [ ] 3.2 Guard with `safeStorage.isEncryptionAvailable()`; if unavailable, warn and refuse to persist (no plaintext fallback)
- [ ] 3.3 Implement `saveKey`, `clearKey`, and a `keyStatus` that returns presence/validity only — never the raw key

## 4. Renderer credential adapter

- [ ] 4.1 Update the `credentialStore` adapter to detect the Electron preload API and route get/set/clear through IPC when present
- [ ] 4.2 Fall back to the existing `sessionStorage` backend in a plain browser
- [ ] 4.3 Confirm Settings and generation callers are unchanged (same store contract)

## 5. Main-process requests

- [ ] 5.1 Move the OpenRouter validation request into the main process behind `validate` IPC
- [ ] 5.2 Move the card-generation request into the main process behind `generate` IPC, attaching the keychain key there
- [ ] 5.3 Return only results/errors to the renderer; verify the key never crosses IPC to the renderer
- [ ] 5.4 Verify a request that the browser would block by CORS succeeds in the desktop app

## 6. Local save file (main + adapter)

- [ ] 6.1 Implement the save-document layer in the main process: load/save `data.json` (text) under `app.getPath('userData')`
- [ ] 6.2 Store images as binary files in a `media/` bundle, referenced by hash; de-duplicate identical images; never base64-embed in `data.json`
- [ ] 6.3 Auto-save text incrementally (rewrite only `data.json`, leave unchanged media) using temp-file-then-rename atomic writes
- [ ] 6.4 Implement export (zip the document = `data.json` + media) and import (restore full state)
- [ ] 6.5 Repoint the renderer's `usePersistentState` seam through the save-document layer (IPC in Electron) instead of `sessionStorage`
- [ ] 6.6 Implement the browser fallback: durable web storage (localStorage/IndexedDB) + the same export/import
- [ ] 6.7 Seed an empty/default library + fresh document on first run when none exists
- [ ] 6.8 Surface a clear message if a save document cannot be read; verify an interrupted write leaves the prior document intact

## 7. Web build parity & verification

- [ ] 7.1 Confirm the static/GitHub Pages build still runs in the browser with the durable web-store fallback
- [ ] 7.2 Verify desktop: save key → keychain, restart → key persists, clear → key removed
- [ ] 7.3 Verify end-to-end card generation in the desktop app with no CORS error
- [ ] 7.4 Verify save file: edits/history/settings persist across a restart; images land in `media/` and are shared, not duplicated
- [ ] 7.5 Verify export → fresh install → import restores the full state with media intact
- [ ] 7.6 Verify browser data survives closing and reopening the tab
- [ ] 7.7 Produce a local packaged build for the current platform (`npm run build`)

## 8. Deferred (future change)

- [ ] 8.1 Document code signing / notarization and installer distribution as a follow-up (not in this change)
- [ ] 8.2 Cloud sync across devices (out of scope; users can sync the save file themselves)
